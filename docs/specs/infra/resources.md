# Spec: Recursos AWS

**Status:** Aprovado  
**Última atualização:** 2025-06-23

## Objetivo

Catalogar recursos AWS provisionados pelo CDK para o Afro90s.

## Convenção de naming

Padrão: `afro90s-{env}-{tipo}-{nome}` — use `dev` / `prod` (não `production`).

| Tipo | Abreviação |
|------|------------|
| S3 bucket | `s3` |
| CloudFront | `cf` |
| DynamoDB | `ddb` |
| Lambda | `lambda` |
| API Gateway | `apigw` |
| Cognito | `cognito` |
| IAM Role | `role` |
| Stack CDK | `stack` |
| SSM Parameter | path `/afro90s/{env}/...` |

Helper CDK: `resourceName(config, tipo, nome)` em `infra/lib/constructs/naming.ts`.

### Nomes físicos (dev / prod)

| Recurso | Nome dev | Nome prod |
|---------|----------|-----------|
| Stack database | `afro90s-dev-stack-database` | `afro90s-prod-stack-database` |
| Stack auth | `afro90s-dev-stack-auth` | `afro90s-prod-stack-auth` |
| Stack storage | `afro90s-dev-stack-storage` | `afro90s-prod-stack-storage` |
| Stack api | `afro90s-dev-stack-api` | `afro90s-prod-stack-api` |
| Stack frontend | `afro90s-dev-stack-frontend` | `afro90s-prod-stack-frontend` |
| S3 web | `afro90s-dev-s3-web` | `afro90s-prod-s3-web` |
| S3 assets | `afro90s-dev-s3-assets` | `afro90s-prod-s3-assets` |
| S3 lambda artifacts | `afro90s-dev-s3-lambda-artifacts` | `afro90s-prod-s3-lambda-artifacts` |
| DynamoDB products | `afro90s-dev-ddb-products` | `afro90s-prod-ddb-products` |
| DynamoDB orders | `afro90s-dev-ddb-orders` | `afro90s-prod-ddb-orders` |
| Cognito | `afro90s-dev-cognito-admins` | `afro90s-prod-cognito-admins` |
| Lambda API | `afro90s-dev-lambda-api` | `afro90s-prod-lambda-api` |
| API Gateway | `afro90s-dev-apigw-api` | `afro90s-prod-apigw-api` |
| IAM Lambda pública | `afro90s-dev-role-lambda-public` | `afro90s-prod-role-lambda-public` |
| IAM Lambda admin | `afro90s-dev-role-lambda-admin` | `afro90s-prod-role-lambda-admin` |

Tags obrigatórias em todo recurso (via `TaggingAspect` em `bin/app.ts`): `project=afro90s`, `env`, `managed-by=afro90sInfra`.

## Resumo por serviço

| Serviço | Nome (padrão) | Propósito |
|---------|---------------|-----------|
| S3 | `afro90s-{env}-s3-web` | Build estático da SPA |
| S3 | `afro90s-{env}-s3-assets` | Imagens de produtos |
| S3 | `afro90s-{env}-s3-lambda-artifacts` | Pacotes zip da Lambda (deploy via afro90sBackend) |
| CloudFront | `afro90s-{env}-cf-web` | CDN do frontend |
| CloudFront | `afro90s-{env}-cf-assets` | CDN das imagens (opcional: mesmo distribution com behavior `/assets/*`) |
| API Gateway | `afro90s-{env}-apigw-api` | HTTP API REST |
| Lambda | `afro90s-{env}-lambda-*` | Handlers por domínio |
| DynamoDB | `afro90s-{env}-ddb-products` | Catálogo |
| DynamoDB | `afro90s-{env}-ddb-orders` | Pedidos |
| Cognito | `afro90s-{env}-cognito-admins` | User Pool admins |
| SES | identidade de domínio/e-mail | Notificação de pedidos |
| IAM | roles por Lambda | Least privilege |

## S3 — Frontend (`s3-web`)

- Bucket **privado** (`BlockPublicAccess.BLOCK_ALL`); acesso apenas via CloudFront OAC
- Nome: `afro90s-{env}-s3-web`
- Dev: `versioned: false`, `autoDeleteObjects: true`, `removalPolicy: DESTROY`
- Prod: `versioned: false`, `removalPolicy: RETAIN` — rollback via redeploy + invalidação CloudFront, não via versões S3
- Lifecycle: abort multipart incompleto (7d) — **nunca** expira objetos ativos do site
- Deploy do build Vite via CI (`aws s3 sync dist/`) — ver task frontend CI
- `index.html`: `Cache-Control: no-cache` no deploy; `assets/*`: `max-age=31536000`

## CloudFront — SPA (`cf-web`)

- Origin: bucket web via `S3BucketOrigin.withOriginAccessControl()`
- `priceClass: PRICE_CLASS_200` (inclui Brasil)
- `defaultRootObject: index.html`; viewer `REDIRECT_TO_HTTPS`
- Custom errors: `403 → /index.html` (200) para SPA routing; **404 não** é reescrito para `index.html`
- Behaviors: default + `index.html` → `CACHING_DISABLED`; `assets/*` → `CACHING_OPTIMIZED`
- Security headers: HSTS + `X-Content-Type-Options`
- Alias customizado: `config.domainName` quando definido (requer certificado ACM — fase futura)
- Output / SSM: `CloudFrontWebUrl` (`https://{domain}` sem barra final)

## S3 — Lambda artifacts (`s3-lambda-artifacts`)

- Bucket **privado** para pacotes zip publicados pelo pipeline **afro90sBackend**
- Chaves: `api/{git-sha}.zip`, `api/latest.zip`
- Versioning habilitado para rollback
- Lambda lê o pacote via `update-function-code` (S3 → Lambda)
- Deploy de **código** = backend; deploy de **config** (env, timeout) = CDK

## S3 — Assets (`s3-assets`)

- Imagens de produtos enviadas pelo admin (`POST /admin/products`)
- Estrutura de chave: `products/{productId}/{uuid}.{ext}`
- Lambda admin com permissão `s3:PutObject`, `s3:DeleteObject`
- URLs públicas via CloudFront ou base URL configurada em output `ASSETS_CDN_URL`

## CloudFront

- Origin SPA: bucket web (`cf-web`) — ver seção acima
- Behavior `/assets/*` para imagens de produtos: [task 07](tasks/07-assets-storage.md)
- CORS headers se necessário para assets

## API Gateway (HTTP API)

- Stage por ambiente: `dev`, `prod`
- CORS: `Access-Control-Allow-Origin` = domínio CloudFront frontend
- Authorizer Cognito JWT nas rotas `/admin/*`
- Mapeamento de rotas: ver [api-routes.md](../backend/api-routes.md)
- Limite de payload: **10 MB** (relevante para upload base64 de imagens)

## Lambda

| Function | Rotas | Permissões |
|----------|-------|------------|
| `lambda-products-public` | `GET /products`, `GET /products/{id}` | DynamoDB products read |
| `lambda-orders-public` | `POST /orders` | DynamoDB orders write, products read, SES send |
| `lambda-products-admin` | `/admin/products*` | DynamoDB products CRUD, S3 assets write |
| `lambda-orders-admin` | `/admin/orders*` | DynamoDB orders read/update |

Runtime: **Node.js 20.x**. Bundling: **esbuild no afro90sBackend**; CDK cria função com placeholder ([ADR-007](../../foundation/adr/007-backend-lambda-s3-deploy.md)).

## DynamoDB

Billing: **on-demand** (`PAY_PER_REQUEST`) — alinhado ao [ADR-004](../../foundation/adr/004-serverless-architecture.md). Tráfego v1 baixo; dev + prod na mesma conta sem capacidade provisionada 24/7. Free tier: **25 GB storage** (conta/região); requisições cobradas por uso.

`removalPolicy`: `DESTROY` (dev) / `RETAIN` (prod). `deletionProtection: true` em prod. PITR: **somente** tabela `orders` em prod. **TTL** em `orders`: atributo `expiresAt` (epoch segundos); pedidos em `CONCLUIDO` ou `CANCELADO` expiram **180 dias** após a transição (backend).

### Tabela `products`

| Atributo | Tipo | Notas |
|----------|------|-------|
| PK `id` | String (UUID) | Partition key |
| `name` | String | |
| `nameLower` | String | lowercase + remoção de acentos (aplicação) |
| `price` | Number | |
| `quantity` | Number | |
| `photos` | List\<String\> | URLs finais |
| `category` | String | enum |
| `createdAt` | String | ISO 8601 |
| `updatedAt` | String | ISO 8601 |

**GSI `gsi-name`**: PK `nameLower`, SK `id` — busca por prefixo de nome (v1).

**GSI `gsi-createdAt`**: PK `createdAt` — listagem pública por data de criação.

### Tabela `orders`

| Atributo | Tipo | Notas |
|----------|------|-------|
| PK `id` | String (UUID) | |
| `status` | String | enum OrderStatus |
| `items` | List | `{ productId, quantity, unitPrice }` |
| `fullPrice` | Number | |
| `customer` | Map | `{ name, address, postalCode, tel }` |
| `createdAt` | String | |
| `updatedAt` | String | |
| `expiresAt` | Number | Epoch segundos (TTL); definido ao atingir `CONCLUIDO` ou `CANCELADO` (+180 dias) |

**GSI `gsi-status-createdAt`**: PK `status`, SK `createdAt` — listagem admin filtrada por status.

**TTL**: DynamoDB remove itens quando `expiresAt` ≤ agora (até ~48h de atraso). Itens sem `expiresAt` permanecem indefinidamente.

## Cognito

- User Pool: admins apenas
- `selfSignUpEnabled: false`
- App client sem secret (SPA admin)
- Grupos: `admins` (v1 único grupo)

## SES

- Identidade verificada (domínio ou e-mail)
- Template `new-order-notification` com variáveis: `orderId`, `customerName`, `fullPrice`, `itemsSummary`
- Destinatário: e-mail do admin (SSM Parameter)

## IAM

- Uma execution role por Lambda
- Sem credenciais estáticas em código
- API Gateway → Lambda via resource-based policy automática do CDK

## Referências

- [ADR-004](../../foundation/adr/004-serverless-architecture.md)
- [CDK](cdk.md)
- [API routes](../backend/api-routes.md)
