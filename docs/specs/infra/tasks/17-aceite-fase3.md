# Task 17 — Aceite Fase 3 (Rotas admin)

**Fase:** 3 — Rotas admin  
**Status:** concluída  
**Arquivos alvo:** [`overview.md`](../overview.md)

## Objetivo

Validar que o painel admin está funcional: CRUD de produtos, gestão de pedidos, upload de imagens — tudo protegido por Cognito.

## Checklist de aceite

### Autenticação e autorização

- [x] `GET /admin/products` sem token → `401`
- [x] `GET /admin/products` com token expirado → `401`
- [x] `GET /admin/products` com token válido (grupo `admins`) → `200`

### Produtos

- [x] `POST /admin/products` cria produto → `201`, produto aparece em `GET /products`
- [x] Imagem do produto acessível via CDN / CloudFront
- [x] `PUT /admin/products/{id}` atualiza nome/preço
- [x] `PUT /admin/products/{id}/stock` atualiza quantidade
- [x] `DELETE /admin/products/{id}` remove produto; `GET /products/{id}` retorna `404`
- [x] `GET /admin/products?q=` busca por ID ou nome (backend task 22)

### Pedidos

- [x] `GET /admin/orders` lista pedidos
- [x] `POST /orders` cria pedido (rota pública); `GET /admin/orders` mostra o pedido
- [x] `PUT /admin/orders/{id}` atualiza status
- [x] `GET /admin/orders?q=` busca por ID ou nome do cliente

### Regressão

- [x] `GET /products` continua retornando `200`
- [x] `POST /orders` continua retornando `201`
- [x] CloudFront frontend ainda acessível

## Pré-requisitos

- [Task 16](16-api-admin.md) concluída

## Critérios de conclusão

- [x] Todos os itens do checklist marcados (BDD / aceite manual)
- [x] `overview.md` atualizado com status da fase 3
- [x] **Status** concluída — **fase 3 entregue**
