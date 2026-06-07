# Monorepo: Next.js + Expo + Shared (Supabase & Theme)

pnpm workspace + Turborepo. Web ve mobile, ortak iş mantığını `shared/` üzerinden paylaşır.

```
.
├── web-app/        Next.js 16 + shadcn/ui + Tailwind v4
├── mobile-app/     Expo SDK 56 + NativeWind v4 (shadcn-style UI)
└── shared/
    ├── theme/      Platformdan bagimsiz tasarim token'lari (TEK kaynak)
    ├── supabase/   createClient factory + DB tipleri
    ├── schemas/    Zod semalari (ortak form validation)
    └── lib/        Ortak hook'lar (useSession) + utils (cn)
```

## Mimari karari: ne paylasilir, ne paylasilmaz?

| Paylasilir (`shared/`)            | Platforma ozel                                  |
| --------------------------------- | ----------------------------------------------- |
| Supabase client factory + tipler  | UI bilesenleri (web: shadcn, mobile: NativeWind)|
| Tasarim token'lari (renk/radius)  | Routing (web: app router, mobile: expo-router)  |
| Zod semalari                      | Platform API'lari (kamera, storage, ...)        |
| react-query hook'lari, utils      |                                                 |

> **shadcn mobile'a tasinmaz** (DOM/Radix tabanli). Bu yuzden UI iki tarafta
> ayri yazilir ama ayni **tema token'larini** tuketir → gorsel olarak ozdes.
> Tek kaynak: `shared/theme/src/tokens.ts`. Web `globals.css`'e, mobile
> `global.css` + `tailwind.config.js`'e ayni degerler yansitilmistir.

## Kurulum

```bash
pnpm install

# Ortam degiskenleri
cp web-app/.env.example web-app/.env.local
cp mobile-app/.env.example mobile-app/.env
# -> Supabase URL ve anon key'i doldur
```

## Calistirma

```bash
pnpm dev:web        # Next.js  -> http://localhost:3000
pnpm dev:mobile     # Expo     -> QR / iOS / Android
pnpm build          # her seyi build et (turbo)
pnpm typecheck      # her ikisini de type-check et
```

## Supabase DB tiplerini uretme

`shared/supabase/src/types.ts` su an placeholder. Gercek semadan uret:

```bash
pnpm dlx supabase login
pnpm dlx supabase gen types typescript --project-id <PROJECT_ID> \
  > shared/supabase/src/types.ts
```

## Web'e yeni shadcn bileseni ekleme

```bash
cd web-app
pnpm dlx shadcn@latest add card input dialog
```

## Mobile'a yeni bilesen ekleme

NativeWind ile elle yazabilir ya da shadcn-benzeri hazir bilesenler icin
[react-native-reusables](https://reactnativereusables.com) CLI'ini kullanabilirsin:

```bash
cd mobile-app
pnpm dlx @react-native-reusables/cli@latest add card input
```

## Onemli teknik notlar

- **pnpm + Expo:** `.npmrc` icindeki `node-linker=hoisted`, Metro'nun symlink
  sorunu yasamamasi icin **sart**. Kaldirma.
- **Metro monorepo:** `mobile-app/metro.config.js` icinde `watchFolders` ve
  `nodeModulesPaths` workspace root'u kapsar; `shared/*` boylece cozumlenir.
- **transpilePackages:** `shared/*` TS kaynak olarak tuketildigi icin
  `web-app/next.config.ts`'te transpile edilir.
