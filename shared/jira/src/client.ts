import { AgileClient, Version2Client } from "jira.js";
import type { AgileModels, Version2Models } from "jira.js";

export interface JiraCredentials {
  baseUrl: string;
  /** Username (Server/DC) or email (Cloud) */
  username: string;
  /** Password (Server/DC) or API token (Cloud) */
  password: string;
}

function makeConfig(creds: JiraCredentials) {
  return {
    host: creds.baseUrl,
    authentication: {
      basic: {
        // jira.js maps email → login, apiToken → secret for Basic auth header.
        // For Jira Server/DC, passing username as email and password as apiToken
        // produces the correct Authorization: Basic base64(username:password).
        email: creds.username,
        apiToken: creds.password,
      },
    },
  } as const;
}

export function createVersion2Client(creds: JiraCredentials): Version2Client {
  return new Version2Client(makeConfig(creds));
}

export function createAgileClient(creds: JiraCredentials): AgileClient {
  return new AgileClient(makeConfig(creds));
}

export async function verifyJiraAuth(
  creds: JiraCredentials
): Promise<Version2Models.User> {
  const client = createVersion2Client(creds);
  return client.myself.getCurrentUser();
}

export async function getBoardIssues(
  creds: JiraCredentials,
  boardId: number,
  maxResults = 100
): Promise<{ issues: AgileModels.Issue[]; total: number; startAt: number }> {
  const client = createAgileClient(creds);
  const result = await client.board.getIssuesForBoard({ boardId, maxResults });
  console.log("[jira] getIssuesForBoard raw:", {
    total: result.total,
    startAt: result.startAt,
    maxResults: result.maxResults,
    issuesLength: result.issues?.length,
  });
  return {
    issues: result.issues ?? [],
    total: result.total ?? 0,
    startAt: result.startAt ?? 0,
  };
}
