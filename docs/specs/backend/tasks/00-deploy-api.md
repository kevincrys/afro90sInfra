# Task 00-deploy — CI/CD deploy da API (S3 + Lambda)

**Fase:** 0 — Fundação  
**Status:** pendente  
**Repo:** `afro90sBackend`  
**ADR:** [007-backend-lambda-s3-deploy.md](../../../foundation/adr/007-backend-lambda-s3-deploy.md)

## Objetivo

Configurar pipelines de **deploy do código Lambda** neste repositório: bundle via esbuild, upload para S3 e `update-function-code`. A infra (CDK) provisiona bucket e função; este repo publica o código.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Bundle | esbuild (`npm run bundle`) |
| Artefato | `lambda.zip` (handler + deps bundled) |
| Bucket | `afro90s-{env}-s3-lambda-artifacts` (criado pela infra) |
| Chaves S3 | `api/{git-sha}.zip` + `api/latest.zip` |
| Auth AWS | OIDC — role `afro90s-github-backend-{dev\|prod}` |
| Trigger dev | Push em branch `dev` |
| Trigger prod | Push em branch `main` + environment `prod` |

## O que implementar

### Scripts `package.json`

- [ ] `"bundle": "node scripts/bundle.mjs"` — esbuild em `src/handler.ts` → `dist/`
- [ ] `"package:lambda": "cd dist && zip -r ../lambda.zip ."` (ou script cross-platform)
- [ ] Manter `"build": "tsc --noEmit"` para CI typecheck (separado do bundle)

### `scripts/bundle.mjs` (esbuild)

- [ ] Entry: `src/handler.ts`
- [ ] Output: `dist/handler.js` (alinhar com `handler: 'handler.handler'` na Lambda)
- [ ] `target: node20`, `platform: node`, `format: cjs`, `minify: true`, `sourcemap: true`
- [ ] `bundle: true`

### `.github/workflows/deploy-dev.yml`

- [ ] Trigger: `push` em `dev`
- [ ] `environment: dev`
- [ ] Permissions: `id-token: write`, `contents: read`
- [ ] Steps:
  1. Checkout
  2. Node 20 + `npm ci`
  3. `npm run test:coverage` (mesmo gate do CI)
  4. `npm run bundle && npm run package:lambda`
  5. `configure-aws-credentials` com `${{ vars.AWS_ROLE_ARN }}`
  6. Upload S3:
     ```bash
     SHA=${{ github.sha }}
     aws s3 cp lambda.zip s3://${{ vars.ARTIFACT_BUCKET }}/api/$SHA.zip
     aws s3 cp lambda.zip s3://${{ vars.ARTIFACT_BUCKET }}/api/latest.zip
     ```
  7. Update Lambda:
     ```bash
     aws lambda update-function-code \
       --function-name ${{ vars.LAMBDA_FUNCTION_NAME }} \
       --s3-bucket ${{ vars.ARTIFACT_BUCKET }} \
       --s3-key api/latest.zip
     ```
  8. (Opcional) `aws lambda wait function-updated-v2 --function-name ...`

### `.github/workflows/deploy-prod.yml`

- [ ] Trigger: `push` em `main`
- [ ] `environment: prod`
- [ ] Steps idênticos ao deploy-dev com variables de prod

### Variables GitHub (por environment)

| Variable | Exemplo dev |
|----------|-------------|
| `AWS_ROLE_ARN` | `arn:aws:iam::083171867610:role/afro90s-github-backend-dev` |
| `AWS_REGION` | `us-east-1` |
| `ARTIFACT_BUCKET` | `afro90s-dev-s3-lambda-artifacts` |
| `LAMBDA_FUNCTION_NAME` | `afro90s-dev-lambda-api` |

## Pré-requisitos

- Task [00-setup-repo.md](00-setup-repo.md) concluída (estrutura + CI)
- Infra task 10 (API + bucket artefatos + Lambda placeholder) deployada
- Roles IAM backend criadas (infra task 00)

## Critérios de conclusão

- [ ] Merge em `dev` publica zip no S3 e Lambda responde com código novo
- [ ] `api/{sha}.zip` retido no bucket para rollback manual
- [ ] Merge em `main` deploya em prod (GitHub Environment `prod`) com approval do environment
- [ ] Nenhum `AWS_ACCESS_KEY_ID` no repositório
- [ ] Atualizar **Status** para `concluída`

## Rollback

```bash
aws s3 cp s3://BUCKET/api/COMMIT_ANTERIOR.zip s3://BUCKET/api/latest.zip
aws lambda update-function-code \
  --function-name FUNCTION \
  --s3-bucket BUCKET \
  --s3-key api/latest.zip
```

## Referências

- [github-pipeline-setup.md](../../../foundation/github-pipeline-setup.md)
- [pipelines/overview.md](../../pipelines/overview.md)
- [infra task 10-api-publica.md](../../infra/tasks/10-api-publica.md)
