import { NextResponse } from "next/server";

import { JIRA_SESSION_COOKIE } from "@/lib/jira/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(JIRA_SESSION_COOKIE);
  return response;
}
