---
name: jira-create-task
description: 'Jira board''una yeni task oluşturma. Proje anahtarı ve başlık ile Jira REST API üzerinden issue oluşturur. Use when: creating new Jira tasks, adding issues to a board, opening a bug or improvement.'
argument-hint: 'Proje anahtarı (örn: WK471992) ve task başlığı'
---

# Jira Create Task

Jira REST API üzerinden belirtilen projeye yeni issue oluşturur.

## When to Use

- Bir board'a yeni task, bug veya improvement açmak gerektiğinde
- Geliştirme sırasında tespit edilen bir sorunu Jira'ya kaydetmek gerektiğinde

## Procedure

1. Proje anahtarını al (örn: `WK471992`)
2. Task başlığını belirle
3. Opsiyonel: tip, açıklama, atanan kişi
4. [jira-create-task.sh](./scripts/jira-create-task.sh) script'ini çalıştır
5. Dönen `key` ve URL'i kullan

## Usage

```bash
# Basit task
./scripts/jira-create-task.sh WK471992 "Yeni hata: login sayfası crash"

# Tip belirterek
./scripts/jira-create-task.sh WK471992 "Hasar ihbar formu boş geliyor" --type Bug

# Açıklama ile
./scripts/jira-create-task.sh WK471992 "Rate limiting eklenmeli" \
  --type Improvement \
  --desc "OTP servisine dakikada max 5 istek sınırı koyulmalı"

# Atanan kişiyle
./scripts/jira-create-task.sh WK471992 "Login fix" \
  --type Bug \
  --assignee fatih.telis@turkcell.com.tr
```

## Desteklenen --type Değerleri

`Bug` · `Improvement` · `Task` · `Story` · `Epic`  
(Projenin Jira konfigürasyonuna bağlıdır)

## Output Format

```
Oluşturuldu: WK471992-1340
URL: https://jira.turkcell.com.tr/browse/WK471992-1340

{ "id": "...", "key": "WK471992-1340", "self": "..." }
```

## Requirements

Environment variables (`.env`):
- `JIRA_BASE_URL` — Jira instance URL (örn: https://jira.turkcell.com.tr)
- `JIRA_TOKEN` — Personal Access Token
