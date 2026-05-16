#!/usr/bin/env bash
# Seeds an admin user through the API auth endpoint.
# Works with the PostgreSQL + EF Core backend.
# Requires: curl
#
# Usage: ./scripts/seed-admin.sh
# Usage: ./scripts/seed-admin.sh [username] [password] [api_base_url]

set -euo pipefail

USERNAME="${1:-admin}"
PASSWORD="${2:-password123}"
API_BASE_URL="${3:-http://localhost:5237}"
REGISTER_URL="${API_BASE_URL%/}/auth/register"

if ! command -v curl &>/dev/null; then
  echo "Error: curl is not installed."
  exit 1
fi

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

ESCAPED_USERNAME="$(json_escape "${USERNAME}")"
ESCAPED_PASSWORD="$(json_escape "${PASSWORD}")"
PAYLOAD="{\"username\":\"${ESCAPED_USERNAME}\",\"password\":\"${ESCAPED_PASSWORD}\",\"role\":\"admin\",\"groupId\":null}"

echo "Seeding admin user '${USERNAME}' via ${REGISTER_URL}..."

TMP_BODY="$(mktemp)"
HTTP_CODE="$(curl -sS -o "${TMP_BODY}" -w "%{http_code}" \
  -X POST "${REGISTER_URL}" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}")"

if [[ "${HTTP_CODE}" == "200" ]]; then
  echo "Admin user '${USERNAME}' created successfully."
  rm -f "${TMP_BODY}"
  exit 0
fi

echo "Admin seeding failed (HTTP ${HTTP_CODE})."
cat "${TMP_BODY}"
echo

if [[ "${HTTP_CODE}" == "403" ]]; then
  echo "Tip: a user likely already exists. Registration then requires an authenticated admin token."
fi

rm -f "${TMP_BODY}"
exit 1
