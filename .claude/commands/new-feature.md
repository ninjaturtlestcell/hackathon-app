---
description: Plan and build a feature across web + mobile using shared packages.
argument-hint: <feature description>
---

Plan and implement the feature below across the monorepo. Process:

1. If the feature is non-trivial or ambiguous, start with the `brainstorming` skill and get my approval on the design first.
2. Put shared logic (types, zod schemas, Supabase calls, theme) in `@shared/*` so web and mobile reuse it — do not duplicate.
3. If the database changes, use the `create-migration` skill (and the `supabase-architect` agent for modeling/RLS).
4. Implement web via the `web-feature` agent and mobile via the `mobile-feature` agent, keeping tokens/validation identical.
5. Verify: `pnpm --filter web-app build` and `pnpm --filter mobile-app exec tsc --noEmit`. Report results honestly.

Do not invent APIs or paths — verify with Context7 / Supabase MCP / reading files, and ask me when something is unclear.

Feature:

$ARGUMENTS
