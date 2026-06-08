# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Overview

pnpm + Turborepo monorepo. Project name: **Turtle**.

```
web-app/        Next.js 16 (App Router) + shadcn/ui + Tailwind v4
mobile-app/     Expo SDK 56 + NativeWind v4 + expo-router
shared/
  assets/       Static assets shared across platforms
  i18n/         Translation strings (en + tr), single source for both platforms
  lib/           useSession, useUserRole, useIsAdmin hooks; cn util
  schemas/       Zod schemas for shared form validation
  supabase/      createClient factory + Database types
  theme/         Design tokens (palette, radius, tailwindColors) — single source of truth
supabase/       Supabase config.toml + SQL migrations
```

## Commands

From the repo root (requires pnpm):

```bash
pnpm dev:web       # Next.js → http://localhost:3000
pnpm dev:mobile    # Expo → QR / iOS / Android
pnpm build         # Full turbo build
pnpm typecheck     # Type-check all packages
pnpm lint          # Lint all packages
```

Within `web-app/`:
```bash
pnpm dev           # next dev
pnpm typecheck     # tsc --noEmit
pnpm lint          # eslint
```

Within `mobile-app/`:
```bash
pnpm start         # expo start
pnpm ios           # expo run:ios
pnpm android       # expo run:android
pnpm lint          # expo lint
```

## Environment Setup

```bash
cp web-app/.env.example web-app/.env.local
cp mobile-app/.env.example mobile-app/.env
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (web)
# Fill in EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY (mobile)
```

## Architecture

### What is shared vs platform-specific

| Shared (`shared/`) | Platform-specific |
|---|---|
| Supabase client factory + DB types | UI components (web: shadcn, mobile: NativeWind + @rn-primitives) |
| Design tokens (`shared/theme/src/tokens.ts`) | Routing (web: App Router, mobile: expo-router) |
| Zod schemas | Platform APIs (camera, storage, etc.) |
| `useSession`, `useUserRole`, `useIsAdmin` hooks | Auth provider/context implementation |
| i18n resources (en + tr) | i18next instance initialization |

**shadcn is NOT used on mobile** (DOM/Radix-based). Both platforms consume the same design tokens from `shared/theme/src/tokens.ts`, which flow into web's `globals.css` and mobile's `global.css` + `tailwind.config.js`.

### Supabase client pattern

Each platform creates its own client using the shared factory:
- **Mobile** (`mobile-app/src/lib/supabase.ts`): passes `AsyncStorage` and `detectSessionInUrl: false`
- **Web browser** (`web-app/src/lib/supabase/client.ts`): uses `@supabase/ssr`'s `createBrowserClient`
- **Web server** (`web-app/src/lib/supabase/server.ts`): uses `@supabase/ssr`'s `createServerClient`

### Auth flow

- **Mobile**: `AuthProvider` (`src/context/auth.tsx`) wraps the app; `useProtectedRoute` in `_layout.tsx` redirects unauthenticated users to `/login`. Deep links with `?code=` are handled via `exchangeCodeForSession` for PKCE.
- **Web**: Middleware-based auth (`src/proxy.ts` / Next.js middleware).
- Route groups: `(auth)` = public (login, reset-password, update-password); `(app)` = protected.

### RBAC

`user_roles` table with `app_role` enum. `useUserRole` and `useIsAdmin` hooks in `@shared/lib`. The database uses an access token hook (`20260607174732_rbac_roles_and_access_token_hook.sql`) to inject the role into JWT claims.

### Adding UI components

**Web (shadcn):**
```bash
cd web-app
pnpm dlx shadcn@latest add <component>
```

**Mobile (react-native-reusables):**
```bash
cd mobile-app
pnpm dlx @react-native-reusables/cli@latest add <component>
```

### Platform-specific file variants

Metro and Next.js resolve `.web.tsx` over `.tsx` on web. This is used for `app-tabs.tsx` / `app-tabs.web.tsx` and `animated-icon.tsx` / `animated-icon.web.tsx`.

### Metro monorepo config

`mobile-app/metro.config.js` sets `watchFolders` and `nodeModulesPaths` to include the workspace root so `shared/*` packages resolve correctly. `disableHierarchicalLookup: true` prevents pnpm hoisting issues.

### Next.js transpilation

`web-app/next.config.ts` transpiles `@shared/*` packages since they are published as TypeScript source. `output: "standalone"` is configured for Cloud Run deployment.

### i18n

Supported languages: `en`, `tr` (fallback: `en`). All copy lives in `shared/i18n/src/index.ts`. Each platform initializes its own i18next instance using `resources` exported from there.

## Supabase Migrations

Migrations live in `supabase/migrations/`. To generate DB types after schema changes:
```bash
pnpm dlx supabase gen types typescript --project-id <PROJECT_ID> \
  > shared/supabase/src/types.ts
```

## Deployment

Web deploys to Google Cloud Run via `./deploy-web.sh` (requires `PROJECT_ID` env var). Build runs on Cloud Build (not locally) to avoid Apple Silicon QEMU issues. See `GOOGLE-CLOUD.md` for full setup.

**Important:** `NEXT_PUBLIC_*` env vars are baked into the build. `web-app/.env` must be populated before running `deploy-web.sh`.

After deploying, update Supabase Auth → URL Configuration with the new Cloud Run URL.

## Critical pnpm note

`.npmrc` must contain `node-linker=hoisted` for Metro to resolve symlinks correctly. Do not remove it.
