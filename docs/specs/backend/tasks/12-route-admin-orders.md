# Task 12 — Rotas admin de pedidos

**Status:** pendente  
**Arquivos alvo:** `[api-routes.md](../api-routes.md)` — `GET /admin/orders`, `GET /admin/orders/{id}`, `PATCH /admin/orders/{id}/status`; `[data-models.md](../data-models.md)` — transições de status

## Objetivo

Refinar listagem, detalhe e atualização de status de pedidos no admin.

## Decisões a tomar

- `GET /admin/orders`: ordenação default `createdAt` desc? sim 
- Filtros além de `status`: intervalo de datas, `customer.tel` — v1 ou v2? intervalo de datas e status
- Listar todos os status misturados se `status` omitido? sim
- `PATCH .../status`: admin pode cancelar de qualquer estado não terminal? sim 
- Notificar cliente (e-mail/WhatsApp) ao mudar status — v2? via ses, mas somente na transição para EM PREPARAÇÃO, mas deixe toda a parte do ses como ultima parte da V1, de forma com que seja possivel realizar tudo sem o ses
- Registrar `updatedAt` e opcionalmente `updatedBy` (sub Cognito) — v2? updatedAt somente

## Checklist de refinamento

- Paginação + filtro `status` + cursor (task 04)
- Tabela de transições aplicada na validação do PATCH
- Erros: `INVALID_STATUS_TRANSITION`, `NOT_FOUND`
- Response `200` com `Order` completo após PATCH

## Notas / rascunho



## Quando concluir

- Atualizar seções admin orders em `api-routes.md`
- Revisar transições em `data-models.md` se necessário
- Marcar **Status** como `concluída`

