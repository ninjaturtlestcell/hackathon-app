# AI & Agent Integration

This document describes how AI tools were used both during development and at runtime.

---

## Development-time AI

### Claude Code

The primary development agent throughout this project.

**Model**: `claude-sonnet-4-6` (via Claude Code CLI)

**Configuration files**:

| File | Purpose |
|---|---|
| `CLAUDE.md` | Project-level instructions: monorepo layout, commands, architecture decisions, stack details |
| `.claude/agents/` | Specialized sub-agents (web-feature, mobile-feature, code-reviewer, supabase-architect, figma-designer) |
| `.claude/skills/` | Reusable prompt skills invoked via `/skill-name` during development |
| `.mcp.json` | MCP server configuration |

**Skills used during development**:

| Skill | What it did |
|---|---|
| `jira-read` | Read Jira task details during planning |
| `jira-comment` | Post analysis results back to Jira |
| `jira-board-issues` | Fetch board issue lists for context |
| `brainstorming` | Collaborative design sessions before implementing non-trivial features |
| `add-shadcn-component` | Add shadcn components correctly without breaking config |
| `figma-to-code` | Translate Figma designs to component code |

**MCP servers used**:

| Server | Purpose |
|---|---|
| `context7` | Live library documentation lookup (Next.js, jira.js, better-sqlite3, Tailwind v4) |
| `supabase` | Live schema inspection and migration scaffolding |
| `figma` | Design inspection and component generation |

### How Claude Code was directed

Claude Code was given the full project context via `CLAUDE.md` and used in auto mode for continuous implementation. Key development patterns:

- The `brainstorming` skill was invoked before architectural decisions (e.g., SQLite vs. external DB, Gemini prompt structure).
- Sub-agents ran in isolated worktrees for parallel feature development.
- The `code-reviewer` agent reviewed changes before merging feature branches.

---

## Runtime AI — Google Gemini 2.5 Pro

Gemini runs inside the Next.js API routes, not on the client.

**Model**: `gemini-2.5-pro`  
**Response format**: `application/json` (structured output, no markdown wrapping)  
**Timeout**: 240 seconds  
**API**: Google Generative Language REST API (`v1beta`)

### Prompt 1 — Sprint analysis

File: `web-app/src/app/api/jira/sprints/[sprintId]/analysis/route.ts`

Input to Gemini:
```
sprint metadata (name, dates, goal)
+ task list: [{task_id, task_name, estimate, owner, status, status_category}]
```

Output schema (three top-level keys):
```json
{
  "effortAnalysisJson": {
    "skill_distribution": { "<skill>": { task_count, avg_estimate, size_point_insights, confidence, ... } },
    "task_skill_mapping": [ { task_id, assigned_primary_skill, assigned_size, detected_skills, reason } ],
    "global_skill_insights": [ "..." ]
  },
  "userAnalysisJson": {
    "user_profiles": [ { owner, task_count, total_story_points, primary_skills, skill_distribution, tasks } ]
  },
  "sprintAnalysisJson": {
    "summary": "...",
    "overall_sentiment": "positive|neutral|negative",
    "sprint_health_score": 0-100,
    "health_score_breakdown": { completion_task, completion_sp, quality_process, goal_achievement },
    "completion_rate": 0.0-1.0,
    "what_went_well": [ "..." ],
    "what_went_wrong": [ "..." ],
    "incomplete_items": { count, story_points, items },
    "recommendations": [ "..." ],
    "key_insights": [ "..." ]
  }
}
```

All text fields in the output are in **Turkish** per product requirement.

### Prompt 2 — Backlog estimation

File: `web-app/src/app/api/jira/boards/[boardId]/task-estimation/route.ts`

Input to Gemini:
```
historical context: aggregated skill sizing patterns + team profiles from past sprint analyses (from SQLite)
+ new tasks: [{task_id, task_name, description, issue_type, priority, labels}]
```

Output schema:
```json
{
  "estimations": [
    {
      "task_id": "PROJ-123",
      "task_name": "...",
      "estimated_story_points": 3,
      "story_point_range": [2, 5],
      "primary_skill": "backend",
      "detected_skills": { "backend": 0.7, "database": 0.3 },
      "confidence": "medium",
      "reasoning": "...",
      "suggested_assignee": "Name Surname",
      "assignee_reasoning": "..."
    }
  ]
}
```

The historical context is built by aggregating all past sprint analyses stored in SQLite for the same board — skill sizing palettes (S/M/L point ranges) and team member skill profiles accumulate over time, making estimates progressively more accurate.

### Skill taxonomy

Gemini is seeded with this starting taxonomy and can produce new categories:

`frontend`, `backend`, `kafka`, `database`, `integration`, `new_view_development`, `bug_fix`, `configuration`, `testing`, `reporting`, `authorization`, `batch_job`, `api_development`, `ui_update`, `data_mapping`

Sizing uses `S / M / L / XL` labels mapped to story point ranges derived from historical data.
