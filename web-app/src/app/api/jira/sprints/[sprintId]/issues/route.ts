import { NextRequest, NextResponse } from "next/server";

import { getSprintIssues, type SprintWithIssues } from "@shared/jira";
import { getJiraSession } from "@/lib/jira/session";
import { getCachedSprintIssuesJson, upsertSprintIssuesJson } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_JIRA_BASE_URL ?? "";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sprintId: string }> },
) {
  if (!BASE_URL) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_JIRA_BASE_URL is not configured" },
      { status: 500 },
    );
  }

  const { sprintId } = await params;
  const sprintIdNum = Number(sprintId);
  if (!Number.isInteger(sprintIdNum) || sprintIdNum <= 0) {
    return NextResponse.json({ error: "Geçersiz sprintId" }, { status: 400 });
  }

  // 1-günlük cache kontrolü
  const cached = getCachedSprintIssuesJson(sprintIdNum);
  if (cached) {
    return NextResponse.json(JSON.parse(cached) as SprintWithIssues);
  }

  // token query param'ı varsa kullan, yoksa session'dan al
  const tokenParam = req.nextUrl.searchParams.get("token");

  let username: string;
  let password: string;

  if (tokenParam) {
    // token = base64(username:password)
    const decoded = Buffer.from(tokenParam, "base64").toString();
    const colonIdx = decoded.indexOf(":");
    if (colonIdx === -1) {
      return NextResponse.json(
        { error: "Geçersiz token formatı. base64(username:password) bekleniyor" },
        { status: 400 },
      );
    }
    username = decoded.slice(0, colonIdx);
    password = decoded.slice(colonIdx + 1);
  } else {
    const session = await getJiraSession();
    if (!session) {
      return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
    }
    const decoded = Buffer.from(session.credentials, "base64").toString();
    const colonIdx = decoded.indexOf(":");
    username = decoded.slice(0, colonIdx);
    password = decoded.slice(colonIdx + 1);
  }

  try {
    const sprint = await getSprintIssues(
      { baseUrl: BASE_URL, username, password },
      sprintIdNum,
    );

    // DB'ye yaz
    upsertSprintIssuesJson(sprintIdNum, JSON.stringify(sprint));

    return NextResponse.json(sprint);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sprint taskleri alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
