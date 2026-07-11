# Task 20 — Aceite Fase 4 (Email + aceite final)

**Fase:** 4 — Email  
**Status:** parcial — regressão fases 1–3 OK (BDD); **SES / observabilidade dashboard** pendentes  
**Arquivos alvo:** [`overview.md`](../overview.md), [`tasks/README.md`](README.md)

## Objetivo

Validar o envio de e-mail no fluxo de pedido e declarar a infraestrutura v1 completa.

## Script de smoke test completo

- [ ] Criar/executar `infra/scripts/smoke-test-completo.sh` (inclui SES) — **pendente com task 18**

## Testes manuais BDD (produção)

Checklist Gherkin: [plano-bdd-testes-manuais-prod.md](../plano-bdd-testes-manuais-prod.md)

- [x] Cenários P0 (exceto SES) executados
- [ ] Cenários SES / e-mail — **pendente**

## Checklist de aceite final

### Fase 4 — SES

- [ ] Template `afro90s-{env}-ses-new-order` visível no console SES
- [ ] `POST /orders` → `201` + e-mail recebido no endereço admin verificado
- [ ] E-mail contém `orderId` e `customerName` corretos
- [ ] Variável `SES_ENABLED=true` na Lambda

### Infraestrutura completa

- [x] Stacks principais com status `CREATE_COMPLETE` / `UPDATE_COMPLETE`
- [ ] Dashboard CloudWatch (task 19) — se ainda não deployado
- [ ] Log groups com retenção 14 dias (task 19)
- [ ] Script `smoke-test-completo.sh` com SES
- [x] Pipeline CI: validate/diff em PRs + deploy automático
- [x] Outputs / SSM disponíveis para frontend e backend

### Regressão completa

- [x] Fase 1: site público + rotas públicas + POST /orders
- [x] Fase 2: login Cognito funcional
- [x] Fase 3: CRUD products + orders admin via token
- [ ] Fase 4: e-mail enviado no POST /orders

## Pré-requisitos

- [Task 18](18-ses.md) e [Task 19](19-observabilidade.md) para fechar SES + dashboard

## Critérios de conclusão

- [ ] Script smoke completo com SES passa
- [ ] Todos os itens do checklist marcados
- [ ] Atualizar **Status** para `concluída` — **infraestrutura v1 completa**
