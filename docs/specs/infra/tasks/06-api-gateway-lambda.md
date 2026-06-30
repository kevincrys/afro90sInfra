# Task 06 — API Gateway + Lambda

**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md) — API GW, Lambda; [`cdk.md`](../cdk.md) — `ApiStack`

## Objetivo

Fechar HTTP API, funções Lambda, CORS, authorizer Cognito e mapeamento das 11 rotas.

## Decisões a tomar

- [ ] HTTP API vs REST API — confirmar HTTP API
- [ ] Stage name: `dev` / `prod` ou `dev` / `production`?
- [ ] 4 Lambdas separadas vs 1 Lambda com router interno
- [ ] Cognito authorizer no API Gateway vs validação JWT na Lambda
- [ ] CORS: origem = `CloudFrontWebUrl` por ambiente; métodos e headers permitidos
- [ ] `multipart/form-data` e binary: config `contentHandling` / payload format 2.0
- [ ] Timeout e memory por function (default 29s / 256MB?)
- [ ] Mapeamento 1:1 com [api-routes.md](../../backend/api-routes.md)

## Checklist de refinamento

- [ ] Tabela Lambda → rotas → permissões IAM (cross-link task 10)
- [ ] Integração Lambda proxy para todas as rotas
- [ ] Rotas `/admin/*` com authorizer JWT
- [ ] Log group por Lambda com retenção (ver task 14)
- [ ] Bundling esbuild — código fonte no repo `afro90s-api` ou monorepo futuro?

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `resources.md` e `cdk.md`
- [ ] Marcar **Status** como `concluída`
