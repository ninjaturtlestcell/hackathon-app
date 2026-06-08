---
name: jira-comment
description: 'Jira task yorumu ekleme. Task numarası ve yorum içeriği ile Jira REST API üzerinden issue yorumu ekler. Use when: adding comments to Jira, posting analysis results, writing task updates.'
argument-hint: 'Task numarası ve yorum içeriği'
---

# Jira Comment

Jira REST API üzerinden bir task'a yorum ekler.

## When to Use

- Analiz sonucunu Jira task'ına eklemek gerektiğinde
- Geliştirme notu bırakmak gerektiğinde
- Task'a herhangi bir yorum yazmak gerektiğinde

## Procedure

1. Task numarasını al (örn: `WK471992-1234`)
2. Yorum içeriğini hazırla
3. [jira-comment.sh](./scripts/jira-comment.sh) script'ini çalıştır

## Usage

```bash
# Parametre ile
./.github/skills/jira-comment/scripts/jira-comment.sh WK471992-1234 "Analiz tamamlandı. Detaylar aşağıda..."

# Stdin ile (uzun yorumlar için)
echo "Uzun analiz metni..." | ./.github/skills/jira-comment/scripts/jira-comment.sh WK471992-1234
```

## Output Format

Başarılı ise eklenen yorumun JSON'unu döner.

## Requirements

Environment variables (`.env`):
- `JIRA_BASE_URL` — Jira instance URL
- `JIRA_TOKEN` — Personal Access Token
- `JIRA_USER` — Kullanıcı email
