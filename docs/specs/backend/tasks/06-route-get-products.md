# Task 06 — Rota `GET /products`

**Status:** pendente  
**Arquivos alvo:** `[api-routes.md](../api-routes.md)` — seção `GET /products`

## Objetivo

Refinar listagem pública de produtos: filtros, ordenação, visibilidade e estratégia de leitura no DynamoDB.

## Decisões a tomar

- Sem query `name`: Scan tabela vs Query em GSI de listagem (ver task 15)
- query
- Ordenação default: `name` asc, `createdAt` desc ou indefinida na v1?
- `name` asc, `createdAt`
- Filtro `category`: combinar com `name` e com `cursor`?
- sim
- Produtos com `quantity = 0`: incluir na listagem pública?
- sim, frontend faz a separação
- Busca `name`: prefixo, contém substring, ou normalização sem acento?
- nomalizado sem acento
- Retornar apenas campos públicos ou `Product` completo (hoje: completo)
- publico

## Checklist de refinamento

- Query params finais documentados com exemplos HTTP
- Response example alinhado ao modelo `Product` (task 01)
- Tabela de erros: `INVALID_QUERY`, `INVALID_CURSOR`
- Nota de performance: Scan aceitável só em catálogo pequeno na v1?

## Notas / rascunho

## Quando concluir

- Atualizar seção `GET /products` em `api-routes.md`
- Marcar **Status** como `concluída`

