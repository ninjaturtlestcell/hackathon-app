#!/bin/bash
# Jira board'daki task'ları listeler
# Usage: ./jira-board-tasks.sh <BOARD_ID> [active|future|closed]
#        ./jira-board-tasks.sh --list-boards
# Requires: JIRA_BASE_URL, JIRA_TOKEN, JIRA_USER env vars

set -euo pipefail

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

AUTH_HEADER="Authorization: Bearer ${JIRA_TOKEN}"

# --list-boards: mevcut board'ları listele
if [[ "${1:-}" == "--list-boards" ]]; then
  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json" \
    "${JIRA_BASE_URL}/rest/agile/1.0/board?maxResults=50")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [[ "$HTTP_CODE" -ne 200 ]]; then
    echo "Error: Jira API returned HTTP ${HTTP_CODE}" >&2
    echo "$BODY" >&2
    exit 1
  fi

  echo "$BODY"
  exit 0
fi

BOARD_ID="${1:?Board ID gerekli (örn: 42) veya --list-boards}"
SPRINT_STATE="${2:-active}"

# Önce board'un aktif/ilgili sprint'ini bul
SPRINT_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  "${JIRA_BASE_URL}/rest/agile/1.0/board/${BOARD_ID}/sprint?state=${SPRINT_STATE}&maxResults=10")

SPRINT_HTTP_CODE=$(echo "$SPRINT_RESPONSE" | tail -n1)
SPRINT_BODY=$(echo "$SPRINT_RESPONSE" | sed '$d')

if [[ "$SPRINT_HTTP_CODE" -ne 200 ]]; then
  echo "Error: Sprint listesi alınamadı (HTTP ${SPRINT_HTTP_CODE})" >&2
  echo "$SPRINT_BODY" >&2
  exit 1
fi

# Sprint bulunamazsa board'un tüm issue'larını getir
SPRINT_COUNT=$(echo "$SPRINT_BODY" | grep -o '"id"' | wc -l | tr -d ' ')

if [[ "$SPRINT_COUNT" -eq 0 ]]; then
  echo "Uyarı: '${SPRINT_STATE}' sprint bulunamadı, board'un tüm issue'ları getiriliyor..." >&2

  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json" \
    "${JIRA_BASE_URL}/rest/agile/1.0/board/${BOARD_ID}/issue?maxResults=100&fields=summary,status,assignee,issuetype,priority,created,updated")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [[ "$HTTP_CODE" -ne 200 ]]; then
    echo "Error: Issue listesi alınamadı (HTTP ${HTTP_CODE})" >&2
    echo "$BODY" >&2
    exit 1
  fi

  echo "$BODY"
  exit 0
fi

# En son sprint ID'sini al (son eleman)
SPRINT_ID=$(echo "$SPRINT_BODY" | grep -o '"id":[0-9]*' | tail -1 | cut -d: -f2)

# Sprint'teki issue'ları getir
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  "${JIRA_BASE_URL}/rest/agile/1.0/sprint/${SPRINT_ID}/issue?maxResults=100&fields=summary,status,assignee,issuetype,priority,created,updated")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [[ "$HTTP_CODE" -ne 200 ]]; then
  echo "Error: Sprint issue'ları alınamadı (HTTP ${HTTP_CODE})" >&2
  echo "$BODY" >&2
  exit 1
fi

echo "$BODY"
