import { cookies } from "next/headers";

export const JIRA_SESSION_COOKIE = "jira_session";

export type JiraSessionUser = {
  accountId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
};

export type JiraSession = {
  credentials: string; // base64(username:password)
  user: JiraSessionUser;
};

export async function getJiraSession(): Promise<JiraSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(JIRA_SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString()) as JiraSession;
  } catch {
    return null;
  }
}
