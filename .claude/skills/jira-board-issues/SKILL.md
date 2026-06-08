---
name: jira-board-issues
description: 'Board ID ile Jira task listesi çekme. Board ID verince doğrudan issue listesini getirir. Use when: fetching tasks by board ID, listing board issues, getting all issues on a specific Jira board.'
argument-hint: 'Board ID (örn: 21701)'
---

# Jira Board Issues

Board ID verince o board'daki tüm issue'ları getirir. Sprint arama yapmaz, doğrudan board endpoint'ini kullanır.

## When to Use

- Elinde board ID varsa ve task listesi lazımsa
- Belirli bir board'daki issue'ları listelemek gerektiğinde
- Durum bazlı filtreleme yapmak gerektiğinde

## Procedure

1. Board ID'yi al (örn: `21701`)
2. [jira-board-issues.sh](./scripts/jira-board-issues.sh) script'ini çalıştır
3. Dönen JSON'dan `issues[]` listesini oku

## Usage

```bash
# Tüm issue'lar (varsayılan, max 100)
./scripts/jira-board-issues.sh 21701

# Sadece açık issue'lar
./scripts/jira-board-issues.sh 21701 --status open

# Devam eden issue'lar
./scripts/jira-board-issues.sh 21701 --status inprogress

# Kapalı issue'lar, max 50
./scripts/jira-board-issues.sh 21701 --status closed --max 50
```

## Output Format

JSON formatında issue listesi:
- `issues[].key`: Task numarası (örn: WK471992-1327)
- `issues[].fields.summary`: Başlık
- `issues[].fields.status.name`: Durum
- `issues[].fields.assignee.displayName`: Atanan kişi
- `issues[].fields.issuetype.name`: Issue tipi
- `issues[].fields.priority.name`: Öncelik
- `total`: Board'daki toplam issue sayısı

## Requirements

Environment variables (`.env`):
- `JIRA_BASE_URL` — Jira instance URL (örn: https://jira.turkcell.com.tr)
- `JIRA_TOKEN` — Personal Access Token
