# Tasks — Implementação da infraestrutura Afro90s

Backlog de tarefas para implementar os recursos AWS via CDK no repositório `afro90sInfra`.

Todas as decisões de arquitetura já estão fechadas. Cada task descreve **o que implementar**, com checklists executáveis e critérios de conclusão claros.

Ambientes v1: **`dev`** e **`prod`** — mesma conta AWS (`083171867610`), região `us-east-1`.

## Legenda de status

| Status | Significado |
|--------|-------------|
| `pendente` | Ainda não iniciada |
| `em andamento` | Implementação em curso |
| `concluída` | Critérios de conclusão verificados |

## Índice

### Fundação

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 00 | [00-environments.md](00-environments.md) | Setup do repo CDK, AWS IAM, OIDC, bootstrap, GitHub |
| 01 | [01-cdk-stacks.md](01-cdk-stacks.md) | 5 stacks em `lib/stacks/` + `bin/app.ts` |
| 02 | [02-cdk-config-deploy.md](02-cdk-config-deploy.md) | `lib/config/{dev,prod}.ts` e scripts npm |
| 03 | [03-tags-naming.md](03-tags-naming.md) | Aspect de tags globais e tabela de naming |

### Recursos AWS

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 04 | [04-frontend-hosting.md](04-frontend-hosting.md) | S3 web + CloudFront OAC (SPA) |
| 05 | [05-assets-storage.md](05-assets-storage.md) | S3 assets + behavior `/assets/*` no CloudFront |
| 06 | [06-api-gateway-lambda.md](06-api-gateway-lambda.md) | HTTP API + Lambda router + authorizer Cognito |
| 07 | [07-dynamodb.md](07-dynamodb.md) | Tabelas `products` e `orders` + GSIs (free tier) |
| 08 | [08-cognito.md](08-cognito.md) | User Pool admins + App Client |
| 09 | [09-ses.md](09-ses.md) | Template SES + parâmetros SSM de e-mail |
| 10 | [10-iam-security.md](10-iam-security.md) | Roles Lambda (público e admin) com least privilege |

### Contratos e operação

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 11 | [11-outputs-env.md](11-outputs-env.md) | CfnOutputs + script `export-outputs.sh` |
| 12 | [12-secrets-ssm.md](12-secrets-ssm.md) | SSM Parameters + `.env.example` |
| 13 | [13-cicd.md](13-cicd.md) | 3 workflows GitHub Actions (validate, deploy-dev, deploy-prod) |
| 14 | [14-observability.md](14-observability.md) | Log groups 14d + dashboard CloudWatch free tier |
| 15 | [15-acceptance-phase1.md](15-acceptance-phase1.md) | Script smoke test + checklist aceite fase 1 |

## Ordem recomendada de execução

```
00 → 02 → 01 → 03
          ↓
     07 → 08 → 05 → 04
          ↓
     10 → 12 → 09 → 06
          ↓
     11 → 13 → 14 → 15
```

**Trilha mínima para 1º deploy:**
`00 → 02 → 01 → 03 → 07 → 08 → 10 → 05 → 04 → 06 → 12 → 11 → 13`

**Antes do aceite de fase 1:**
`14 → 15`

## Dependências entre tasks

| Task | Depende de |
|------|------------|
| 01 | 00 |
| 02 | 00 |
| 03 | 01 |
| 04, 07, 08 | 01, 02, 03 |
| 05 | 04 |
| 06 | 07, 08, 05, 10, 12 |
| 09 | 00 (SES verificado), 10, 12 |
| 10 | 07, 05 |
| 11 | 04–10 |
| 12 | 10 |
| 13 | 00 (GitHub configurado), 02 |
| 14 | 06 |
| 15 | 00–14 |

## Referências

- [Specs CDK](../cdk.md)
- [Recursos AWS](../resources.md)
- [Outputs](../outputs.md)
- [API routes](../../backend/api-routes.md)
