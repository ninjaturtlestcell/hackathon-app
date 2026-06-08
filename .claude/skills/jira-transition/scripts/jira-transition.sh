#!/bin/bash
# Jira task status geçişi yapar
# Usage: ./jira-transition.sh <TASK-NUMBER> <TARGET-STATUS>
# TARGET-STATUS: "start-dev" | "pr-opened" | "Custom Status Name"
# start-dev: Bug/Improvement → "In Progress", Task/Epic → "Geliştirme"
# pr-opened: Bug/Improvement → "Resolved", Task/Epic → "Geliştirme Done"
# Requires: JIRA_BASE_URL, JIRA_TOKEN env vars

set -euo pipefail

TASK_NUMBER="${1:?Task numarası gerekli (örn: WK471992-1234)}"
TARGET_STATUS="${2:?Hedef status gerekli (örn: \"start-dev\", \"pr-opened\", \"In Progress\")}"

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

# If using smart status, fetch issue type first
if [[ "$TARGET_STATUS" == "start-dev" || "$TARGET_STATUS" == "pr-opened" ]]; then
  ISSUE_RESPONSE=$(curl -s \
    -H "Authorization: Bearer ${JIRA_TOKEN}" \
    -H "Content-Type: application/json" \
    "${JIRA_BASE_URL}/rest/api/2/issue/${TASK_NUMBER}?fields=issuetype")
  
  ISSUE_TYPE=$(echo "$ISSUE_RESPONSE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(data.get('fields', {}).get('issuetype', {}).get('name', ''))
" 2>/dev/null || echo "")

  # Map smart status to actual Jira status
  if [[ "$TARGET_STATUS" == "start-dev" ]]; then
    if [[ "$ISSUE_TYPE" == "Bug" || "$ISSUE_TYPE" == "Improvement" ]]; then
      ACTUAL_STATUS="In Progress"
    else
      ACTUAL_STATUS="Geliştirme"
    fi
  elif [[ "$TARGET_STATUS" == "pr-opened" ]]; then
    if [[ "$ISSUE_TYPE" == "Bug" || "$ISSUE_TYPE" == "Improvement" ]]; then
      ACTUAL_STATUS="Resolved"
    else
      ACTUAL_STATUS="Geliştirme Done"
    fi
  fi
  
  echo "Issue type: ${ISSUE_TYPE} → Status: ${ACTUAL_STATUS}"
  TARGET_STATUS="$ACTUAL_STATUS"
fi

# Get available transitions
TRANSITIONS_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer ${JIRA_TOKEN}" \
  -H "Content-Type: application/json" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${TASK_NUMBER}/transitions")

HTTP_CODE=$(echo "$TRANSITIONS_RESPONSE" | tail -n1)
BODY=$(echo "$TRANSITIONS_RESPONSE" | sed '$d')

if [[ "$HTTP_CODE" -ne 200 ]]; then
  echo "Error: Transition listesi alınamadı. HTTP ${HTTP_CODE}" >&2
  echo "$BODY" >&2
  exit 1
fi

# Find transition ID matching target status (case-insensitive)
TRANSITION_ID=$(echo "$BODY" | python3 -c "
import json, sys
data = json.load(sys.stdin)
target = '${TARGET_STATUS}'.lower()
for t in data.get('transitions', []):
    if t['name'].lower() == target or t.get('to', {}).get('name', '').lower() == target:
        print(t['id'])
        break
")

if [[ -z "$TRANSITION_ID" ]]; then
  echo "Error: '${TARGET_STATUS}' durumuna geçiş bulunamadı." >&2
  echo "Mevcut geçişler:" >&2
  echo "$BODY" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for t in data.get('transitions', []):
    print(f\"  - {t['name']} (→ {t.get('to', {}).get('name', '?')})\")
" >&2
  exit 1
fi

# Execute transition
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Authorization: Bearer ${JIRA_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"transition\": {\"id\": \"${TRANSITION_ID}\"}}" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${TASK_NUMBER}/transitions")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [[ "$HTTP_CODE" -ne 204 ]]; then
  BODY=$(echo "$RESPONSE" | sed '$d')
  echo "Error: Transition başarısız. HTTP ${HTTP_CODE}" >&2
  echo "$BODY" >&2
  exit 1
fi

echo "✓ ${TASK_NUMBER} → '${TARGET_STATUS}' durumuna geçirildi."
