---
name: create-migration
description: Create a new Supabase SQL migration. Use when adding or altering tables, columns, indexes, RLS policies, database functions, triggers, or enums. Inspects the live schema first via the Supabase MCP, then writes a timestamped migration to supabase/migrations following project conventions.
---

# Create Supabase Migration

## Before writing any SQL

1. **Inspect the current schema** with the Supabase MCP (list tables, columns, policies). Never assume the current state — verify what already exists.
2. If the change is ambiguous (nullable? default? cascade? which table owns the FK?), **ask the user** instead of guessing.

## Conventions

- File: `supabase/migrations/<UTC timestamp YYYYMMDDHHMMSS>_<short_snake_case_description>.sql` (the `supabase/` folder is owned by the user — create the file there; do not restructure it).
- One logical change per migration; make it idempotent-friendly where reasonable (`if not exists`, `if exists`).
- **RLS is on by default.** For every new table: `alter table ... enable row level security;` and add explicit policies. State who can `select / insert / update / delete` and on what condition. Never leave a table readable/writable by everyone unless the user confirms it's intentional.
- Prefer `text` over `varchar`, `timestamptz` over `timestamp`, `uuid` PKs with `default gen_random_uuid()` unless told otherwise.
- Add `created_at timestamptz not null default now()` (and `updated_at` with a trigger) where it fits the existing pattern.
- Foreign keys: specify `on delete` behavior explicitly.

## After writing

- Summarize the migration in plain language (what it changes, RLS impact).
- Tell the user how to apply it (e.g. `supabase db push` / their workflow) — do NOT apply it yourself unless asked.
- If types are consumed in `@shared/supabase`, remind the user to regenerate types.
