---
name: jira-read
description: 'Jira task okuma. Task numarası ile Jira REST API üzerinden issue bilgilerini (başlık, açıklama, yorumlar) getirir. Use when: reading Jira issues, fetching task details, getting task description and comments.'
argument-hint: 'Task numarası (örn: WK471992-1234)'
---

# Jira Read

Jira REST API üzerinden task bilgilerini okur.

## When to Use

- Bir Jira task'ının detaylarını öğrenmek gerektiğinde
- Task başlık, açıklama veya yorumlarını okumak gerektiğinde
- Analiz veya geliştirme öncesi task bilgisi gerektiğinde

## Procedure

1. Task numarasını al (örn: `WK471992-1234`)
2. [jira-read.sh](./scripts/jira-read.sh) script'ini çalıştır
3. Dönen JSON'dan `summary`, `description` ve `comment.comments` alanlarını oku

## Usage

```bash
./scripts/jira-read.sh WK471992-1234
```

## Output Format

JSON formatında issue detayları döner:
- `key`: Task numarası
- `fields.summary`: Başlık
- `fields.description`: Açıklama
- `fields.comment.comments[]`: Yorumlar listesi

## Requirements

Environment variables (`.env`):
- `JIRA_BASE_URL` — Jira instance URL
- `JIRA_TOKEN` — Personal Access Token
- `JIRA_USER` — Kullanıcı email
