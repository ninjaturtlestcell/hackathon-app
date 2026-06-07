---
name: brainstorming
description: Use BEFORE implementing any non-trivial feature, schema change, or design decision. Turns a rough idea into an approved design through collaborative Q&A — explore context, ask one question at a time, propose 2-3 approaches with trade-offs, present the design in small reviewable sections, get approval, then optionally write a spec. Adapted from obra/superpowers (soft, opt-in variant).
---

# Brainstorming

Turn a rough idea into a fully-formed, approved design through natural, collaborative dialogue — before any code is written.

## Gate (applies while this skill is active)

Do NOT write code, scaffold, run migrations, or take any implementation action **until you have presented a design and the user has approved it**. This gate is scoped to this skill: it is opt-in, not global.

## Process

1. **Explore context first.** Read the relevant files, README, existing patterns, and recent commits. Use Context7 for any library/API you'll rely on and the Supabase MCP for anything touching the database. Never assume — verify.
2. **Ask clarifying questions ONE at a time.** Prefer multiple-choice. Stop after each question and wait. Do not batch a questionnaire. If something is genuinely unknowable without the user, ask — do not guess.
3. **Propose 2-3 approaches** with honest trade-offs (effort, risk, maintainability, fit with the existing stack). Recommend one and say why.
4. **Present the design in small, reviewable sections** — short enough to actually read. Validate incrementally; get a thumbs-up per section rather than dumping a wall of text.
5. **Apply YAGNI.** Actively remove features/abstractions that aren't needed yet. Call out what you are intentionally leaving out.
6. **Get explicit approval** on the overall design before moving on.
7. **(Optional) Write a spec** to `docs/specs/YYYY-MM-DD-<topic>.md` when the work is large or will span sessions. For small tasks, an approved in-chat design is enough — don't over-document.
8. **Self-review the spec** if written: scan for placeholders, contradictions, ambiguity, and scope creep; fix them.
9. **Hand off.** Only after approval, proceed to implementation (or the relevant skill: `create-migration`, `add-shadcn-component`, etc.).

## Principles

- One question per message; multiple-choice when possible.
- Verify with tools (Context7 / Supabase MCP / reading files) instead of recalling.
- Explore alternatives — never present a single option as the only way.
- Stay flexible: if the user pushes back, adjust the approach rather than defending it.
- Keep it lightweight. The goal is clarity and shared understanding, not ceremony.
