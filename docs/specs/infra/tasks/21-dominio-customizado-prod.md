# Task 21 — Domínio customizado + CORS (prod)

**Fase:** 5 — Domínio customizado  
**Status:** concluída  
**Arquivos alvo:** [`resources.md`](../resources.md), [`outputs.md`](../outputs.md), [`cdk.md`](../cdk.md), `lib/config/prod.ts`, `lib/stacks/frontend-stack.ts`, `lib/stacks/api-stack.ts`, `lib/stacks/auth-stack.ts`, `lib/constructs/site-certificate.ts`

## Objetivo

Configurar domínio customizado em **prod** (`afroo90s.com.br` + `api.afroo90s.com.br`), corrigir CORS/SSM/Lambda env, e manter **dev** com `*.cloudfront.net` + `execute-api`.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Frontend | `https://afroo90s.com.br` (canônico) |
| `www` | `https://www.afroo90s.com.br` → **301** para o apex |
| API | `https://api.afroo90s.com.br` (stage `prod` via API mapping — sem `/prod` no path) |
| Assets CDN | `https://afroo90s.com.br/assets` |
| CORS origin | `https://afroo90s.com.br` |
| Certificado ACM | `afroo90s.com.br` + `*.afroo90s.com.br` (us-east-1) |
| DNS | Route 53 hosted zone existente (`hostedZoneId` em `prod.ts`) |
| Dev | Sem domínio customizado |

## O que implementar

### Config (`lib/config/`)

- [x] `AppConfig`: `apiSubdomain?`, `hostedZoneId?`
- [x] `prod.ts`: `domainName`, `apiSubdomain`, `hostedZoneId` (preencher ID real da hosted zone antes do deploy)

### Construct `site-certificate.ts`

- [x] `acm.Certificate` com apex + wildcard `*.afroo90s.com.br`
- [x] Validação DNS via Route 53
- [x] SSM `/afro90s/prod/site-certificate-arn` (cópia do ARN; ApiStack usa cross-stack ref de `frontendStack.siteCertificate`)

### FrontendStack

- [x] Certificado ACM no CloudFront
- [x] Route 53 A alias (apex) → CloudFront
- [x] Alias + Route 53 `www` → CloudFront + Function 301 → apex
- [x] SSM `cloudfront-web-url` → `https://afroo90s.com.br`
- [x] SSM `assets-cdn-url` → `https://afroo90s.com.br/assets`

### ApiStack

- [x] `apigwv2.DomainName` + `ApiMapping` (stage `prod`)
- [x] Route 53 A alias `api` → API Gateway domain
- [x] SSM `api-base-url` → `https://api.afroo90s.com.br`
- [x] CORS `allowOrigins`: `https://afroo90s.com.br` (quando `domainName` definido)
- [x] Env `CLOUDFRONT_WEB_URL` nas 4 Lambdas (prod)

### AuthStack

- [x] Cognito App Client: `callbackUrls` e `logoutUrls` com `https://afroo90s.com.br/admin/*`

### Testes

- [x] `frontend-stack.test.ts` — cenário prod com domínio + www redirect
- [x] `api-stack.test.ts` — DomainName, ApiMapping, `CLOUDFRONT_WEB_URL`
- [x] `infra.test.ts` — synth prod

---

## Migração — recursos manuais no console

**Nada é revertido automaticamente pelo CDK.** Alinhar antes do deploy da ApiStack:

| Recurso manual | Ação antes do deploy |
|----------------|----------------------|
| Hosted zone + nameservers Registro.br | **Manter** |
| Alias `afroo90s.com.br` no CloudFront (distribuição CDK) | **Manter** — CDK consolida |
| Certificado ACM (só apex) | **Manter** até deploy OK; apagar depois (opcional) |
| Custom domain `api.afroo90s.com.br` no API Gateway | **Apagar** (aguardar status Available se Updating) |
| Registro Route 53 `api` manual | **Apagar** se existir |

### Remover custom domain manual (API Gateway)

1. API Gateway → Custom domain names → `api.afroo90s.com.br`
2. Aguardar status **Available** (não Updating)
3. API mappings → excluir todos
4. Delete custom domain
5. Route 53 → excluir registro `api` se existir
6. Aguardar 2–5 min

> `https://xxx.execute-api.us-east-1.amazonaws.com/prod` continua funcionando durante a migração.

---

## Ordem de deploy

O deploy é **automático** via GitHub Actions (`cdk-deploy-prod.yml` → `npm run deploy:prod` → `cdk deploy --all -c env=prod`). **Não é necessário** deploy manual stack a stack.

O CDK garante a ordem via dependências em `bin/app.ts`:

```
Storage → Frontend → Api
Database ──────────┘
Auth ──────────────┘
```

- `apiStack.addDependency(frontendStack)` — certificado ACM e SSM (`cloudfront-web-url`) existem antes da ApiStack
- Certificado compartilhado: `frontendStack.siteCertificate` passado como prop para `ApiStack` (cross-stack ref CloudFormation)

### Passos do operador (antes do merge em `main`)

1. Preencher `hostedZoneId` em `lib/config/prod.ts` (substituir `REPLACE_WITH_HOSTED_ZONE_ID`)
2. Remover custom domain / registro `api` manuais no console (se existirem)
3. Merge em `main` — pipeline `cdk-deploy-prod` faz o resto
4. Após infra: redeploy do **frontend** (`afro90sFrontend` workflow `deploy-prod.yml`) para `VITE_API_BASE_URL` e `VITE_ASSETS_CDN_URL` novos
5. Validar CORS e login admin

---

## Critérios de conclusão

- [x] `https://afroo90s.com.br` abre a SPA
- [x] `https://api.afroo90s.com.br/products` retorna `200`
- [x] Preflight `OPTIONS` com `Access-Control-Allow-Origin: https://afroo90s.com.br`
- [x] SSM prod: `cloudfront-web-url`, `api-base-url`, `assets-cdn-url` com domínios customizados
- [x] Login admin em `https://afroo90s.com.br/admin/login` funciona
- [x] Dev inalterado (`*.cloudfront.net`)
- [x] `npm test` em `infra/` passa
- [x] `www.afroo90s.com.br` → 301 para apex (CDK; validar pós-deploy)
- [x] Atualizar **Status** para `concluída`

## Pré-requisitos

- [Task 20](20-aceite-fase4.md) concluída (ou infra v1 estável em prod)
- Domínio `afroo90s.com.br` delegado ao Route 53

## Follow-up (fora de escopo)

- Domínio customizado em `dev` (não planejado na v1)
