# Task 09 — Rota `GET /admin/products`

**Status:** pendente  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md) — seção `GET /admin/products`

## Objetivo

Refinar listagem admin de produtos e diferenças em relação à rota pública.

## Decisões a tomar

- [ ] Incluir produtos com `quantity = 0`? (recomendado: sim no admin)
- [ ] Mesmos filtros que `GET /products` (`name`, `category`, paginação)?
- [ ] Ordenação: default por `name`, `createdAt` ou `updatedAt`?
- [ ] Campos extras no admin (ex.: estoque baixo) — v1 ou v2?
- [ ] Auth: qualquer usuário Cognito do pool ou só grupo `admins`?

## Checklist de refinamento

- [ ] Documentar diferenças explícitas vs `GET /products` (tabela comparativa curta)
- [ ] Headers: `Authorization: Bearer` obrigatório
- [ ] Erros `401` / `403` alinhados com task 13

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar seção `GET /admin/products` em `api-routes.md`
- [ ] Marcar **Status** como `concluída`
