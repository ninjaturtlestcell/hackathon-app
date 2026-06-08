# Architecture

## Repository layout

```
hackathon-app/
├── web-app/                  Next.js 16 App Router web application
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/jira/     REST API routes (Jira proxy + AI analysis)
│   │   │   ├── app/jira/     Jira dashboard page
│   │   │   ├── login/        Auth pages
│   │   │   └── page.tsx      Landing page
│   │   ├── components/       shadcn/ui + custom components
│   │   └── lib/
│   │       ├── db.ts         SQLite layer (better-sqlite3)
│   │       └── gemini.ts     Gemini API client
│   └── jira_analysis.db      SQLite database (auto-created)
├── mobile-app/               Expo + NativeWind (scaffold, auth flows)
├── shared/
│   ├── jira/                 Jira API client (@shared/jira)
│   ├── theme/                Design tokens
│   ├── lib/                  Shared hooks + utils
│   ├── i18n/                 en + tr translations
│   ├── schemas/              Zod validation schemas
│   ├── supabase/             Supabase client factory + DB types
│   └── assets/               Static assets (team photos, etc.)
└── supabase/                 Supabase migrations (auth/RBAC)
```

## Data flow

```
Browser
  │
  ├─► GET /api/jira/boards          → jira.js → Jira REST API
  ├─► GET /api/jira/boards/:id/sprint-history
  │       → jira.js (paginated) → aggregates story points per sprint
  │
  ├─► GET /api/jira/sprints/:id/analysis
  │       1. Check SQLite sprints cache (1-day TTL)
  │       2. If miss → fetch from Jira, cache in DB
  │       3. Build structured prompt
  │       4. POST to Gemini 2.5 Pro (JSON mode, 4-min timeout)
  │       5. Persist result to jira_analysis table
  │       6. Return JSON to client
  │
  └─► POST /api/jira/boards/:id/task-estimation
          1. Fetch full issue details from Jira
          2. Pull all past analyses for this board from SQLite
          3. Aggregate skill patterns + team profiles → historical context
          4. Build estimation prompt
          5. POST to Gemini → estimated SP + assignee suggestions
          6. Persist to backlog_analyses table
```

## Authentication

Two separate auth layers:

| Layer | Mechanism |
|---|---|
| **App login** | Supabase Auth (email/password). Session stored as cookie via `@supabase/ssr`. Middleware in `proxy.ts` protects `/app/*` routes. |
| **Jira credentials** | Stored as base64(`username:password`) in an encrypted HTTP-only cookie (`jira_session`). Decoded server-side on each API request. |

## SQLite persistence

`better-sqlite3` runs in the Next.js Node.js process (server-only). WAL mode is enabled.

Three tables:
- **`jira_analysis`** — one row per (boardId, sprintId) analysis. Stores three JSON blobs: effort, user, sprint executive.
- **`sprints`** — caches raw sprint issue data from Jira for 24 hours to avoid redundant API calls.
- **`backlog_analyses`** — stores backlog estimation results so AI suggestions persist across page loads.

## Gemini integration

`web-app/src/lib/gemini.ts` wraps the Gemini REST API:
- Model: `gemini-2.5-pro`
- Response MIME: `application/json` (structured output)
- Timeout: 240 seconds per request
- Called from two API routes: sprint analysis and backlog estimation

Prompts are in Turkish (the analysis text output is in Turkish per product requirement).

## Shared Jira client (`@shared/jira`)

`shared/jira/src/client.ts` exposes:

| Function | Description |
|---|---|
| `createVersion2Client` / `createAgileClient` | jira.js client factories |
| `getAllBoards` | Paginated board listing |
| `getBoardSprintHistory` | Fetches last N closed sprints with story point totals |
| `getSprintIssues` | Full issue list for a sprint (paginated, 200/page) |
| `getBoardBacklog` | Paginated backlog issues |
| `getBoardMembers` | Assignable users for a board's project |
| `getIssueDetails` | Detailed issue data including ADF description extraction |

Story points are extracted by probing multiple custom fields (`customfield_10016`, `customfield_10028`, etc.) to support both Jira Cloud and Server/DC.

## Monorepo tooling

- **pnpm workspaces** — workspace packages are resolved as TypeScript source (no build step required for consumption).
- **Turborepo** — `pnpm build` / `pnpm typecheck` / `pnpm lint` run in dependency order.
- **`node-linker=hoisted`** in `.npmrc` — required for Metro (Expo) to resolve symlinks correctly.
- `web-app/next.config.ts` uses `transpilePackages` for all `@shared/*` packages.
