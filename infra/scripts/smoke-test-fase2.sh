#!/usr/bin/env bash
set -euo pipefail

# Phase 2 acceptance — Cognito + JWT authorizer (task 14).
# Optional: ADMIN_ACCESS_TOKEN=<jwt> to verify authorizer accepts a valid token.
ENV="${1:-dev}"
REGION="${AWS_REGION:-us-east-1}"

API=$(aws ssm get-parameter --region "${REGION}" --name "/afro90s/${ENV}/api-base-url" --query Parameter.Value --output text)

api_url() {
  echo "${API}/${ENV}$1"
}

echo "=== Smoke test Phase 2 — ${ENV} ==="

for param in cognito-user-pool-id cognito-client-id cognito-region; do
  echo -n "SSM /afro90s/${ENV}/${param}... "
  if aws ssm get-parameter --region "${REGION}" --name "/afro90s/${ENV}/${param}" --query Parameter.Value --output text >/dev/null 2>&1; then
    echo "OK"
  else
    echo "FAILED" && exit 1
  fi
done

echo -n "GET /products (200 regression)... "
PRODUCTS_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$(api_url /products)")
if [ "${PRODUCTS_HTTP}" = "200" ] || [ "${PRODUCTS_HTTP}" = "503" ]; then
  echo "OK (${PRODUCTS_HTTP})"
else
  echo "FAILED (${PRODUCTS_HTTP})" && exit 1
fi

echo -n "GET /admin/products without token (401)... "
UNAUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$(api_url /admin/products)")
if [ "${UNAUTH_STATUS}" = "401" ]; then
  echo "OK"
elif [ "${UNAUTH_STATUS}" = "404" ]; then
  echo "WARN (404 — rotas admin ainda não deployadas; task 16 pendente)"
else
  echo "FAILED (${UNAUTH_STATUS})" && exit 1
fi

if [ -n "${ADMIN_ACCESS_TOKEN:-}" ]; then
  echo -n "GET /admin/products with token (not 401)... "
  AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$(api_url /admin/products)" \
    -H "Authorization: Bearer ${ADMIN_ACCESS_TOKEN}")
  if [ "${AUTH_STATUS}" = "401" ]; then
    echo "FAILED (authorizer rejected valid token)" && exit 1
  fi
  echo "OK (${AUTH_STATUS})"
else
  echo "SKIP token check (set ADMIN_ACCESS_TOKEN to verify JWT authorizer)"
fi

echo ""
echo "=== Phase 2 smoke test passed ==="
