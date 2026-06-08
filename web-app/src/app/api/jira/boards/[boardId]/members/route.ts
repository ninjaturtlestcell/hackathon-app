import { NextRequest, NextResponse } from "next/server";

import { getBoardMembers } from "@shared/jira";
import { getJiraSession } from "@/lib/jira/session";

const BASE_URL = process.env.NEXT_PUBLIC_JIRA_BASE_URL ?? "";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  if (!BASE_URL) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_JIRA_BASE_URL is not configured" },
      { status: 500 },
    );
  }

  const { boardId } = await params;

  const session = await getJiraSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  const decoded = Buffer.from(session.credentials, "base64").toString();
  const colonIdx = decoded.indexOf(":");
  const username = decoded.slice(0, colonIdx);
  const password = decoded.slice(colonIdx + 1);

  try {
    const members = await getBoardMembers(
      { baseUrl: BASE_URL, username, password },
      Number(boardId),
    );
    return NextResponse.json({ members });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch members";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
