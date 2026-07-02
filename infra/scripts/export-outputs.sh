#!/usr/bin/env bash
set -euo pipefail

ENV="${1:-dev}"
REGION="${AWS_REGION:-us-east-1}"
OUTPUT_FILE="infra/outputs-${ENV}.json"

mkdir -p infra

aws cloudformation describe-stacks \
  --region "${REGION}" \
  --query "Stacks[?contains(StackName, 'afro90s-${ENV}')].{StackName:StackName,Outputs:Outputs}" \
  --output json > "${OUTPUT_FILE}"

echo "Outputs salvos em ${OUTPUT_FILE}"
