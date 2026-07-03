# Spec: Outputs — Contrato para aplicações

**Status:** Aprovado  
**Última atualização:** 2025-06-23

## Objetivo

Documentar valores exportados pelo CDK para consumo pelos repositórios `afro90sBackend` e `afro90sFrontend`.

## Outputs do CDK (CloudFormation)

| Output | Descrição | Consumidor |
|--------|-----------|------------|
| `ApiBaseUrl` | URL base do API Gateway | frontend, backend (testes) |
| `CloudFrontWebUrl` | URL do frontend | CI deploy SPA |
| `AssetsCdnUrl` | Base URL das imagens (`https://{cf}/assets`) | backend, frontend — **FrontendStack** |
| `AssetsBucketName` | Bucket S3 de imagens | backend Lambda — **StorageStack** |
| `CognitoUserPoolId` | ID do User Pool | frontend admin |
| `CognitoClientId` | App client ID | frontend admin |
| `CognitoRegion` | Região AWS | frontend admin |
| `ProductsTableName` | Nome tabela DynamoDB | backend Lambda |
| `OrdersTableName` | Nome tabela DynamoDB | backend Lambda |
| `LambdaProductsPublicFunctionName` | Nome da Lambda products (público) | backend deploy workflow |
| `LambdaOrdersPublicFunctionName` | Nome da Lambda orders (público) | backend deploy workflow |
| `LambdaProductsAdminFunctionName` | Nome da Lambda products (admin) | backend deploy workflow |
| `LambdaOrdersAdminFunctionName` | Nome da Lambda orders (admin) | backend deploy workflow |
| `LambdaArtifactsBucketName` | Bucket zip da Lambda | backend deploy workflow |
| `SesFromEmail` | E-mail remetente SES | backend Lambda |
| `AdminNotificationEmail` | E-mail destino pedidos | backend Lambda |

## Variáveis de ambiente — Frontend (`afro90sFrontend`)

Build-time (`VITE_*`) — lidos pelo workflow **via SSM** após OIDC (fase 1):

| Variável build | Path SSM |
|----------------|----------|
| `VITE_API_BASE_URL` | `/afro90s/{env}/api-base-url` |
| `VITE_ASSETS_CDN_URL` | `/afro90s/{env}/assets-cdn-url` |
| `VITE_WHATSAPP_NUMBER` | `/afro90s/{env}/whatsapp-number` |
| `VITE_COGNITO_*` | Outputs Cognito (fase 2+) — GitHub vars ou placeholder |

## Variáveis GitHub — Frontend deploy (`afro90sFrontend`)

### Onde cada valor vive

| Camada | Papel |
|--------|--------|
| **AWS (fonte da verdade)** | CDK cria SSM para `VITE_*`; bucket e CloudFront são recursos fixos por env |
| **GitHub Environment** | OIDC + destino do deploy (bucket + distribution ID) |
| **Workflow** | Lê GitHub vars (deploy) + SSM (build) em runtime |

### GitHub Environment (`dev` / `prod`)

Configurar em **Settings → Environments** do repositório `afro90sFrontend`.

| Variable | Origem (AWS) | Exemplo dev | Onde o workflow lê |
|----------|--------------|-------------|-------------------|
| `AWS_ROLE_ARN` | IAM (template OIDC) | `arn:aws:iam::083171867610:role/afro90s-github-frontend-dev` | `${{ vars.AWS_ROLE_ARN }}` — **obrigatório** |
| `AWS_REGION` | fixo | `us-east-1` | `${{ vars.AWS_REGION }}` |
| `S3_BUCKET` | convenção naming / bucket web CDK | `afro90s-dev-s3-web` | `${{ vars.S3_BUCKET }}` — sync S3 |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront console ou CF stack frontend → resource `WebDistribution` | `E1234567890ABC` | `${{ vars.CLOUDFRONT_DISTRIBUTION_ID }}` — invalidação |

> **`CLOUDFRONT_DISTRIBUTION_ID` deve ser o mesmo ID** usado no parâmetro `FrontendDevCloudFrontDistributionId` / `FrontendProdCloudFrontDistributionId` do template [`github-oidc-roles.template.yaml`](../../../infra/iam/github-oidc-roles.template.yaml). Cada role só pode invalidar **a distribuição do seu ambiente** — dev nunca compartilha ARN com prod.

> **`VITE_*` (fase 1) não vão no GitHub** — o workflow lê SSM após `configure-aws-credentials`. Role frontend precisa de `ssm:GetParameter` em `/afro90s/{env}/*`.

### Setup inicial (após `cdk deploy` task 06 + 10)

1. CloudFront console (ou stack `afro90s-{env}-stack-frontend` → Resources → `WebDistribution`) → copiar distribution ID **dev** e **prod**
2. Atualizar stack OIDC com os IDs (ou criar roles manualmente no console)
3. GitHub Environment **`dev`**: `AWS_ROLE_ARN`, `AWS_REGION`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`
4. GitHub Environment **`prod`**: mesmas chaves, valores prod
5. `VITE_COGNITO_*`: placeholder até fase 2

## Variáveis GitHub — Backend deploy (`afro90sBackend`)

### Onde cada valor vive

| Camada | Papel |
|--------|--------|
| **AWS (fonte da verdade)** | CDK cria CfnOutputs + SSM na task 10 |
| **GitHub Environment** | Cache de config do CI — valores copiados manualmente após deploy infra |
| **Workflow** | Lê GitHub vars + SSM em runtime |

### GitHub Environment (`dev` / `prod`)

Configurar em **Settings → Environments** do repositório `afro90sBackend`.

| Variable | Origem (AWS) | Exemplo dev | Onde o workflow lê |
|----------|--------------|-------------|-------------------|
| `AWS_ROLE_ARN` | IAM (task 00) | `arn:aws:iam::083171867610:role/afro90s-github-backend-dev` | `${{ vars.AWS_ROLE_ARN }}` — **obrigatório** no Environment (OIDC) |
| `AWS_REGION` | fixo | `us-east-1` | `${{ vars.AWS_REGION }}` |
| `ARTIFACT_BUCKET` | Output `LambdaArtifactsBucketName` ou SSM `/afro90s/{env}/lambda-artifacts-bucket` | `afro90s-dev-s3-lambda-artifacts` | `${{ vars.ARTIFACT_BUCKET }}` |

> **`ARTIFACT_BUCKET` não vai no SSM para o CI ler em runtime** — copie uma vez do output CDK para o GitHub Environment. Nome estável; evita API extra no pipeline.

### Nomes das Lambdas — SSM (preferido)

**Não** duplicar 4 function names no GitHub. Após `configure-aws-credentials`, o workflow lê:

| Flow | SSM path | Exemplo dev |
|------|----------|-------------|
| `products-public` | `/afro90s/{env}/lambda-products-public-name` | `afro90s-dev-lambda-products-public` |
| `orders-public` | `/afro90s/{env}/lambda-orders-public-name` | `afro90s-dev-lambda-orders-public` |
| `products-admin` | `/afro90s/{env}/lambda-products-admin-name` | `afro90s-dev-lambda-products-admin` |
| `orders-admin` | `/afro90s/{env}/lambda-orders-admin-name` | `afro90s-dev-lambda-orders-admin` |

```bash
FN=$(aws ssm get-parameter \
  --name "/afro90s/${ENV}/lambda-${FLOW}-name" \
  --query Parameter.Value --output text)
```

A role OIDC `afro90s-github-backend-{env}` precisa de `ssm:GetParameter` em `/afro90s/{env}/*` (template `github-oidc-roles.template.yaml`).

**Alternativa (manual):** copiar outputs `Lambda*FunctionName` para GitHub Variables — funciona, mas exige sync após cada redeploy infra.

### Setup inicial (após `cdk deploy` task 10)

1. Infra: `bash infra/scripts/export-outputs.sh dev` → `infra/outputs-dev.json`
2. Copiar `LambdaArtifactsBucketName` → GitHub Environment `dev` → variable `ARTIFACT_BUCKET`
3. Repetir para `prod`
4. Backend: primeiro push em `dev` — workflow lê nomes das funções via SSM

### O que **não** vai no GitHub

| Valor | Onde fica |
|-------|-----------|
| `PRODUCTS_TABLE`, `ORDERS_TABLE`, etc. | CDK `environment` na Lambda |
| Zip do código | S3 `{flow}/latest.zip` |
| Secrets | SSM / Secrets Manager |

## Variáveis de ambiente — Backend Lambda (via CDK)

| Variável | Origem |
|----------|--------|
| `PRODUCTS_TABLE` | `ProductsTableName` |
| `ORDERS_TABLE` | `OrdersTableName` |
| `ASSETS_BUCKET` | `AssetsBucketName` |
| `ASSETS_CDN_URL` | `AssetsCdnUrl` |
| `SES_FROM_EMAIL` | `SesFromEmail` |
| `ADMIN_EMAIL` | `AdminNotificationEmail` |
| `AWS_REGION` | região do deploy (reservada — não setar na Lambda) |

> Lambdas recebem essas variáveis via CDK `environment` no deploy — não commitar valores em `.env`.

## Parâmetros SSM Parameter Store (fase 1)

Criados via CDK `StringParameter` em `us-east-1`. Paths sob `/afro90s/{env}/`.

| Path | Stack | Disponível desde |
|------|-------|------------------|
| `/afro90s/{env}/products-table-name` | DatabaseStack | task 05 |
| `/afro90s/{env}/orders-table-name` | DatabaseStack | task 05 |
| `/afro90s/{env}/assets-bucket-name` | StorageStack | task 07 |
| `/afro90s/{env}/assets-bucket-arn` | StorageStack | task 07 |
| `/afro90s/{env}/cloudfront-web-url` | FrontendStack | task 06 |
| `/afro90s/{env}/assets-cdn-url` | FrontendStack | task 06 |
| `/afro90s/{env}/api-base-url` | ApiStack | task 10 |
| `/afro90s/{env}/lambda-products-public-name` | ApiStack | task 10 |
| `/afro90s/{env}/lambda-orders-public-name` | ApiStack | task 10 |
| `/afro90s/{env}/lambda-products-admin-name` | ApiStack | task 10 |
| `/afro90s/{env}/lambda-orders-admin-name` | ApiStack | task 10 |
| `/afro90s/{env}/lambda-artifacts-bucket` | ApiStack | task 10 |
| `/afro90s/{env}/whatsapp-number` | ApiStack | task 10 |

Leitura pela Lambda pública: `ssm:GetParameter` em `/afro90s/{env}/*` (task 08).

## Convenções

- URLs sem barra final
- Região padrão: `us-east-1`
- CloudFormation `exportName`: `afro90s-{env}-{OutputId}` (helper `cfnExportName` em `stack-props.ts`)
- Secrets sensíveis apenas via SSM/Secrets Manager, referenciados no CDK

## Referências

- [CDK](cdk.md)
- [Recursos](resources.md)
- [Frontend integration](../frontend/integration.md)
