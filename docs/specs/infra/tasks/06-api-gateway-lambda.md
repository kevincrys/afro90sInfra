# Task 06 — API Gateway + Lambda

**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md), [`cdk.md`](../cdk.md)

## Objetivo

Implementar `ApiStack`: HTTP API Gateway com stages, 1 Lambda com router interno, authorizer Cognito JWT para rotas `/admin/*`, e CORS configurado.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Tipo API | HTTP API (não REST API) |
| Stages | `dev` e `prod` |
| Lambdas | 1 função com router interno |
| Authorizer | Cognito JWT no API Gateway (rotas `/admin/*`) |
| CORS origem | `CloudFrontWebUrl` por ambiente |
| Timeout | 29s |
| Memory | 256 MB |
| Bundling | esbuild |
| Payload | format 2.0 |
| Throttling | Configurar limite para evitar custo acidental |

## O que implementar

### HTTP API

- [ ] Criar `HttpApi` com nome `afro90s-{env}-apigw-api`
- [ ] Stage automático com nome igual ao env (`dev` ou `prod`)
- [ ] CORS:
  ```typescript
  corsPreflight: {
    allowOrigins: [config.cloudFrontWebUrl],
    allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST, CorsHttpMethod.PUT, CorsHttpMethod.DELETE, CorsHttpMethod.OPTIONS],
    allowHeaders: ['Content-Type', 'Authorization'],
  }
  ```
- [ ] Throttling default: `throttlingBurstLimit: 50`, `throttlingRateLimit: 100`

### Authorizer Cognito JWT

- [ ] Criar `HttpJwtAuthorizer` apontando para o User Pool criado na task 08
  - `jwtAudience`: App Client ID (importado via SSM)
  - `jwtIssuer`: `https://cognito-idp.us-east-1.amazonaws.com/{userPoolId}`
- [ ] Aplicar authorizer em todas as rotas `/admin/*`

### Lambda — função única com router

- [ ] Criar função `afro90s-{env}-lambda-api` com:
  - `runtime: Runtime.NODEJS_20_X`
  - `memorySize: 256`
  - `timeout: Duration.seconds(29)`
  - `bundling: { minify: true, externalModules: [] }` via `NodejsFunction`
  - `logGroup` com retenção 14 dias (task 14)
- [ ] Handler entry: aponta para `handler.ts` no repo `afro90s-api` (ou monorepo)
- [ ] Variáveis de ambiente injetadas via CDK (task 11)

### Integração de rotas

Mapear todas as rotas de [`api-routes.md`](../../backend/api-routes.md):

- [ ] `GET /products` → Lambda (sem auth)
- [ ] `GET /products/{id}` → Lambda (sem auth)
- [ ] `POST /orders` → Lambda (sem auth)
- [ ] `GET /admin/products` → Lambda + authorizer
- [ ] `POST /admin/products` → Lambda + authorizer
- [ ] `PUT /admin/products/{id}` → Lambda + authorizer
- [ ] `DELETE /admin/products/{id}` → Lambda + authorizer
- [ ] `PUT /admin/products/{id}/stock` → Lambda + authorizer
- [ ] `GET /admin/orders` → Lambda + authorizer
- [ ] `PUT /admin/orders/{id}` → Lambda + authorizer
- [ ] `GET /admin/orders/{id}` → Lambda + authorizer

### Outputs

- [ ] `CfnOutput` `ApiBaseUrl` = URL base do HTTP API **sem** stage e **sem** barra final
- [ ] SSM: `/afro90s/{env}/api-base-url`

## Pré-requisitos

- Tasks 07 (DynamoDB), 08 (Cognito), 05 (Storage) concluídas
- Task 10 (IAM) concluída (roles Lambda)
- Task 12 (SSM) concluída (parâmetros de ambiente)

## Critérios de conclusão

- [ ] `GET /products` retorna `200` (mesmo com lista vazia)
- [ ] `POST /admin/products` sem token retorna `401`
- [ ] `POST /admin/products` com token Cognito válido retorna `200`/`201`
- [ ] CORS headers presentes em respostas para origem CloudFront
- [ ] Output `ApiBaseUrl` no CloudFormation
- [ ] `resources.md` e `cdk.md` atualizados
- [ ] Atualizar **Status** para `concluída`
