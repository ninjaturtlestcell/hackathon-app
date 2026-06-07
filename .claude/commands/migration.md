---
description: Create a Supabase migration for a schema change (inspects live schema first).
argument-hint: <describe the schema change>
---

Use the `create-migration` skill. First inspect the current schema via the Supabase MCP and confirm any ambiguous decisions (nullability, defaults, FK on-delete, RLS) with me before writing SQL. Do not apply the migration yourself.

Desired change:

$ARGUMENTS
