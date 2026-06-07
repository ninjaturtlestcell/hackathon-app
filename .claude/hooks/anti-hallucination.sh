#!/usr/bin/env bash
# UserPromptSubmit hook — injected into context on every user prompt.
# Keep this SHORT: it is added to context each turn, so it costs tokens.
# Purpose: reduce hallucination and force question-asking when unclear.

cat <<'EOF'
[project-guardrails]
- Do NOT fabricate. If you are unsure, or the repo/library/API fact is not verified, say so explicitly. Never invent file paths, config keys, function names, env vars, or behavior.
- Verify before you claim:
  * Library / framework / API facts -> use Context7 MCP (resolve the lib, fetch docs) instead of recalling from memory.
  * Database schema / RLS / data facts -> use the Supabase MCP against the real project.
  * Repo facts (files, exports, scripts) -> read the actual files; do not assume.
- If the request is ambiguous or under-specified, STOP and ask the user clarifying questions (one at a time, prefer multiple-choice) BEFORE acting. Do not guess to fill gaps.
- For non-trivial features or design decisions, prefer the `brainstorming` skill before writing code.
- Stack: web-app = Next.js 16 App Router + shadcn/ui + Tailwind v4; mobile-app = Expo SDK 56 + expo-router + NativeWind; shared/* = @shared/{theme,supabase,schemas,lib,assets}; backend = Supabase; tooling = pnpm workspaces + turbo; font = Plus Jakarta Sans.
EOF
