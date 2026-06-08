import { NextRequest, NextResponse } from "next/server";

import { getBoardSprintHistory } from "@shared/jira";
import { getJiraSession } from "@/lib/jira/session";
import { getAnalysesByBoard } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_JIRA_BASE_URL ?? "";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await params;

  if (!boardId) {
    return NextResponse.json({ error: "boardId gerekli" }, { status: 400 });
  }

  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Math.min(Math.max(Number(limitParam), 1), 100) : 10;

  const session = await getJiraSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  const decoded = Buffer.from(session.credentials, "base64").toString();
  const colonIdx = decoded.indexOf(":");
  const username = decoded.slice(0, colonIdx);
  const password = decoded.slice(colonIdx + 1);

  const [sprints, analyses] = await Promise.all([
    BASE_URL
      ? getBoardSprintHistory({ baseUrl: BASE_URL, username, password }, Number(boardId), limit).catch(() => [])
      : Promise.resolve([]),
    Promise.resolve(getAnalysesByBoard(boardId)),
  ]);

  return NextResponse.json({ boardId, sprints, analyses });
}
