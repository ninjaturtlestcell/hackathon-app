#!/bin/bash
# Jira task bilgilerini okur
# Usage: ./jira-read.sh <TASK-NUMBER>
# Requires: JIRA_BASE_URL, JIRA_TOKEN, JIRA_USER env vars

set -euo pipefail

TASK_NUMBER="${1:?Task numarası gerekli (örn: WK471992-1234)}"

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

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer ${JIRA_TOKEN}" \
  -H "Content-Type: application/json" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${TASK_NUMBER}?fields=summary,description,comment,status,assignee,issuetype")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [[ "$HTTP_CODE" -ne 200 ]]; then
  echo "Error: Jira API returned HTTP ${HTTP_CODE}" >&2
  echo "$BODY" >&2
  exit 1
fi

echo "$BODY"
