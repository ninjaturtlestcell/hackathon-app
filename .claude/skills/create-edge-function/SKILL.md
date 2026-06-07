---
name: create-edge-function
description: Scaffold a Supabase Edge Function (Deno runtime) under supabase/functions. Use when adding server-side logic that should run on Supabase (webhooks, privileged operations, third-party API calls that must hide secrets). Sets up index.ts, shared CORS, and explains deploy + secrets.
---

# Create Supabase Edge Function

## Before scaffolding

- Confirm the function actually needs to be server-side (secret handling, service-role access, webhook). If it can live in the app, say so and ask before creating one.
- Ask for the function name and trigger (HTTP endpoint? cron? webhook source?).

## Layout (supabase/ is owned by the user — only add files under it)

```
supabase/functions/
  _shared/cors.ts          # shared CORS headers
  <function-name>/index.ts # the handler
```

## Conventions

- Deno + `Deno.serve`. Import via `npm:` / `jsr:` / URL specifiers (no node_modules).
- Read secrets from `Deno.env.get(...)`. Never hardcode keys. For privileged DB access use the **service role key** from env, and create the client per-request.
- Always handle the CORS preflight (`OPTIONS`) and return shared CORS headers on every response.
- Validate input with the shared zod schemas from `@shared/schemas` when applicable (or restate the validation if cross-runtime import isn't set up — verify, don't assume it resolves under Deno).
- Return typed JSON with explicit status codes; never leak internal errors to the client.

## After scaffolding

- List the env/secrets the function needs and how to set them (`supabase secrets set ...`).
- Give the deploy command (`supabase functions deploy <name>`) and a local test (`supabase functions serve`). Do not deploy yourself unless asked.
