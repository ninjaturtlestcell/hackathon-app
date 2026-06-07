# Cloud Run icin web-app (Next.js 16, pnpm monorepo) Docker imaji.
# Build context = monorepo kok dizini (shared/* paketleri gerektigi icin).

FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# ---- Build asamasi: install + next build ----
FROM base AS builder

# NEXT_PUBLIC_* degiskenleri client paketine BUILD aninda gomulur,
# bu yuzden build arg olarak gelmeleri sart.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_TELEMETRY_DISABLED=1

# Tum monorepo'yu kopyala (.dockerignore node_modules/.next/.git'i disliyor)
COPY . .

# Sadece web-app ve onun bagimliliklarini (shared/*) kur; mobile-app'i atla.
RUN pnpm install --frozen-lockfile --filter web-app...

# web-app'i derle -> web-app/.next/standalone olusur
RUN pnpm --filter web-app build

# ---- Calistirma asamasi: yalin standalone sunucu ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
WORKDIR /app

# Standalone cikti monorepo kokunu koruyarak gelir:
#   standalone/web-app/server.js  +  standalone/node_modules + shared paketleri
COPY --from=builder /app/web-app/.next/standalone ./
COPY --from=builder /app/web-app/.next/static ./web-app/.next/static
COPY --from=builder /app/web-app/public ./web-app/public

EXPOSE 8080
CMD ["node", "web-app/server.js"]
