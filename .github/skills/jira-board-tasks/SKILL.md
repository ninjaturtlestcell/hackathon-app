---
name: jira-board-tasks
description: 'Jira board task listesi çekme. Board ID ile Jira REST API üzerinden sprint içindeki issue listesini getirir. Use when: listing board tasks, fetching sprint issues, getting all tasks on a board.'
argument-hint: 'Board ID (örn: 42) ve opsiyonel sprint filtresi (active|future|closed)'
---

# Jira Board Tasks

Jira REST API üzerinden bir board'daki task'ları listeler.

## When to Use

- Bir board'daki tüm task'ları görmek gerektiğinde
- Sprint içindeki issue'ları listelemek gerektiğinde
- Board'daki task'ları analiz etmek gerektiğinde

## Procedure

1. Board ID'sini al (örn: `42`)
2. Opsiyonel olarak sprint tipini belirt: `active` (varsayılan), `future`, `closed`
3. [jira-board-tasks.sh](./scripts/jira-board-tasks.sh) script'ini çalıştır
4. Dönen JSON'dan `issues[]` listesini oku

## Usage

```bash
# Aktif sprint task'ları (varsayılan)
./scripts/jira-board-tasks.sh 42

# Belirli sprint tipiyle
./scripts/jira-board-tasks.sh 42 active
./scripts/jira-board-tasks.sh 42 future
./scripts/jira-board-tasks.sh 42 closed

# Board ID bilinmiyorsa — board listesi çek
./scripts/jira-board-tasks.sh --list-boards
```

## Output Format

JSON formatında issue listesi döner:
- `issues[].key`: Task numarası
- `issues[].fields.summary`: Başlık
- `issues[].fields.status.name`: Durum
- `issues[].fields.assignee.displayName`: Atanan kişi
- `issues[].fields.issuetype.name`: Issue tipi
- `total`: Toplam issue sayısı

## Requirements

Environment variables (`.env`):
- `JIRA_BASE_URL` — Jira instance URL
- `JIRA_TOKEN` — Personal Access Token
- `JIRA_USER` — Kullanıcı email
