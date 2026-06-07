#!/usr/bin/env bash
# web-app'i Google Cloud Run'a build + deploy eder.
# Kullanim:
#   export PROJECT_ID=senin-gcp-proje-id
#   ./deploy-web.sh
set -euo pipefail

# ---- Ayarlar (gerekirse env ile ezilebilir) ----
PROJECT_ID="${PROJECT_ID:?PROJECT_ID gerekli. Ornek: export PROJECT_ID=benim-proje}"
REGION="${REGION:-europe-west3}"   # Frankfurt (Turkiye'ye yakin)
SERVICE="${SERVICE:-web-app}"
REPO="${REPO:-web}"                # Artifact Registry repo adi
# -------------------------------------------------

ROOT="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$ROOT/web-app/.env"
[ -f "$ENV_FILE" ] || { echo "HATA: $ENV_FILE bulunamadi"; exit 1; }

# NEXT_PUBLIC_* degerlerini .env'den oku
set -a; # shellcheck disable=SC1090
source "$ENV_FILE"; set +a
: "${NEXT_PUBLIC_SUPABASE_URL:?web-app/.env icinde NEXT_PUBLIC_SUPABASE_URL yok}"
: "${NEXT_PUBLIC_SUPABASE_ANON_KEY:?web-app/.env icinde NEXT_PUBLIC_SUPABASE_ANON_KEY yok}"

IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${SERVICE}:latest"

echo "==> Artifact Registry repo kontrol/olustur ($REPO @ $REGION)"
gcloud artifacts repositories describe "$REPO" \
  --location "$REGION" --project "$PROJECT_ID" >/dev/null 2>&1 \
  || gcloud artifacts repositories create "$REPO" \
       --repository-format=docker --location "$REGION" --project "$PROJECT_ID"

echo "==> Cloud Build ile build + push ($IMAGE)"
# Build'i gercek amd64 donaniminda Cloud Build'de yapiyoruz. Boylece Apple
# Silicon'daki QEMU emulasyon segfault'u olmaz ve yerel Docker'a gerek kalmaz.
# Virgul/ozel karakter sorunu olmasin diye substitution'lara ^@^ ayraci kullanildi.
gcloud builds submit "$ROOT" \
  --project "$PROJECT_ID" \
  --config "$ROOT/cloudbuild.yaml" \
  --substitutions "^@^_IMAGE=${IMAGE}@_NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}@_NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}"

echo "==> Cloud Run deploy ($SERVICE @ $REGION)"
gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL},NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}"

echo ""
echo "==> Bitti. Servis URL'i:"
gcloud run services describe "$SERVICE" --region "$REGION" --project "$PROJECT_ID" \
  --format 'value(status.url)'
