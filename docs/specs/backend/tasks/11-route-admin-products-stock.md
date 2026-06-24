# Task 11 — Rota `PATCH /admin/products/{id}/stock`

**Status:** pendente  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md) — seção `PATCH /admin/products/{id}/stock`

## Objetivo

Refinar ajuste de estoque por delta e regras de conflito.

## Decisões a tomar

- [ ] Manter apenas `delta` (relativo) ou suportar também `quantity` absoluto? (hoje: só `delta`)
- [ ] `delta` positivo: limite máximo de estoque?
- [ ] `delta = 0`: `400 VALIDATION_ERROR`?
- [ ] Operação atômica no DynamoDB (`UpdateItem` com condition `quantity >= -delta`)?
- [ ] Log de auditoria de movimentação de estoque — v2?

## Checklist de refinamento

- [ ] Request `{ "delta": -2 }` documentado com exemplos positivo/negativo
- [ ] Response `{ "id", "quantity" }` após update
- [ ] `409 INSUFFICIENT_STOCK` quando resultado < 0
- [ ] Alinhar com regra: checkout não decrementa; só esta rota (e futuro v2)

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar seção stock em `api-routes.md`
- [ ] Marcar **Status** como `concluída`
