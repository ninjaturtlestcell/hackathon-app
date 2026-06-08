#!/bin/bash
# Jira board'una yeni task oluşturur
# Usage: ./jira-create-task.sh <PROJECT_KEY> <SUMMARY> [--type Bug|Improvement|Task] [--desc "açıklama"] [--assignee email]
# Requires: JIRA_BASE_URL, JIRA_TOKEN env vars

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
if [[ -f "$ROOT/.env" ]]; then
  set -a; source "$ROOT/.env"; set +a
fi

if [[ -z "${JIRA_BASE_URL:-}" || -z "${JIRA_TOKEN:-}" ]]; then
  echo "Error: JIRA_BASE_URL ve JIRA_TOKEN gerekli." >&2
  exit 1
fi

PROJECT_KEY="${1:?Proje anahtarı gerekli (örn: WK471992)}"
SUMMARY="${2:?Task başlığı gerekli}"
ISSUE_TYPE="Task"
DESCRIPTION=""
ASSIGNEE_EMAIL=""

shift 2
while [[ $# -gt 0 ]]; do
  case "$1" in
    --type)     ISSUE_TYPE="$2";     shift 2 ;;
    --desc)     DESCRIPTION="$2";    shift 2 ;;
    --assignee) ASSIGNEE_EMAIL="$2"; shift 2 ;;
    *) echo "Bilinmeyen parametre: $1" >&2; exit 1 ;;
  esac
done

# Assignee bloğu
ASSIGNEE_JSON=""
if [[ -n "$ASSIGNEE_EMAIL" ]]; then
  # Kullanıcı accountId'sini e-posta ile bul
  ACCOUNT_RESP=$(curl -s \
    -H "Authorization: Bearer ${JIRA_TOKEN}" \
    "${JIRA_BASE_URL}/rest/api/2/user/search?username=${ASSIGNEE_EMAIL}")
  ACCOUNT_ID=$(echo "$ACCOUNT_RESP" | python3 -c "
import json,sys
users=json.load(sys.stdin)
print(users[0]['accountId'] if users else '')
" 2>/dev/null || true)
  if [[ -n "$ACCOUNT_ID" ]]; then
    ASSIGNEE_JSON=", \"assignee\": {\"accountId\": \"${ACCOUNT_ID}\"}"
  fi
fi

# Description bloğu (Jira API v2 string formatı)
DESC_JSON=""
if [[ -n "$DESCRIPTION" ]]; then
  ESCAPED=$(echo "$DESCRIPTION" | python3 -c "import json,sys; print(json.dumps(sys.stdin.read().strip()))")
  DESC_JSON=", \"description\": ${ESCAPED}"
fi

PAYLOAD=$(cat <<EOF
{
  "fields": {
    "project": { "key": "${PROJECT_KEY}" },
    "summary": $(echo "$SUMMARY" | python3 -c "import json,sys; print(json.dumps(sys.stdin.read().strip()))"),
    "issuetype": { "name": "${ISSUE_TYPE}" }
    ${DESC_JSON}${ASSIGNEE_JSON}
  }
}
EOF
)

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Authorization: Bearer ${JIRA_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "${JIRA_BASE_URL}/rest/api/2/issue")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [[ "$HTTP_CODE" -ne 201 ]]; then
  echo "Error: Jira API HTTP ${HTTP_CODE}" >&2
  echo "$BODY" >&2
  exit 1
fi

# Oluşturulan task'ın key ve URL'ini yazdır
echo "$BODY" | python3 -c "
import json, sys, os
data = json.load(sys.stdin)
key = data.get('key','?')
base = os.environ.get('JIRA_BASE_URL','')
print(f'Oluşturuldu: {key}')
print(f'URL: {base}/browse/{key}')
print()
print(json.dumps(data, indent=2))
"
