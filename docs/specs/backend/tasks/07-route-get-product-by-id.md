# Task 07 — Rota `GET /products/{id}`

**Status:** pendente  
**Arquivos alvo:** `[api-routes.md](../api-routes.md)` — seção `GET /products/{id}`

## Objetivo

Refinar detalhe público de um produto por UUID.

## Decisões a tomar

- Produto esgotado (`quantity = 0`): retorna `200` com `quantity: 0` ou `404`? 200 quantity 0
- Produto removido logicamente (soft delete) na v1? Se não houver soft delete, apenas DELETE admin   
so admin pode deletar mesmo, delete real
- Validar formato UUID no path antes de ir ao DynamoDB?
- no backend pode sim validar, mas já no service
- Cache headers na resposta (`Cache-Control`) — CDN/browser na v1?
- sim

## Checklist de refinamento

- Response `200` com exemplo realista
- `404 NOT_FOUND` — mensagem padronizada
- Comportamento se `id` malformado: `400` ou `404`?

## Notas / rascunho



## Quando concluir

- Atualizar seção `GET /products/{id}` em `api-routes.md`
- Marcar **Status** como `concluída`

