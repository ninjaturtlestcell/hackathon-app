#!/bin/bash
# Jira task'ına yorum ekler
# Usage: ./jira-comment.sh <TASK-NUMBER> [COMMENT]
# COMMENT parametre olarak veya stdin'den alınabilir
# Requires: JIRA_BASE_URL, JIRA_TOKEN, JIRA_USER env vars

set -euo pipefail

TASK_NUMBER="${1:?Task numarası gerekli (örn: WK471992-1234)}"
shift

# Load .env if exists
if [[ -f "$(git rev-parse --show-toplevel)/.env" ]]; then
  set -a
  source "$(git rev-parse --show-toplevel)/.env"
  set +a
fi

if [[ -z "${JIRA_BASE_URL:-}" || -z "${JIRA_TOKEN:-}" ]]; then
  echo "Error: JIRA_BASE_URL ve JIRA_TOKEN environment variable'ları gerekli." >&2
  exit 1
fi

# Get comment from argument or stdin
if [[ $# -gt 0 ]]; then
  COMMENT="$*"
elif [[ ! -t 0 ]]; then
  COMMENT=$(cat)
else
  echo "Error: Yorum metni parametre olarak veya stdin'den verilmeli." >&2
  exit 1
fi

# Escape for JSON
COMMENT_ESCAPED=$(printf '%s' "$COMMENT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Authorization: Bearer ${JIRA_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"body\": ${COMMENT_ESCAPED}}" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${TASK_NUMBER}/comment")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [[ "$HTTP_CODE" -ne 201 ]]; then
  echo "Error: Jira API returned HTTP ${HTTP_CODE}" >&2
  echo "$BODY" >&2
  exit 1
fi

echo "$BODY"
