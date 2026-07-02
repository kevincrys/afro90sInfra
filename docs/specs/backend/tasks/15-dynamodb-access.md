# Task 15 — Padrões de acesso DynamoDB

**Status:** pendente  
**Arquivos alvo:** `[overview.md](../overview.md)`; `[api-routes.md](../api-routes.md)` — cursores; `[resources.md](../../infra/resources.md)`

## Objetivo

Mapear cada rota de leitura/escrita para tabela, índice e chaves — base para implementação e cursores.

## Decisões a tomar

- Tabela `products` PK `id` — listagem sem filtro: Scan vs GSI adicional (ex.: `gsi-createdAt`)   
gsi adicional
- Atributo `nameLower`: `name.toLowerCase()` sem remover acentos — confirmar regra de busca  
toLowerCase sem acento
- GSI `gsi-name`: busca por prefixo em `nameLower` — confirmar
- Sim
- GSI `gsi-status-createdAt` para pedidos admin — SK `createdAt` ISO string (ordenável)  
Sim
- `GetItem` por id em produtos/pedidos — rotas GET `/{id}`
- `SIm`
- `UpdateItem` condicional para stock e status
- total, somente para stock que é só do quantity

## Checklist de refinamento

- Tabela rota → operação DynamoDB (Query/Scan/Get/Put/Update/Delete)
- Alinhar payloads de cursor (task 04) com chaves reais de cada índice
- Documentar em `overview.md` seção "Access patterns" ou manter só nesta task + link
- Revisar consistência com `resources.md` (nomes de GSI)

## Notas / rascunho




| Rota                        | Operação                     | Tabela / Índice               |
| --------------------------- | ---------------------------- | ----------------------------- |
| `GET /products` (sem name)  | ?                            | products / ?                  |
| `GET /products?name=`       | Query                        | products / gsi-name           |
| `GET /products/{id}`        | GetItem                      | products                      |
| `POST /orders`              | PutItem + GetItem (produtos) | orders + products             |
| `GET /admin/orders?status=` | Query                        | orders / gsi-status-createdAt |


## Quando concluir

- Atualizar `overview.md` com access patterns
- Ajustar exemplos de cursor em `api-routes.md` se chaves mudarem
- Marcar **Status** como `concluída`

