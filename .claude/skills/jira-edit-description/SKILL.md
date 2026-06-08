---
name: jira-edit-description
description: 'Jira task description güncelleme. Task numarası ve yeni içerik ile Jira REST API üzerinden issue açıklamasını düzenler. Use when: editing task description, updating issue body, rewriting task details.'
argument-hint: 'Task numarası (örn: WK471992-1234) ve yeni description'
---

# Jira Edit Description

Jira REST API üzerinden bir task'ın description'ını günceller. Mevcut içeriğin üzerine yazar.

## When to Use

- Task açıklamasını güncellemek veya düzeltmek gerektiğinde
- Analiz sonrası task'a detaylı açıklama eklemek gerektiğinde

## Procedure

1. Task numarasını al (örn: `WK471992-1234`)
2. Yeni description'ı hazırla
3. [jira-edit-description.sh](./scripts/jira-edit-description.sh) script'ini çalıştır

## Usage

```bash
# Parametre ile
./scripts/jira-edit-description.sh WK471992-1234 "Yeni açıklama metni buraya"

# Stdin ile (uzun içerikler için)
echo "Uzun açıklama..." | ./scripts/jira-edit-description.sh WK471992-1234

# Dosyadan
./scripts/jira-edit-description.sh WK471992-1234 < description.txt
```

## Output

```
OK: WK471992-1234 description güncellendi.
URL: https://jira.turkcell.com.tr/browse/WK471992-1234
```

## Requirements

Environment variables (`.env`):
- `JIRA_BASE_URL` — Jira instance URL
- `JIRA_TOKEN` — Personal Access Token
