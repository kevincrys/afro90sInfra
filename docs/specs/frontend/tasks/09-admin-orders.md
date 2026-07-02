# Task 09 — Admin — Gestão de pedidos

**Status:** pendente  
**Arquivos alvo:** [`integration.md`](../integration.md); [`ui-ux.md`](../ui-ux.md)

## Objetivo

Fechar listagem de pedidos e atualização de status no painel admin.

## Decisões a tomar

- [ ] Listagem: filtro por `status` (tabs ou select)
tabs
- [ ] Ordenação: mais recentes primeiro (default API)
Sim
- [ ] Detalhe do pedido: drawer, modal ou página `/admin/pedidos/:id`
drawer
- [ ] Mudança de status: dropdown com apenas transições válidas (ver data-models)
Sim
- [ ] Exibir dados do `customer` e itens com nomes de produto (join client-side ou enriquecer API v2?)
sim
- [ ] Paginação com cursor na listagem admin
Sim
## Checklist de refinamento

- [ ] `GET /admin/orders`, `GET /admin/orders/{id}`, `PATCH .../status`
- [ ] Mapear `OrderStatus` para labels pt-BR na UI
- [ ] Skeleton admin pedidos
- [ ] Cross-link [backend task 12](../../backend/tasks/12-route-admin-orders.md)

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `integration.md` e `ui-ux.md`
- [ ] Marcar **Status** como `concluída`
