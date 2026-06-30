# Tasks — Refinamento das specs de infra

Backlog de tarefas pequenas para refinar [`overview.md`](../overview.md), [`cdk.md`](../cdk.md), [`resources.md`](../resources.md) e [`outputs.md`](../outputs.md).

Os specs principais permanecem em **quatro arquivos únicos**. Cada task concluída deve resultar em edições pontuais nos specs alvo.

Ambientes v1: **`dev`** e **`production`** (sem `staging`).

## Legenda de status

| Status | Significado |
|--------|-------------|
| `pendente` | Ainda não revisada |
| `em revisão` | Decisões em andamento |
| `concluída` | Specs alvo atualizadas |

Atualize o campo **Status** no topo de cada arquivo de task.

## Índice

### Fundação CDK

| Task | Arquivo | Foco |
|------|---------|------|
| 00 | [00-environments.md](00-environments.md) | Ambientes dev/production, região, isolamento |
| 01 | [01-cdk-stacks.md](01-cdk-stacks.md) | Stacks, dependências, constructs |
| 02 | [02-cdk-config-deploy.md](02-cdk-config-deploy.md) | Config por env, bootstrap, comandos |
| 03 | [03-tags-naming.md](03-tags-naming.md) | Naming e tags obrigatórias |

### Recursos AWS

| Task | Arquivo | Foco |
|------|---------|------|
| 04 | [04-frontend-hosting.md](04-frontend-hosting.md) | S3 SPA + CloudFront |
| 05 | [05-assets-storage.md](05-assets-storage.md) | S3 imagens + CDN |
| 06 | [06-api-gateway-lambda.md](06-api-gateway-lambda.md) | HTTP API + Lambdas |
| 07 | [07-dynamodb.md](07-dynamodb.md) | Tabelas e GSIs |
| 08 | [08-cognito.md](08-cognito.md) | User Pool admin |
| 09 | [09-ses.md](09-ses.md) | E-mail de pedidos |
| 10 | [10-iam-security.md](10-iam-security.md) | Roles e least privilege |

### Contratos e operação

| Task | Arquivo | Foco |
|------|---------|------|
| 11 | [11-outputs-env.md](11-outputs-env.md) | Outputs CFN e env vars |
| 12 | [12-secrets-ssm.md](12-secrets-ssm.md) | SSM, secrets, parâmetros |
| 13 | [13-cicd.md](13-cicd.md) | GitHub Actions |
| 14 | [14-observability.md](14-observability.md) | Logs, métricas, alarmes |
| 15 | [15-acceptance-phase1.md](15-acceptance-phase1.md) | Critérios aceite fase 1 |

## Ordem sugerida

**Trilha mínima (modelar antes de codar CDK):** `00 → 03 → 01 → 07 → 05 → 04`

**Trilha API/integração:** `08 → 06 → 09 → 10 → 11 → 12`

**Antes do primeiro deploy:** `02 → 13 → 15`

**Cross-link backend:** [07-dynamodb.md](07-dynamodb.md) ↔ [backend/tasks/15-dynamodb-access.md](../../backend/tasks/15-dynamodb-access.md)

## Como usar

1. Abra uma task e preencha **Decisões a tomar** e **Notas / rascunho**.
2. Marque **Status** como `em revisão` enquanto discute.
3. Ao fechar decisões, edite as seções referenciadas nos specs alvo.
4. Marque checklists em **Quando concluir** e mude **Status** para `concluída`.

## Template

```markdown
# Task NN — Título
**Status:** pendente
**Arquivos alvo:** ...

## Objetivo
## Decisões a tomar
## Checklist de refinamento
## Notas / rascunho
## Quando concluir
```
