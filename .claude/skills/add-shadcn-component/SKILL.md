---
name: add-shadcn-component
description: Add a shadcn/ui component to web-app the right way. Use when the Next.js app needs a new UI primitive (dialog, dropdown-menu, form, select, sheet, etc.). Prefers the shadcn CLI, respects the existing Tailwind v4 + components.json setup, and keeps design tokens consistent with the shared theme used by mobile.
---

# Add shadcn/ui Component (web-app)

## Before adding

- Check whether the component already exists in `web-app/src/components/ui/` — don't duplicate.
- Confirm it's a real shadcn component name (verify via Context7 / shadcn docs) rather than guessing the registry name.

## How to add

- Prefer the CLI from inside `web-app`: `pnpm dlx shadcn@latest add <component>`. Let it write into `src/components/ui/`.
- This project uses **Tailwind v4** (tokens live in `src/app/globals.css` `@theme`, not a `tailwind.config`). If the CLI assumes v3, reconcile by hand — do not introduce a `tailwind.config.js`.
- Colors must use the existing CSS variables (`--primary`, `--background`, …) which mirror `@shared/theme`. Don't hardcode hex values.
- Keep the `cn` helper import consistent with the existing components (`@/lib/utils`).

## Parity with mobile

- The mobile app uses NativeWind with the **same token names**. If you introduce a new semantic token on web, note that the mobile side (`mobile-app/src/global.css` + `tailwind.config.js`) needs the matching token to stay visually identical. Flag this; don't silently diverge.

## After adding

- Show the import path and a minimal usage example.
- Run a quick `pnpm --filter web-app typecheck` (or build) to confirm it compiles.
