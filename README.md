# Turtle — AI-Powered Jira Sprint Intelligence

Turtle connects to your Jira boards and uses **Google Gemini 2.5 Pro** to deliver sprint health scores, effort distribution, skill pattern analysis, and AI-driven story point estimation for backlog items — all in one dashboard.

---

## What it does

| Feature | Description |
|---|---|
| **Sprint Analytics** | Velocity bar chart across the last N sprints; color-coded above/below average |
| **AI Sprint Analysis** | Sprint health score (0–100), completion rate, what went well/wrong, recommendations |
| **Effort Analysis** | Skill-based task distribution (frontend, backend, kafka, database, …) with sizing patterns |
| **User Analysis** | Per-developer skill ownership and story point breakdown per sprint |
| **Backlog Intelligence** | Select backlog issues → Gemini estimates story points, skill category, and suggested assignee |
| **Capacity Planning** | Compares estimated backlog SP against historical average sprint capacity |

---

## Screenshots

> Add screenshots here once the app is running.

---

## Tech stack

### Web app (`web-app/`)
- **Next.js 16** (App Router)
- **shadcn/ui** + **Tailwind v4** + **Recharts**
- **SQLite** (`better-sqlite3`) — local persistence for analyses and sprint cache
- **Google Gemini 2.5 Pro** — AI analysis engine
- **Jira REST API** via `jira.js` (Cloud + Server/DC)
- **Supabase Auth** — user authentication

### Shared packages (`shared/`)
- `@shared/jira` — Jira API client, typed models, paginated fetchers
- `@shared/theme` — design tokens (colors, radius)
- `@shared/lib` — `useSession`, `useUserRole`, `cn` util
- `@shared/i18n` — `en` + `tr` translations

### Mobile app (`mobile-app/`)
- **Expo SDK 56** + `expo-router`
- **NativeWind v4** (Tailwind-in-React-Native)

### Tooling
- **pnpm workspaces** + **Turborepo**
- **TypeScript** throughout

---

## AI tools used in development

| Tool | Usage |
|---|---|
| **Claude Code** (`claude-sonnet-4-6`) | Primary development agent — feature implementation, refactoring, code review |
| **Context7 MCP** | Live library documentation fetching during development |
| **Figma MCP** | Design-to-code and component inspection |
| **Google Gemini 2.5 Pro** | Runtime AI: sprint analysis, story point estimation, assignee suggestions |

AI configuration files in this repo:
- `CLAUDE.md` — Claude Code project instructions and architecture guidance
- `.claude/agents/` — Specialized sub-agent definitions (code-reviewer, web-feature, etc.)
- `.claude/skills/` — Reusable skill prompts (jira-read, jira-comment, brainstorming, etc.)
- `.mcp.json` — MCP server configuration (Context7, Supabase)

---

## APIs integrated

- **Jira REST API** — boards, sprints, issues, backlog, members (via `jira.js`)
- **Google Gemini API** — `gemini-2.5-pro` model, JSON mode

---

## Setup

### Prerequisites
- Node.js 22+ (`.nvmrc` provided)
- pnpm 9+

### Install

```bash
pnpm install
```

### Environment variables

Copy and fill:

```bash
cp web-app/.env.example web-app/.env.local
```

`web-app/.env.local`:

```env
# Jira
NEXT_PUBLIC_JIRA_BASE_URL=https://your-jira-instance.atlassian.net

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Supabase (for auth)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **SQLite database** is created automatically at `web-app/jira_analysis.db` on first run. No migration step needed.

### Run

```bash
# Web app (http://localhost:3000)
pnpm dev:web

# Mobile (Expo QR / iOS / Android)
pnpm dev:mobile
```

---

## How it works — 3 steps

1. **Connect Jira** — authenticate with your Jira email and API token from the in-app settings.
2. **Select a board** — pick any Scrum board; sprint history loads automatically.
3. **Run analysis** — choose a sprint and Gemini generates a full effort, user, and sprint executive analysis.

---

## SQLite schema

```sql
-- Cached sprint analyses (effort + user + sprint health)
jira_analysis (id, boardId, sprintId, effortAnalysisJson, userAnalysisJson, sprintAnalysisJson, createdAt)

-- Cached sprint issues from Jira (1-day TTL)
sprints (sprint_id, issues_json, fetched_at)

-- Backlog estimation results
backlog_analyses (id, board_id, task_count, results_json, created_at)
```

---

## Deploy URL

> Fill in after deployment.

---

## Team

| Name | Role |
|---|---|
| Fatih Telis | FE Developer |
| Enes Aydın | Analist |
| Samet Topakkaya | BE Developer |
| Ömer Yusuf Mutlu | BE Developer |
