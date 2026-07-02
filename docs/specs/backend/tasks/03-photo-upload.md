# Task 03 — Upload de imagens (PhotoInput)

**Status:** pendente  
**Arquivos alvo:** `[data-models.md](../data-models.md)` — `PhotoInput`; `[api-routes.md](../api-routes.md)` — `POST/PUT /admin/products`, seção *Upload de imagens*

## Objetivo

Fechar comportamento de fotos no CRUD admin: url, base64, stream, limites e lifecycle no S3.

## Decisões a tomar

- Confirmar limites: 5 MB/imagem, 10 fotos/produto, MIME jpeg/png/webp
- sim
- `base64`: aceitar data URI completo (`data:image/jpeg;base64,...`) — strip automático do prefixo?
- `url`: validar que é HTTPS? permitir domínios externos ou só CDN próprio?
- `PUT` substitui `photos[]` inteiro — confirmar remoção de URLs antigas
- sim
- Ao remover foto no PUT ou DELETE produto: deletar objeto no S3? (recomendado: sim na v1)
- sim, se o custo compensar
- Nome de arquivo no S3: `products/{productId}/{uuid}.{ext}` — confirmar
- Ordem das fotos em `photos[]`: primeira = capa no frontend?

## Checklist de refinamento

- Documentar fluxo multipart (campos `photo_0`, JSON em `photos`) com exemplo completo
- Erros: `INVALID_IMAGE`, `PAYLOAD_TOO_LARGE` — critérios exatos
- Lambda: API Gateway 10 MB — estratégia se várias imagens base64 no mesmo JSON
- Alinhar com bucket `s3-assets` em `[resources.md](../../infra/resources.md)`

## Notas / rascunho

## Quando concluir

- Atualizar `PhotoInput` em `data-models.md`
- Atualizar seções admin products e *Upload de imagens* em `api-routes.md`
- Marcar **Status** como `concluída`

