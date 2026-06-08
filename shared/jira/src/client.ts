import { AgileClient, Version2Client } from "jira.js";
import type { AgileModels, Version2Models } from "jira.js";

export interface SprintIssue {
  id: string;
  key: string;
  summary: string;
  status: {
    id: string;
    name: string;
    statusCategory: { id: number; key: string; name: string } | null;
  };
  issueType: string;
  storyPoints: number | null;
  assignee: string | null;
  priority: string | null;
  labels: string[];
}

export interface SprintWithIssues {
  id: number;
  name: string;
  state: string;
  startDate: string | null;
  endDate: string | null;
  completeDate: string | null;
  goal: string | null;
  issues: SprintIssue[];
}

export interface SprintSummary {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  completeDate: string | null;
  totalStoryPoints: number;
}

const STORY_POINT_FIELDS = [
  "story_points",
  "customfield_10016",
  "customfield_10028",
  "customfield_10004",
  "customfield_10014",
  "customfield_10106",
];

function extractStoryPoints(fields: AgileModels.Fields): number | null {
  // Try common story points field names across Jira Cloud and Server/DC
  const candidates = [
    fields.story_points,
    fields.customfield_10016,
    fields.customfield_10028,
    fields.customfield_10004,
    fields.customfield_10014,
    fields.customfield_10106,
  ];
  for (const v of candidates) {
    if (typeof v === "number" && !isNaN(v)) return v;
  }
  return null;
}

function mapIssue(issue: AgileModels.Issue): SprintIssue {
  const f: AgileModels.Fields = issue.fields as AgileModels.Fields;
  if (!f) {
    return {
      id: issue.id ?? "",
      key: issue.key ?? "",
      summary: "",
      status: { id: "", name: "", statusCategory: null },
      issueType: "",
      storyPoints: null,
      assignee: null,
      priority: null,
      labels: [],
    };
  }

  const status = f.status as AgileModels.Status | undefined;
  const issueType = f.issuetype as { name?: string } | undefined;
  const assignee = f.assignee as { displayName?: string } | null | undefined;
  const priority = f.priority as { name?: string } | null | undefined;

  return {
    id: issue.id ?? "",
    key: issue.key ?? "",
    summary: (f.summary as string) ?? "",
    status: {
      id: status?.id ?? "",
      name: status?.name ?? "",
      statusCategory: status?.statusCategory
        ? {
            id: (status.statusCategory as { id: number }).id,
            key: (status.statusCategory as { key: string }).key ?? "",
            name: (status.statusCategory as { name: string }).name ?? "",
          }
        : null,
    },
    issueType: issueType?.name ?? "",
    storyPoints: extractStoryPoints(f),
    assignee: assignee?.displayName ?? null,
    priority: priority?.name ?? null,
    labels: Array.isArray(f.labels) ? (f.labels as string[]) : [],
  };
}

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

export interface BoardSummary {
  id: number;
  name: string;
  type: string;
  projectKey?: string;
  projectName?: string;
}

export async function getAllBoards(creds: JiraCredentials): Promise<BoardSummary[]> {
  const client = createAgileClient(creds);
  const all: BoardSummary[] = [];
  let startAt = 0;
  const maxResults = 50;
  while (true) {
    const result = await client.board.getAllBoards({ startAt, maxResults });
    const values = result.values ?? [];
    for (const b of values) {
      all.push({
        id: b.id ?? 0,
        name: b.name ?? "",
        type: b.type ?? "",
        projectKey: b.location?.projectKey,
        projectName: b.location?.projectName,
      });
    }
    if (result.isLast || all.length >= (result.total ?? 0) || values.length < maxResults) break;
    startAt += values.length;
  }
  return all;
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

async function fetchAllPages<T>(
  fetcher: (startAt: number) => Promise<{
    values?: T[];
    total?: number;
    maxResults?: number;
    isLast?: boolean;
  }>,
  pageSize = 50
): Promise<T[]> {
  const all: T[] = [];
  let startAt = 0;
  while (true) {
    const page = await fetcher(startAt);
    const values = page.values ?? [];
    all.push(...values);
    if (page.isLast || all.length >= (page.total ?? 0) || values.length < pageSize) break;
    startAt += values.length;
  }
  return all;
}

async function fetchAllIssuePages(
  client: AgileClient,
  sprintId: number,
  fields?: string[]
): Promise<AgileModels.Issue[]> {
  const PAGE = 200;
  const all: AgileModels.Issue[] = [];
  let startAt = 0;
  while (true) {
    const page = await client.sprint.getIssuesForSprint({
      sprintId,
      startAt,
      maxResults: PAGE,
      fields,
    });
    const issues = page.issues ?? [];
    all.push(...issues);
    if (all.length >= (page.total ?? 0) || issues.length < PAGE) break;
    startAt += issues.length;
  }
  return all;
}

export async function getBoardBacklog(
  creds: JiraCredentials,
  boardId: number
): Promise<SprintIssue[]> {
  const client = createAgileClient(creds);
  const PAGE = 100;
  const all: AgileModels.Issue[] = [];
  let startAt = 0;
  while (true) {
    const page = await client.board.getIssuesForBacklog({
      boardId,
      startAt,
      maxResults: PAGE,
    });
    const issues = page.issues ?? [];
    all.push(...issues);
    if (all.length >= (page.total ?? 0) || issues.length < PAGE) break;
    startAt += issues.length;
  }
  return all.map(mapIssue);
}

type SprintPage = { values: AgileModels.Sprint[]; total: number; isLast: boolean };

async function fetchLastNSprints(
  client: AgileClient,
  boardId: number,
  limit: number
): Promise<AgileModels.Sprint[]> {
  // First page — gives us total (if available) and isLast
  const first = (await client.board.getAllSprints({
    boardId,
    startAt: 0,
    maxResults: limit,
    state: "closed",
  })) as SprintPage;

  const values = first.values ?? [];

  // All sprints fit in one page
  if (first.isLast || values.length === 0) return values.slice(-limit);

  // Jira returned a reliable total — jump directly to the last page
  if (first.total > 0) {
    const startAt = Math.max(0, first.total - limit);
    const last = (await client.board.getAllSprints({
      boardId,
      startAt,
      maxResults: limit,
      state: "closed",
    })) as SprintPage;
    return (last.values ?? []).slice(-limit);
  }

  // total not available — slide forward page by page, keep last `limit` seen
  let window: AgileModels.Sprint[] = values;
  let startAt = values.length;
  while (true) {
    const page = (await client.board.getAllSprints({
      boardId,
      startAt,
      maxResults: limit,
      state: "closed",
    })) as SprintPage;
    const batch = page.values ?? [];
    window = [...window, ...batch].slice(-limit);
    if (page.isLast || batch.length < limit) break;
    startAt += batch.length;
  }
  return window;
}

export interface BoardMember {
  accountId: string;
  displayName: string;
  emailAddress?: string;
  avatarUrl?: string;
  accountType?: string;
}

export async function getBoardMembers(
  creds: JiraCredentials,
  boardId: number
): Promise<BoardMember[]> {
  const agileClient = createAgileClient(creds);
  const projectsPage = await agileClient.board.getProjects({ boardId, maxResults: 1 });
  const projectKey = projectsPage.values?.[0]?.key;
  if (!projectKey) return [];

  const client = createVersion2Client(creds);
  const users = await client.userSearch.findAssignableUsers({
    project: projectKey,
    maxResults: 200,
  });
  return users.map((u) => ({
    accountId: u.accountId ?? "",
    displayName: u.displayName ?? "",
    emailAddress: u.emailAddress,
    avatarUrl: u.avatarUrls?.["48x48"],
    accountType: u.accountType,
  }));
}

export async function getSprintIssues(
  creds: JiraCredentials,
  sprintId: number
): Promise<SprintWithIssues> {
  const client = createAgileClient(creds);

  const [sprint, rawIssues] = await Promise.all([
    client.sprint.getSprint({ sprintId }),
    fetchAllIssuePages(client, sprintId),
  ]);

  return {
    id: sprint.id,
    name: sprint.name,
    state: sprint.state ?? "",
    startDate: sprint.startDate ?? null,
    endDate: sprint.endDate ?? null,
    completeDate: sprint.completeDate ?? null,
    goal: sprint.goal ?? null,
    issues: rawIssues.map(mapIssue),
  };
}

export interface IssueDetail {
  id: string;
  key: string;
  summary: string;
  description: string | null;
  issueType: string;
  storyPoints: number | null;
  assignee: string | null;
  priority: string | null;
  labels: string[];
  status: string;
}

function extractAdfText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { type?: string; text?: string; content?: unknown[] };
  if (n.type === "text" && typeof n.text === "string") return n.text;
  if (Array.isArray(n.content)) return n.content.map(extractAdfText).join(" ");
  return "";
}

export async function getIssueDetails(
  creds: JiraCredentials,
  issueKeys: string[]
): Promise<IssueDetail[]> {
  const client = createVersion2Client(creds);
  const results = await Promise.allSettled(
    issueKeys.map(async (key) => {
      const issue = await client.issues.getIssue({ issueIdOrKey: key });
      const f = issue.fields as Record<string, unknown>;

      let description: string | null = null;
      if (f.description) {
        if (typeof f.description === "string") {
          description = f.description || null;
        } else {
          const text = extractAdfText(f.description).replace(/\s+/g, " ").trim();
          description = text || null;
        }
      }

      const status = f.status as { name?: string } | undefined;
      const issueType = f.issuetype as { name?: string } | undefined;
      const assignee = f.assignee as { displayName?: string } | null | undefined;
      const priority = f.priority as { name?: string } | null | undefined;

      return {
        id: issue.id ?? "",
        key: issue.key ?? key,
        summary: (f.summary as string) ?? "",
        description,
        issueType: issueType?.name ?? "",
        storyPoints: extractStoryPoints(f as AgileModels.Fields),
        assignee: assignee?.displayName ?? null,
        priority: priority?.name ?? null,
        labels: Array.isArray(f.labels) ? (f.labels as string[]) : [],
        status: status?.name ?? "",
      } satisfies IssueDetail;
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<IssueDetail> => r.status === "fulfilled")
    .map((r) => r.value);
}

export async function getBoardSprintHistory(
  creds: JiraCredentials,
  boardId: number,
  limit = 10
): Promise<SprintSummary[]> {
  const client = createAgileClient(creds);
  const sprints = await fetchLastNSprints(client, boardId, limit);

  return Promise.all(
    sprints.map(async (sprint) => {
      const issues = await fetchAllIssuePages(client, sprint.id, STORY_POINT_FIELDS);
      const totalStoryPoints = issues.reduce((sum, issue) => {
        const pts = extractStoryPoints(issue.fields as AgileModels.Fields);
        return sum + (pts ?? 0);
      }, 0);
      return {
        id: sprint.id,
        name: sprint.name,
        startDate: sprint.startDate ?? null,
        endDate: sprint.endDate ?? null,
        completeDate: sprint.completeDate ?? null,
        totalStoryPoints,
      } satisfies SprintSummary;
    })
  );
}
