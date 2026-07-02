# Task 10 — Rotas CRUD admin de produtos

**Status:** pendente  
**Arquivos alvo:** `[api-routes.md](../api-routes.md)` — `POST`, `GET`, `PUT`, `DELETE /admin/products`*; task [03-photo-upload.md](03-photo-upload.md)

## Objetivo

Refinar criação, leitura, atualização e remoção de produtos no painel admin.

## Decisões a tomar

- `POST`: gerar `id` (UUID v4) no servidor — confirmar sim
- `PUT`: substituição total vs PATCH parcial (hoje: PUT substitui campos enviados) substituição total
- `DELETE`: hard delete no DynamoDB; bloquear se produto referenciado em pedido ativo? (`409`) sim 
- `DELETE`: remover imagens do S3 em cascata? sim, a depender do custo
- `POST`/`PUT`: priorizar modo JSON ou multipart como default no frontend? sim 
- Conflito de nome duplicado: permitido na v1? não 

## Checklist de refinamento

- Cada método com request/response e erros revisados
- `201` vs `200` status codes corretos
- `DELETE` retorna `204` sem body
- Cross-link upload (task 03) nos modos A e B

## Notas / rascunho



## Quando concluir

- Atualizar seções CRUD admin products em `api-routes.md`
- Marcar **Status** como `concluída`

