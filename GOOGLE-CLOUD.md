# Google Cloud'a Deploy (web-app → Cloud Run)

`web-app`'i Google Cloud **Cloud Run**'a deploy etme rehberi.

## Neden Cloud Run?

- App tamamen sunucu-render ediliyor (her istekte auth yapan `web-app/src/proxy.ts` middleware var) → statik export mümkün değil, çalışan bir Node sunucusu gerekiyor.
- **Domain gerekmiyor:** Cloud Run otomatik, ücretsiz HTTPS adresi verir:
  `https://web-app-xxxxx.europe-west3.run.app`
- Sıfıra ölçeklenir (boştayken ücret yok), cömert ücretsiz katman.

## Repoda hazır olan dosyalar

| Dosya | Amaç |
|---|---|
| `web-app/next.config.ts` | `output: "standalone"` + monorepo `outputFileTracingRoot` |
| `Dockerfile` | Çok aşamalı build (Node 22, pnpm; sadece web-app + shared kurulur) |
| `.dockerignore` | node_modules / .next / .env imaja girmesin |
| `deploy-web.sh` | Tek komutla build → Artifact Registry → Cloud Run |

> Not: `NEXT_PUBLIC_*` değişkenleri client paketine **build anında** gömülür.
> Bu yüzden `deploy-web.sh`, değerleri `web-app/.env` dosyasından okuyup Docker'a
> `--build-arg` olarak geçirir. (`web-app/.env` içinde
> `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` dolu olmalı.)

---

## 1) Tek seferlik kurulum

### a. gcloud CLI kur ve giriş yap

```bash
brew install --cask google-cloud-sdk
gcloud auth login
```

### b. Proje oluştur + faturalandırma bağla

Proje ID'si global olarak benzersiz olmalı. Faturalandırma kartı bağlamak şart
(ama Cloud Run'ın ücretsiz katmanı var).

```bash
gcloud projects create benim-proje-123 --name="Web App"
gcloud config set project benim-proje-123
```

Sonra faturalandırma hesabını bu projeye bağla:
https://console.cloud.google.com/billing

### c. Gerekli API'leri aç

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com
```

> ⚠️ Cloud Build API'sini **ilk açtıktan sonra** ilk `gcloud builds submit`
> çağrısı 1-2 dk boyunca `PERMISSION_DENIED` verebilir (IAM/servis-hesabı
> yayılım gecikmesi). Owner olsan bile olur — birkaç dakika bekleyip tekrar
> çalıştır, geçer.

### Gereksinimler

- `web-app/.env` içinde Supabase değerleri dolu olmalı.
- **Yerel Docker GEREKMEZ** — build, Cloud Build'de (gerçek amd64 donanımı)
  yapılır. (Apple Silicon'da yerel QEMU emülasyonu Next/Turbopack'i segfault
  ettirdiği için build buluta taşındı.)

---

## 2) Deploy (her seferinde tek komut)

```bash
export PROJECT_ID=benim-proje-123
./deploy-web.sh
```

Script şunları yapar:
1. Artifact Registry deposunu oluşturur (yoksa).
2. `cloudbuild.yaml` ile imajı **Cloud Build'de** build edip Artifact
   Registry'ye push eder (`NEXT_PUBLIC_*` build-arg olarak `.env`'den geçer).
3. Cloud Run'a deploy eder (`--allow-unauthenticated`, port 8080).
4. Sonunda canlı **servis URL'ini** yazar.

İlgili dosyalar: `cloudbuild.yaml` (build adımları), `.gcloudignore`
(Cloud Build'e yüklenmeyecekler).

### Ayarları değiştirme (opsiyonel)

`deploy-web.sh` şu env değişkenleriyle ezilebilir:

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `PROJECT_ID` | (zorunlu) | GCP proje ID'si |
| `REGION` | `europe-west3` | Bölge (Frankfurt — Türkiye'ye yakın) |
| `SERVICE` | `web-app` | Cloud Run servis adı |
| `REPO` | `web` | Artifact Registry depo adı |

Örnek:

```bash
export PROJECT_ID=benim-proje-123
export REGION=europe-west1
./deploy-web.sh
```

---

## 3) Deploy sonrası — KRİTİK adım

Cloud Run URL'in belli olunca Supabase Auth'a eklemen lazım, yoksa
login / e-posta onayı / redirect akışları çalışmaz:

**Supabase Dashboard → Authentication → URL Configuration**

- **Site URL:** `https://web-app-303173878476.europe-west3.run.app`
- **Redirect URLs:** aynı adresi ekle (gerekirse `/**` ile)

> Mevcut canlı dağıtım (proje `ai-hackathon-498718`):
> **https://web-app-303173878476.europe-west3.run.app**

---

## Sık karşılaşılan sorunlar

- **`pnpm install --frozen-lockfile` hatası:** Lockfile güncel değil. Kökte
  `pnpm install` çalıştırıp `pnpm-lock.yaml`'ı güncelle ve commit'le.
- **Build'de "supabase env yok" / boş sayfa:** `web-app/.env` içindeki
  `NEXT_PUBLIC_*` değerleri eksik. Bunlar build anında gömüldüğü için
  deploy'dan önce dolu olmalı.
- **`gcloud builds submit` → PERMISSION_DENIED:** Cloud Build API yeni açıldıysa
  IAM yayılımı için 1-2 dk bekle ve tekrar dene (Owner olsan bile olabilir).
- **Build worker SIGSEGV / segfault:** Bu, yerelde QEMU ile amd64 emüle ederken
  olur. `deploy-web.sh` build'i Cloud Build'e taşıdığı için bu sorun yaşanmaz.
- **403 / erişim yok:** Servis `--allow-unauthenticated` ile public açılıyor;
  yine de sorun varsa Cloud Run konsolundan "Allow unauthenticated" iznini kontrol et.

---

## Kendi domain'ini eklemek (opsiyonel, ileride)

Domain alınca Cloud Run'a bağlanabilir:
Cloud Run konsolu → servis → **Custom Domains** → domain ekle ve verilen
DNS kayıtlarını domain sağlayıcına gir. HTTPS sertifikası otomatik gelir.
