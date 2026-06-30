# Task 04 — Frontend hosting (S3 + CloudFront)

**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md) — S3 web, CloudFront; [`cdk.md`](../cdk.md) — `FrontendStack`

## Objetivo

Fechar hospedagem da SPA React: bucket privado, CDN, SPA routing e deploy via CI.

## Decisões a tomar

- [ ] OAC (Origin Access Control) vs OAI legado — recomendado: OAC
- [ ] Custom error responses: `403` e `404` → `/index.html` (200)
- [ ] Domínio customizado + certificado ACM na v1 ou só `*.cloudfront.net`?
- [ ] HTTPS: redirect HTTP → HTTPS obrigatório
- [ ] Cache policy para `index.html` (no-cache ou curto) vs assets com hash
- [ ] Deploy SPA: `aws s3 sync` no CI — invalidação CloudFront obrigatória?

## Checklist de refinamento

- [ ] Bucket `afro90s-{env}-s3-web` — block public access, versionamento?
- [ ] Output `CloudFrontWebUrl` para CORS da API e `VITE_*`
- [ ] Documentar pipeline de deploy do repo `afro90s-web`
- [ ] Headers de segurança (HSTS, X-Content-Type-Options) — v1 ou v2?

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `resources.md` e `cdk.md` se necessário
- [ ] Marcar **Status** como `concluída`
