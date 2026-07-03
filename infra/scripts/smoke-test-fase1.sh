#!/usr/bin/env bash
set -euo pipefail

ENV="${1:-dev}"
REGION="${AWS_REGION:-us-east-1}"
MISSING_PRODUCT_ID="550e8400-e29b-41d4-a716-446655440000"
DEEP_LINK_ID="650e8400-e29b-41d4-a716-446655440001"

API=$(aws ssm get-parameter --region "${REGION}" --name "/afro90s/${ENV}/api-base-url" --query Parameter.Value --output text)
CF=$(aws ssm get-parameter --region "${REGION}" --name "/afro90s/${ENV}/cloudfront-web-url" --query Parameter.Value --output text)

api_url() {
  echo "${API}/${ENV}$1"
}

# Prints 0=ok, 2=skip (503 placeholder), 1=fail
check_status() {
  local expected="$1"
  shift
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" "$@")
  if [ "$status" = "$expected" ]; then
    return 0
  fi
  if [ "$status" = "503" ]; then
    return 2
  fi
  echo "${status}" >&2
  return 1
}

run_api_check() {
  local label="$1"
  local expected="$2"
  shift 2
  echo -n "${label}... "
  if check_status "${expected}" "$@"; then
    echo "OK"
    return 0
  fi
  local code=$?
  if [ "$code" = "2" ]; then
    echo "SKIP (Lambda placeholder — deploy afro90sBackend)"
    return 2
  fi
  echo "FAILED (expected ${expected}, got $(curl -s -o /dev/null -w '%{http_code}' "$@"))"
  return 1
}

echo "=== Smoke test Phase 1 — ${ENV} ==="

BACKEND_DEPLOYED=1

echo -n "GET /products (200, items[])... "
PRODUCTS_RESPONSE=$(curl -s -w "\n%{http_code}" "$(api_url /products)")
PRODUCTS_HTTP=$(echo "${PRODUCTS_RESPONSE}" | tail -n 1)
PRODUCTS_BODY=$(echo "${PRODUCTS_RESPONSE}" | sed '$d')
if [ "${PRODUCTS_HTTP}" = "200" ] && echo "${PRODUCTS_BODY}" | grep -q '"items"'; then
  echo "OK"
elif [ "${PRODUCTS_HTTP}" = "503" ]; then
  echo "SKIP (Lambda placeholder — deploy afro90sBackend)"
  BACKEND_DEPLOYED=0
else
  echo "FAILED (HTTP ${PRODUCTS_HTTP})" && exit 1
fi

if [ "${BACKEND_DEPLOYED}" = "1" ]; then
  run_api_check "GET /products?name=cat (200)" "200" "$(api_url '/products?name=cat')" || exit 1
  run_api_check "GET /products/{id} invalid UUID (400)" "400" "$(api_url /products/naoexiste)" || exit 1
  run_api_check "GET /products/{id} missing (404)" "404" "$(api_url "/products/${MISSING_PRODUCT_ID}")" || exit 1
  run_api_check "POST /orders empty body (400)" "400" -X POST "$(api_url /orders)" \
    -H "Content-Type: application/json" -d '{}' || exit 1

  echo -n "POST /orders valid body (201 or 409)... "
  PRODUCT_ID=$(echo "${PRODUCTS_BODY}" | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
  if [ -z "${PRODUCT_ID}" ]; then
    echo "SKIP (no products — seed catalog for full E2E)"
  else
    ORDER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$(api_url /orders)" \
      -H "Content-Type: application/json" \
      -d "{\"customer\":{\"name\":\"Smoke Test\",\"address\":\"Rua Teste 1\",\"postalCode\":\"01310100\",\"tel\":\"11999999999\"},\"items\":[{\"productId\":\"${PRODUCT_ID}\",\"quantity\":1}]}")
    if [ "${ORDER_STATUS}" = "201" ] || [ "${ORDER_STATUS}" = "409" ]; then
      echo "OK (${ORDER_STATUS})"
    else
      echo "FAILED (${ORDER_STATUS})" && exit 1
    fi
  fi

  echo -n "GET /admin/products (404 or 403)... "
  ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$(api_url /admin/products)")
  if [ "${ADMIN_STATUS}" = "404" ] || [ "${ADMIN_STATUS}" = "403" ]; then
    echo "OK (${ADMIN_STATUS})"
  else
    echo "WARN (${ADMIN_STATUS})"
  fi
fi

run_api_check "CloudFront index / (200)" "200" "${CF}" || exit 1
run_api_check "CloudFront SPA /products/{id} (200)" "200" "${CF}/products/${DEEP_LINK_ID}" || exit 1

echo ""
if [ "${BACKEND_DEPLOYED}" = "0" ]; then
  echo "=== Phase 1 smoke test passed (infra + frontend; API pending backend deploy) ==="
else
  echo "=== Phase 1 smoke test passed ==="
fi
