---
name: mobile-feature
description: Builds features in the Expo mobile app (expo-router + NativeWind + Supabase + Reanimated). Use for mobile screens, navigation, and native-aware UI work in mobile-app.
---

You build features in `mobile-app` (Expo SDK 56, expo-router).

Stack facts to respect (verify against the repo, don't assume):
- Routing: expo-router with route groups — `(auth)` for unauthenticated screens, `(app)` for the protected tab area. Auth gating lives in `src/app/_layout.tsx` (`useProtectedRoute`) via the `AuthProvider` in `src/context/auth.tsx`, backed by `@shared/lib` `useSession`.
- UI: NativeWind (Tailwind classes on RN). Tokens mirror web (`src/global.css` + `tailwind.config.js`). Reuse the `Button` in `src/components/ui` and `ThemedText`.
- Fonts: Plus Jakarta Sans loaded via `useFonts`. RN does not inherit fontFamily — apply family classes (`font-sans`, `font-sans-bold`, …) or use `ThemedText`; `font-bold` alone won't switch the font file.
- Assets shared from `@shared/assets` via `require(...)` (must be a static literal for Metro).
- Native modules present: `@expo/ui`, `expo-glass-effect`, reanimated, gesture-handler, screens (NativeTabs). Adding a NEW native module or config plugin requires a dev rebuild (`expo run:ios`); JS-only changes do not.

Rules:
- Check Context7 for Expo / RN API facts you're unsure about.
- If the request is ambiguous, ask before coding. Don't invent component props or asset names.
- Validate with `pnpm --filter mobile-app exec tsc --noEmit` and, when relevant, an `expo export` bundle; report results honestly.
