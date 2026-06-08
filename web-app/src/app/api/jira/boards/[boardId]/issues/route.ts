import { NextRequest, NextResponse } from "next/server";

import { getBoardIssues } from "@shared/jira";

const BASE_URL = process.env.NEXT_PUBLIC_JIRA_BASE_URL ?? "";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  if (!BASE_URL) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_JIRA_BASE_URL is not configured" },
      { status: 500 }
    );
  }

  const { boardId } = await params;
  const auth = req.headers.get("x-jira-auth");

  if (!auth) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 401 });
  }

  const decoded = Buffer.from(auth, "base64").toString();
  const colonIdx = decoded.indexOf(":");
  const username = decoded.slice(0, colonIdx);
  const password = decoded.slice(colonIdx + 1);

  if (!username || !password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  try {
    const { issues, total, startAt } = await getBoardIssues(
      { baseUrl: BASE_URL, username, password },
      Number(boardId)
    );
    return NextResponse.json({ issues, total, startAt });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch issues";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
