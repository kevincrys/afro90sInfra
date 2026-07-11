# Task 12 — Aceite Fase 1 (Site público)

**Fase:** 1 — Site público  
**Status:** concluída  
**Arquivos alvo:** [`overview.md`](../overview.md)

## Objetivo

Validar que o site público está no ar com catálogo de produtos, imagens e formulário de pedido funcionando — sem login, sem admin, sem e-mail.

## O que implementar

### Script `smoke-test-fase1.sh`

- [x] `infra/scripts/smoke-test-fase1.sh` — API (stage `/{env}/…`) + CloudFront
- [x] Step final em `cdk-deploy-dev.yml`
- [x] Rotas SPA alinhadas ao frontend: `/` e `/products/{id}` (não `/catalogo`)
- [x] API: UUID inválido → `400`; UUID inexistente → `404`; `?name=cat` → `200`
- [x] `POST /orders` vazio → `400`; com produto no catálogo → `201` ou `409`
- [x] Placeholder Lambda (`503`) → SKIP na API até deploy do backend

### Backend

- [x] `scripts/smoke-test-api-fase1.sh` — subset API
- [x] Step pós-deploy em `deploy-reusable.yml` (`smoke-test` job)

## Checklist de aceite manual

- [x] `cdk deploy --all -c env=dev` sem erros
- [x] Todas as stacks da fase 1 com status `CREATE_COMPLETE` / `UPDATE_COMPLETE`
- [x] Smoke fase 1 passa (API + CloudFront)
- [x] Após deploy backend: smoke API verde
- [x] CloudFront URL abre o frontend no browser
- [x] Rotas SPA (`/`, `/products/{uuid}`) servem `index.html`
- [x] `GET /products` retorna JSON com `items`
- [x] `GET /products?name=…` retorna `200` (não `500`)
- [x] `POST /orders` com body válido retorna `201` (sem e-mail)
- [x] Pipeline CI: PR → validate/diff; merge → deploy automático

## Pré-requisitos

- [Task 11](11-outputs.md) concluída

## Critérios de conclusão

- [x] Scripts de smoke test e CI configurados
- [x] Checklist manual marcado (BDD / aceite runtime)
- [x] `overview.md` atualizado com status da fase 1
- [x] **Status** concluída
