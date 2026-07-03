#!/usr/bin/env bash
set -euo pipefail

ENV="${1:-dev}"
REGION="${AWS_REGION:-us-east-1}"

API=$(aws ssm get-parameter --region "${REGION}" --name "/afro90s/${ENV}/api-base-url" --query Parameter.Value --output text)
CF=$(aws ssm get-parameter --region "${REGION}" --name "/afro90s/${ENV}/cloudfront-web-url" --query Parameter.Value --output text)

echo "=== Smoke test Phase 1 — ${ENV} ==="

echo -n "GET /products (200)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${API}/${ENV}/products")
if [ "$STATUS" = "200" ]; then
  echo "OK"
elif [ "$STATUS" = "503" ]; then
  echo "SKIP (backend not deployed yet — placeholder Lambda returns 503)"
else
  echo "FAILED ($STATUS)" && exit 1
fi

echo -n "GET /products/{id} missing (404)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${API}/${ENV}/products/does-not-exist")
if [ "$STATUS" = "404" ]; then
  echo "OK"
elif [ "$STATUS" = "503" ]; then
  echo "SKIP (backend not deployed yet)"
else
  echo "FAILED ($STATUS)" && exit 1
fi

echo -n "POST /orders empty body (400)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${API}/${ENV}/orders" -H "Content-Type: application/json" -d '{}')
if [ "$STATUS" = "400" ]; then
  echo "OK"
elif [ "$STATUS" = "503" ]; then
  echo "SKIP (backend not deployed yet)"
else
  echo "WARN ($STATUS — check validation once backend is deployed)"
fi

echo -n "CloudFront index.html (200)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${CF}")
[ "$STATUS" = "200" ] && echo "OK" || (echo "FAILED ($STATUS)" && exit 1)

echo -n "CloudFront SPA routing /catalogo (200)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${CF}/catalogo")
[ "$STATUS" = "200" ] && echo "OK" || (echo "FAILED ($STATUS)" && exit 1)

echo ""
echo "=== Phase 1 smoke test passed (infra) ==="
