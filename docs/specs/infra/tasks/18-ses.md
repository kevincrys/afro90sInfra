# Task 18 — SES (notificação de pedidos por e-mail)

**Fase:** 4 — Email  
**Status:** concluída  
**Arquivos alvo:** [`resources.md`](../resources.md), [`outputs.md`](../outputs.md), `lib/config/load-ses-config.ts`, `lib/stacks/api-stack.ts`, `lib/constructs/lambda-orders-public-role.ts`

## Objetivo

Configurar identidade SES, template de e-mail e conectar o envio ao `POST /orders`. Destinatário: **admin** (v1). E-mails **não** ficam no repositório — só GitHub secrets / env local.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Destino | Admin (`ADMIN_NOTIFICATION_EMAIL`) — não o cliente |
| Dev | Sandbox SES — e-mails verificados individualmente |
| Prod | Domínio `afroo90s.com.br` (identidade verificada no console) |
| Template | SES template gerenciado `afro90s-{env}-ses-new-order` |
| Variáveis do template | `{{orderId}}`, `{{customerName}}`, `{{itemsSummary}}`, `{{fullPrice}}` |
| Parâmetros | `ses-from-email` e `admin-notification-email` via SSM (valores no deploy) |
| IAM | `ses:SendTemplatedEmail` na identidade + template (não `*`) |
| Segredos | GitHub Environment secrets — **nunca** commitados |

## Secrets (fora do git)

| Origem | Valor |
|--------|--------|
| Código (`SES_FROM_EMAIL`) | `noreply@afroo90s.com.br` (público, versionado) |
| GitHub secret `ADMIN_NOTIFICATION_EMAIL` | → env `AFRO90S_ADMIN_NOTIFICATION_EMAIL` (só admin) |

Sem `ADMIN_NOTIFICATION_EMAIL` no deploy → `SES_ENABLED=false`.

## O que implementar

### SES — identidade (setup manual)

- [x] Documentar: verificar remetente e destino no console SES (`us-east-1`) antes do primeiro envio (sandbox)
- [ ] Em prod: opcional `CfnEmailIdentity` de domínio (follow-up; sandbox/e-mail verificado basta na v1)

### SES — template CDK + SSM + IAM + Lambda

- [x] `CfnTemplate` `afro90s-{env}-ses-new-order` quando `config.ses` presente
- [x] SSM `/afro90s/{env}/ses-from-email` e `admin-notification-email`
- [x] IAM `ses:SendTemplatedEmail` na role `orders-public`
- [x] Env Lambda orders-public: `SES_ENABLED=true`, `SES_FROM_EMAIL`, `ADMIN_EMAIL`, `SES_TEMPLATE_NAME`
- [x] Outputs `SesFromEmail` / `AdminNotificationEmail`
- [x] Loader `load-ses-config.ts` + workflows injetam secrets
- [x] Testes unitários (fixture fake)

## Pré-requisitos

- [Task 17](17-aceite-fase3.md) concluída
- E-mails verificados no SES sandbox + secrets no GitHub

## Critérios de conclusão

- [x] Template criado pelo CDK quando SES configurado
- [x] `ses:SendTemplatedEmail` restrito à identidade + template
- [x] E-mails não versionados no repo
- [x] `resources.md` / `outputs.md` / workflows atualizados
- [x] Atualizar **Status** para `concluída`

## Operador (pós-merge)

1. SES console → verificar `noreply@afroo90s.com.br` (ou domínio) e o e-mail admin
2. GitHub → Environments `dev`/`prod` → secret `ADMIN_NOTIFICATION_EMAIL`
3. Deploy infra → redeploy backend (task 16)
4. `POST /orders` → e-mail no admin
