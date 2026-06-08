import { NextRequest, NextResponse } from "next/server";

import { verifyJiraAuth } from "@shared/jira";
import { JIRA_SESSION_COOKIE, type JiraSession } from "@/lib/jira/session";

const BASE_URL = process.env.NEXT_PUBLIC_JIRA_BASE_URL ?? "";

export async function POST(req: NextRequest) {
  if (!BASE_URL) {
    return NextResponse.json(
      { error: "JIRA_BASE_URL yapılandırılmamış" },
      { status: 500 },
    );
  }

  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "Kullanıcı adı ve şifre gerekli" },
      { status: 400 },
    );
  }

  try {
    const jiraUser = await verifyJiraAuth({ baseUrl: BASE_URL, username, password });

    const session: JiraSession = {
      credentials: Buffer.from(`${username}:${password}`).toString("base64"),
      user: {
        accountId: jiraUser.accountId ?? "",
        displayName: jiraUser.displayName ?? jiraUser.name ?? username,
        email: jiraUser.emailAddress ?? username,
        avatarUrl: (jiraUser.avatarUrls as Record<string, string> | undefined)?.[
          "48x48"
        ],
      },
    };

    const sessionValue = Buffer.from(JSON.stringify(session)).toString("base64");

    const response = NextResponse.json({ user: session.user });
    response.cookies.set(JIRA_SESSION_COOKIE, sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Giriş başarısız";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
