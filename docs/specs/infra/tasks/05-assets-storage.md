# Task 05 — Assets storage (imagens de produtos)

**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md) — S3 assets, CloudFront assets; [`outputs.md`](../outputs.md) — `AssetsCdnUrl`

## Objetivo

Fechar armazenamento e entrega de imagens enviadas pelo admin (`POST /admin/products`).

## Decisões a tomar

- [ ] CloudFront dedicado (`cf-assets`) vs behavior `/assets/*` no `cf-web`
- [ ] Acesso público via OAC no CloudFront vs presigned URLs apenas
- [ ] Estrutura de chave: `products/{productId}/{uuid}.{ext}` — confirmar
- [ ] CORS no bucket assets para upload direto do browser (v1: upload via Lambda apenas)
- [ ] Lifecycle policy para imagens órfãs — v2?
- [ ] Encryption: SSE-S3 vs SSE-KMS

## Checklist de refinamento

- [ ] Bucket `afro90s-{env}-s3-assets` e permissões Lambda admin
- [ ] Montagem de URL pública: `ASSETS_CDN_URL` + key
- [ ] Alinhar com [backend task 03-photo-upload.md](../../backend/tasks/03-photo-upload.md)
- [ ] Limite 10 MB API GW — impacto em base64 múltiplo

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `resources.md` e `outputs.md`
- [ ] Marcar **Status** como `concluída`
