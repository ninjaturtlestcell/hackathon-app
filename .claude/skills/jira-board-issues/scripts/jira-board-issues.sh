#!/bin/bash
# Verilen board ID'deki tüm issue'ları getirir
# Usage: ./jira-board-issues.sh <BOARD_ID> [--status open|inprogress|closed|all] [--max 50]
# Requires: JIRA_BASE_URL, JIRA_TOKEN env vars

set -euo pipefail

# Load .env if exists
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
if [[ -f "$ROOT/.env" ]]; then
  set -a; source "$ROOT/.env"; set +a
fi

if [[ -z "${JIRA_BASE_URL:-}" || -z "${JIRA_TOKEN:-}" ]]; then
  echo "Error: JIRA_BASE_URL ve JIRA_TOKEN gerekli." >&2
  exit 1
fi

BOARD_ID="${1:?Board ID gerekli (örn: 21701)}"
STATUS_FILTER="all"
MAX_RESULTS=100

# Opsiyonel argümanları parse et
shift
while [[ $# -gt 0 ]]; do
  case "$1" in
    --status) STATUS_FILTER="$2"; shift 2 ;;
    --max)    MAX_RESULTS="$2";   shift 2 ;;
    *) echo "Bilinmeyen parametre: $1" >&2; exit 1 ;;
  esac
done

# JQL filtresi oluştur
case "$STATUS_FILTER" in
  open)       JQL='&jql=status%20in%20("Open","To+Do","Reopened")' ;;
  inprogress) JQL='&jql=status%20in%20("In+Progress")' ;;
  closed)     JQL='&jql=status%20in%20("Closed","Resolved","Done")' ;;
  all)        JQL="" ;;
  *) echo "Geçersiz --status değeri: open | inprogress | closed | all" >&2; exit 1 ;;
esac

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer ${JIRA_TOKEN}" \
  -H "Content-Type: application/json" \
  "${JIRA_BASE_URL}/rest/agile/1.0/board/${BOARD_ID}/issue?maxResults=${MAX_RESULTS}&fields=summary,status,assignee,issuetype,priority,created,updated${JQL}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [[ "$HTTP_CODE" -ne 200 ]]; then
  echo "Error: Jira API HTTP ${HTTP_CODE}" >&2
  echo "$BODY" >&2
  exit 1
fi

echo "$BODY"
