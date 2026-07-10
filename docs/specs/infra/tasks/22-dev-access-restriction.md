# Task 22 — Restrição de acesso ao ambiente dev (free tier)

**Fase:** 6 — Segurança dev  
**Status:** concluída (código + testes; aceite manual pós-deploy com IP real)  
**Arquivos alvo:** [`cdk.md`](../cdk.md), [`resources.md`](../resources.md), `infra/lib/config/`, `infra/lib/constructs/dev-access-gate-function.ts`, `infra/lib/stacks/api-stack.ts`, `infra/lib/stacks/frontend-stack.ts`

## Objetivo

Restringir o ambiente **dev** a um único operador sem usar AWS WAF (pago). Combina duas camadas gratuitas:

1. **API Gateway resource policy** — allowlist de IP (`aws:SourceIp`) em todas as rotas do HTTP API dev
2. **CloudFront Function** — Basic Auth no viewer-request da SPA dev (comportamentos `default` e `index.html`)

**Prod permanece público** — sem `devAccess`, sem policy de IP, sem gate no CloudFront.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Escopo | Somente `env === 'dev'` |
| WAF | Não usar (fora do free tier) |
| API policy | `Allow` + `Condition.IpAddress.aws:SourceIp` |
| CloudFront gate | Basic Auth via `Authorization` header (popup nativo do browser) |
| Assets `/assets/products/*` | **Sem** gate (imagens continuam acessíveis via URL direta) |
| Cognito dev | Self sign-up desativado; manter **um** usuário no grupo `admins` |
| Smoke CI em dev | Esperado falhar IP após policy; job usa `continue-on-error` |

### Interface `AppConfig.devAccess` (somente dev)

```typescript
devAccess?: {
  allowedApiSourceIps: string[];      // ex.: ['203.0.113.10/32']
  cloudFrontBasicAuth: {
    username: string;
    password: string;                 // dev-only; rotacionar se vazar
  };
}
```

Preencher **fora do Git** — nunca em `dev.ts` nem no repositório público:

| Onde | Quando |
|------|--------|
| **GitHub Environment `dev` → Secrets** | Deploy via CI (`cdk-deploy-dev.yml`) — **obrigatório** |
| **`dev.access.local.json`** (gitignored) | Deploy manual local (`npm run deploy:dev`) |

### GitHub Secrets (ambiente `dev`)

Configurar em **Settings → Environments → dev → Environment secrets**:

| Secret | Exemplo | Descrição |
|--------|---------|-----------|
| `DEV_ACCESS_ALLOWED_IPS` | `["177.192.0.0/16","2804:14d:5c64::/48"]` | JSON array de CIDRs IPv4/IPv6 |
| `DEV_ACCESS_BASIC_AUTH_USERNAME` | `dev` | Usuário do popup Basic Auth |
| `DEV_ACCESS_BASIC_AUTH_PASSWORD` | *(senha forte)* | Senha do popup Basic Auth |

O workflow injeta esses secrets como variáveis de ambiente no `cdk deploy` (não aparecem no código versionado).

### Arquivo local (deploy manual)

```bash
cd infra/lib/config
cp dev.access.local.example.json dev.access.local.json
```

Edite `dev.access.local.json` com **suas** faixas (descubra em [ipinfo.io](https://ipinfo.io) após `curl ifconfig.me`):

```json
{
  "allowedApiSourceIps": [
    "203.0.113.0/24",
    "2001:db8:1234:5678::/48"
  ],
  "cloudFrontBasicAuth": {
    "username": "dev",
    "password": "sua-senha-forte-aqui"
  }
}
```

| Campo | Significado |
|-------|-------------|
| `allowedApiSourceIps` | Lista de CIDRs IPv4 e/ou IPv6 do **seu provedor** (ex.: `/16`, `/48`) — não use `/32` de IP único se quiser evitar redeploy |
| `cloudFrontBasicAuth` | Usuário/senha do popup Basic Auth no CloudFront dev |

O arquivo `dev.access.local.json` está no `.gitignore`. O exemplo versionado usa IPs de documentação ([RFC 5737](https://datatracker.ietf.org/doc/html/rfc5737)), não dados reais.

`dev.ts` carrega config via `load-dev-access.ts` — **CI:** secrets do GitHub; **local:** `dev.access.local.json`. Se nenhuma fonte existir, dev fica **sem** restrição.

## O que implementar

### Config

- [x] `lib/config/types.ts` — interface `DevAccessConfig` + campo opcional `devAccess?` em `AppConfig`
- [x] `lib/config/dev.ts` — carrega `dev.access.local.json` se existir
- [x] `lib/config/dev.access.local.example.json` — template versionado (IPs de documentação)
- [x] `lib/config/dev.access.local.json` — **gitignored**; criar localmente
- [x] `lib/config/prod.ts` — sem alteração

### Construct `dev-access-gate-function`

- [x] `lib/constructs/dev-access-gate-function.ts`
- [x] Nome: `afro90s-dev-cf-dev-access-gate`
- [x] Evento: `viewer-request`
- [x] Valida `Authorization: Basic <base64(user:pass)>`
- [x] Inválido → resposta `401` + `WWW-Authenticate: Basic realm="Afro90s Dev"`

### ApiStack — resource policy

- [x] Se `config.devAccess?.allowedApiSourceIps?.length > 0`:
  - Policy no `AWS::ApiGatewayV2::Api` via `addPropertyOverride` (typings CDK ainda sem `Policy`)
  - ARN `arn:aws:execute-api:{region}:{account}:*/*` (evita ciclo Ref-to-self no mesmo recurso)
  - `Condition.IpAddress.aws:SourceIp` = lista de CIDRs
- [x] Prod: policy ausente

### FrontendStack — associar function

- [x] Instanciar gate quando `devAccess` presente
- [x] `functionAssociations` em `defaultBehavior` e behavior `index.html`
- [x] **Não** associar em `assets/products/*/*` nem `assets/*`

### Testes

- [x] `api-stack.test.ts` — dev com `devAccess` → `Policy` no API; prod sem policy
- [x] `frontend-stack.test.ts` — dev com gate → 2 CloudFront Functions (strip + gate); prod com 1 function (strip only)

### Documentação

- [x] Atualizar `cdk.md`, `resources.md`, `tasks/README.md`
- [x] Referências cruzadas em tasks 01, 06, 10, 13
- [x] `frontend/integration.md` — fluxo local alternativo

## Runbook operacional

### 1. Descobrir faixa do provedor (local, não commitar)

```bash
curl ifconfig.me
# Abra https://ipinfo.io/<seu-ip> e copie o campo "Range" (ex.: x.x.0.0/16 ou xxxx::/48)
```

### 2. Configurar secrets no GitHub (CI)

**Settings → Environments → dev → Environment secrets** — ver tabela acima.

Para deploy local sem CI, use o arquivo abaixo.

### 3. Arquivo local (deploy manual, opcional)

```bash
cd infra/lib/config
cp dev.access.local.example.json dev.access.local.json
# Edite allowedApiSourceIps e password — NÃO commite dev.access.local.json
```

### 4. Deploy

```bash
cd infra
npm run build
npm run diff:dev    # revisar Policy + Function
npm run deploy:dev  # ou push na branch dev (pipeline)
```

### 5. Validar

| Teste | Como | Esperado |
|-------|------|----------|
| SPA dev sem credencial | Abrir URL CloudFront dev | `401` + popup Basic Auth |
| SPA dev com credencial | Login no popup | SPA carrega |
| API do seu IP | `curl $API/dev/products` | `200` |
| API de outro IP | VPN ou `curl` de outro host | `403` |
| Prod | URLs prod sem gate | Inalterado |

### 6. IP mudou (residencial / 4G)

1. Consulte o novo range em ipinfo.io
2. Atualize o secret `DEV_ACCESS_ALLOWED_IPS` no GitHub (ou `dev.access.local.json` para deploy local)
3. Redeploy dev — **sem** alterar código versionado

**Alternativa sem redeploy imediato:** rodar frontend local:

```bash
# afro90sFrontend/.env
VITE_API_BASE_URL=https://{api-id}.execute-api.us-east-1.amazonaws.com/dev
npm run dev
```

(API ainda exige seu IP na allowlist; CloudFront gate não se aplica ao `localhost`.)

### 7. Cognito dev

Console → `afro90s-dev-cognito-admins` → manter **apenas** seu e-mail no grupo `admins`.

### 8. Smoke test CI

O job pós-deploy em `afro90sBackend` contra `dev` **falhará** na API (IP do runner GitHub não está na allowlist). Comportamento esperado (`continue-on-error`). Validar dev manualmente após deploy.

## Pré-requisitos

- [Task 21](21-dominio-customizado-prod.md) concluída (ou fase 4 mínima com stacks dev deployadas)

## Critérios de conclusão

- [ ] `devAccess` configurável só em dev
- [ ] API dev bloqueia IPs fora da allowlist (`403`)
- [ ] CloudFront dev exige Basic Auth na SPA
- [ ] Prod sem policy e sem gate
- [ ] `npm run test` passa
- [ ] Runbook validado manualmente
- [ ] Atualizar **Status** para `concluída`

## Referências

- [Plano BDD produção](../plano-bdd-testes-manuais-prod.md) — épico segurança
- [Task 13 — Cognito](13-cognito.md)
- [Task 10 — API pública](10-api-publica.md)
- [Task 06 — Frontend hosting](06-frontend-hosting.md)
