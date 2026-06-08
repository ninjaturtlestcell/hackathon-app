---
name: jira-transition
description: 'Jira task status geçişi. Task numarası ve hedef status ile Jira REST API üzerinden issue durumunu günceller. Use when: changing task status, moving task to In Progress, moving to Code Review, updating Jira workflow state.'
argument-hint: 'Task numarası ve hedef status (örn: WK471992-1234 "In Progress")'
---

# Jira Transition

Jira REST API üzerinden bir task'ın durumunu değiştirir.

## When to Use

- Analiz başladığında → `start-dev` (Bug/Improvement: "In Progress", Task/Epic: "Geliştirme")
- PR açıldığında → `pr-opened` (Bug/Improvement: "Resolved", Task/Epic: "Geliştirme Done")
- Manuel status değişikliği → Direkt status adı

## Board Mapping

**Ana board** (Task, Epic):
- Analiz başlangıcı → "Geliştirme"
- PR açıldığında → "Geliştirme Done"

**Bug board** (Bug, Improvement):
- Analiz başlangıcı → "In Progress"
- PR açıldığında → "Resolved"

## Procedure

1. Task numarasını ve hedef status'ü al
2. Smart status kullanılıyorsa (`start-dev`, `pr-opened`), issue type'a göre uygun status'ü seç
3. [jira-transition.sh](./scripts/jira-transition.sh) script'ini çalıştır
4. Script otomatik olarak:
   - Mevcut transition'ları sorgular
   - Hedef status'e uygun transition ID'sini bulur
   - Geçişi uygular

## Usage

```bash
# Smart status (önerilen)
./.github/skills/jira-transition/scripts/jira-transition.sh WK471992-1234 start-dev
./.github/skills/jira-transition/scripts/jira-transition.sh WK471992-1234 pr-opened

# Manuel status
./.github/skills/jira-transition/scripts/jira-transition.sh WK471992-1234 "In Progress"
./.github/skills/jira-transition/scripts/jira-transition.sh WK471992-1234 "Resolved"
```

## Requirements

Environment variables (`.env`):
- `JIRA_BASE_URL` — Jira instance URL
- `JIRA_TOKEN` — Personal Access Token
