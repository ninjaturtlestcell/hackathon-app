# Development Phases

## Phase 0 — Monorepo scaffold

Set up the pnpm + Turborepo workspace with:
- `web-app/` (Next.js 16 App Router, shadcn/ui, Tailwind v4)
- `mobile-app/` (Expo SDK 56, NativeWind, expo-router)
- `shared/` packages: `theme`, `supabase`, `schemas`, `lib`, `i18n`, `assets`
- Supabase Auth + RBAC migrations
- Google Cloud Run deployment pipeline (`deploy-web.sh`, `cloudbuild.yaml`)

## Phase 1 — Jira integration foundation

Created `shared/jira` package with a typed Jira API client:
- `jira.js`-based client for both Jira Cloud and Server/DC
- Paginated board, sprint, and issue fetchers
- Story point extraction across multiple custom field variants (`customfield_10016`, `customfield_10028`, etc.)
- In-app Jira credential login (email + API token stored in encrypted cookie)

API routes created:
- `POST /api/jira/auth/login` — stores base64 credentials in HTTP-only cookie
- `GET /api/jira/boards` — lists all accessible boards
- `GET /api/jira/boards/:id/sprint-history` — last N closed sprints with SP totals
- `GET /api/jira/boards/:id/backlog` — full backlog issue list
- `GET /api/jira/boards/:id/members` — assignable team members

## Phase 2 — Sprint analytics dashboard

Built the Jira dashboard page (`/app/jira`):
- Board selector with fuzzy search (cmdk Combobox)
- Sprint count selector (5–100 sprints)
- Velocity bar chart (Recharts) with average reference line and green/red coloring
- Sprint table with state badges, SP totals, pagination (TanStack Table)

## Phase 3 — SQLite persistence layer

Introduced `better-sqlite3` as the persistence layer (no external database required):
- `jira_analysis` table — stores Gemini analysis results per sprint
- `sprints` table — caches Jira sprint issue data (1-day TTL)
- `backlog_analyses` table — stores backlog estimation results

WAL mode enabled for concurrent read performance.

## Phase 4 — AI sprint analysis (Gemini integration)

Integrated Google Gemini 2.5 Pro (`gemini-2.5-pro`, JSON mode):

**Sprint analysis** (`GET /api/jira/sprints/:id/analysis`):
- Sprint health score (0–100) with four sub-scores: task completion, SP completion, quality/process, goal achievement
- Effort analysis: skill-based task distribution with sizing patterns (S/M/L)
- User analysis: per-developer skill ownership map
- Sprint executive summary: what went well, what went wrong, incomplete items, recommendations

Results are cached in SQLite so re-opening a sprint shows the stored analysis instantly.

**Analysis modal UI**: Three-tab dialog (Sprint / Effort / User) with health score gauge, completion stats, and recommendation lists.

## Phase 5 — Backlog AI estimation

Added backlog estimation:
- Multi-select checkboxes on backlog table
- `POST /api/jira/boards/:id/task-estimation` — fetches full issue details from Jira, pulls historical sprint analyses from SQLite to build context, sends structured prompt to Gemini
- Returns per-task: estimated SP, SP range, primary skill, confidence level, suggested assignee, reasoning
- Capacity comparison card: compares total estimated SP vs. historical average sprint velocity
- Results saved to `backlog_analyses` and overlaid on the backlog table (`AI SP`, `AI Assignee` columns)

## Phase 6 — Landing page & polish

- Marketing landing page (`/`) with feature cards, how-it-works steps, and team section
- Avatar proxy route (`/api/jira/avatar`) to serve Jira avatars without CORS issues
- i18n strings for landing page (`en` + `tr`)
- Skeleton loaders, error states, pagination controls
- Dark mode support throughout
