#!/bin/bash
# Jira task'ının description'ını günceller
# Usage: ./jira-edit-description.sh <TASK-NUMBER> [DESCRIPTION]
# DESCRIPTION parametre olarak veya stdin'den alınabilir
# Requires: JIRA_BASE_URL, JIRA_TOKEN env vars

set -euo pipefail

TASK_NUMBER="${1:?Task numarası gerekli (örn: WK471992-1234)}"
shift

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
if [[ -f "$ROOT/.env" ]]; then
  set -a; source "$ROOT/.env"; set +a
fi

if [[ -z "${JIRA_BASE_URL:-}" || -z "${JIRA_TOKEN:-}" ]]; then
  echo "Error: JIRA_BASE_URL ve JIRA_TOKEN gerekli." >&2
  exit 1
fi

# Description'ı parametre veya stdin'den al
if [[ $# -gt 0 ]]; then
  DESCRIPTION="$*"
elif [[ ! -t 0 ]]; then
  DESCRIPTION=$(cat)
else
  echo "Error: Description metni parametre olarak veya stdin'den verilmeli." >&2
  exit 1
fi

DESC_ESCAPED=$(printf '%s' "$DESCRIPTION" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X PUT \
  -H "Authorization: Bearer ${JIRA_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"fields\": {\"description\": ${DESC_ESCAPED}}}" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${TASK_NUMBER}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [[ "$HTTP_CODE" -ne 204 ]]; then
  echo "Error: Jira API HTTP ${HTTP_CODE}" >&2
  echo "$BODY" >&2
  exit 1
fi

echo "OK: ${TASK_NUMBER} description güncellendi."
echo "URL: ${JIRA_BASE_URL}/browse/${TASK_NUMBER}"
