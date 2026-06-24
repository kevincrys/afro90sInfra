# Tasks — Refinamento das specs de backend

Backlog de tarefas pequenas para refinar [`api-routes.md`](../api-routes.md), [`data-models.md`](../data-models.md) e [`overview.md`](../overview.md).

O contrato HTTP permanece em **um único arquivo** (`api-routes.md`). Cada task concluída deve resultar em edições pontuais nos specs alvo — não reestruturar `api-routes.md`.

## Legenda de status

| Status | Significado |
|--------|-------------|
| `pendente` | Ainda não revisada |
| `em revisão` | Decisões em andamento |
| `concluída` | Specs alvo atualizadas |

Atualize o campo **Status** no topo de cada arquivo de task.

## Índice

### Fundação (começar aqui)

| Task | Arquivo | Foco |
|------|---------|------|
| 00 | [00-conventions.md](00-conventions.md) | Base URL, stages, CORS, headers |
| 04 | [04-pagination-cursor.md](04-pagination-cursor.md) | Cursor opaco, Base64URL, schema interno |
| 05 | [05-errors-and-http.md](05-errors-and-http.md) | Códigos HTTP, `ApiError`, `details` |

### Modelos de dados

| Task | Arquivo | Foco |
|------|---------|------|
| 01 | [01-product-model.md](01-product-model.md) | Product, price, validação |
| 02 | [02-order-model.md](02-order-model.md) | Order, Customer, fullPrice |
| 03 | [03-photo-upload.md](03-photo-upload.md) | PhotoInput, S3, limites |

### Rotas públicas

| Task | Arquivo | Rota |
|------|---------|------|
| 06 | [06-route-get-products.md](06-route-get-products.md) | `GET /products` |
| 07 | [07-route-get-product-by-id.md](07-route-get-product-by-id.md) | `GET /products/{id}` |
| 08 | [08-route-post-orders.md](08-route-post-orders.md) | `POST /orders` |

### Rotas admin — produtos

| Task | Arquivo | Rotas |
|------|---------|-------|
| 09 | [09-route-admin-products-list.md](09-route-admin-products-list.md) | `GET /admin/products` |
| 10 | [10-route-admin-products-crud.md](10-route-admin-products-crud.md) | `POST/GET/PUT/DELETE /admin/products*` |
| 11 | [11-route-admin-products-stock.md](11-route-admin-products-stock.md) | `PATCH /admin/products/{id}/stock` |

### Rotas admin — pedidos

| Task | Arquivo | Rotas |
|------|---------|-------|
| 12 | [12-route-admin-orders.md](12-route-admin-orders.md) | `GET/PATCH /admin/orders*` |

### Cross-cutting

| Task | Arquivo | Foco |
|------|---------|------|
| 13 | [13-auth-cognito.md](13-auth-cognito.md) | JWT, Cognito, rotas admin |
| 14 | [14-email-ses.md](14-email-ses.md) | E-mail de novo pedido |
| 15 | [15-dynamodb-access.md](15-dynamodb-access.md) | Query/GSI por rota |
| 16 | [16-overview-and-tests.md](16-overview-and-tests.md) | Handlers, testes, aceite v1 |

## Ordem sugerida

**Trilha mínima (API pública):** `00 → 01 → 04 → 05 → 06 → 07 → 08`

**Trilha admin:** `13 → 03 → 09 → 10 → 11 → 12`

**Antes de implementar DynamoDB:** `15` (idealmente antes de `06` e `12`)

**Antes de merge final v1:** `16`

## Template de cada task

```markdown
# Task NN — Título
**Status:** pendente
**Arquivos alvo:** ...

## Objetivo
## Decisões a tomar
## Checklist de refinamento
## Notas / rascunho
## Quando concluir
```

## Como usar

1. Abra uma task e preencha **Decisões a tomar** e **Notas / rascunho**.
2. Marque **Status** como `em revisão` enquanto discute.
3. Ao fechar decisões, edite as seções referenciadas em `api-routes.md` / `data-models.md` / `overview.md`.
4. Marque checklists em **Quando concluir** e mude **Status** para `concluída`.
