# Task 05 — Erros HTTP e códigos `code`

**Status:** pendente  
**Arquivos alvo:** `[api-routes.md](../api-routes.md)` — *Formato de erro*, *Códigos HTTP e erros*; `[data-models.md](../data-models.md)` — `ApiError`

## Objetivo

Padronizar respostas de erro em todas as rotas: estrutura `ApiError`, campo `details` e mapeamento `code` → status HTTP.

## Decisões a tomar

- `details` em `VALIDATION_ERROR`: array de `{ field, message }` ou mapa campo → mensagem? mapa
- Expor mensagens de erro em português ou inglês na API? ingles
- `500 INTERNAL_ERROR`: incluir `requestId` no body para suporte? sim 
- Unificar `NOT_FOUND` vs `PRODUCT_NOT_FOUND` — manter ambos ou só um genérico? erro `NOT_FOUND`  com mensagem especifica
- Rate limiting na v1? Se não, remover menções futuras ou deixar explícito "fora de escopo" rate limit somente no stage do gateway

## Checklist de refinamento

- Tabela `code` → HTTP status (completar gaps por rota)
- Exemplo JSON de `VALIDATION_ERROR` com `details` preenchido
- Exemplo JSON de `INVALID_CURSOR`, `INSUFFICIENT_STOCK`, `INVALID_STATUS_TRANSITION`
- Revisar cada rota em `api-routes.md` e garantir tabela de erros consistente

## Notas / rascunho

## Quando concluir

- Atualizar seções de erro em `api-routes.md`
- Atualizar `ApiError` em `data-models.md` se o formato de `details` mudar
- Marcar **Status** como `concluída`

