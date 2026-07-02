# Task 04 — Frontend hosting (S3 + CloudFront)

**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md), [`cdk.md`](../cdk.md)

## Objetivo

Implementar `FrontendStack`: bucket S3 privado + distribuição CloudFront com OAC para hospedar a SPA React.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Acesso S3 | OAC (Origin Access Control) |
| SPA routing | Custom error `403/404 → /index.html` (status 200) |
| Domínio customizado | Base preparada, domínio ainda a comprar |
| HTTPS | Redirect obrigatório HTTP → HTTPS |
| Cache `index.html` | `no-cache` (TTL 0) |
| Cache assets com hash | Cache longo (1 ano) |
| Deploy SPA | `aws s3 sync` no CI + invalidação CloudFront |
| CloudFront Price Class | `PriceClass_200` (inclui Brasil) |

## O que implementar

### S3 — bucket web

- [ ] Criar bucket `afro90s-{env}-s3-web`
- [ ] `blockPublicAccess: BlockPublicAccess.BLOCK_ALL`
- [ ] `versioned: false` em dev; `true` em prod
- [ ] `removalPolicy`: `DESTROY` em dev, `RETAIN` em prod
- [ ] `autoDeleteObjects: true` em dev (para `cdk destroy`)

### CloudFront — distribuição web

- [ ] Origin: bucket web via `S3BucketOrigin.withOriginAccessControl()`
- [ ] `priceClass: PriceClass.PRICE_CLASS_200`
- [ ] Viewer protocol: `REDIRECT_TO_HTTPS`
- [ ] Custom error responses:
  - `403 → /index.html` status `200`
  - `404 → /index.html` status `200`
- [ ] Cache policy `index.html`: `CachePolicy.CACHING_DISABLED`
- [ ] Cache policy `assets/*`: TTL máximo com `CachePolicy.CACHING_OPTIMIZED`
- [ ] Alias de domínio: configurar `domainNames` com `config.domainName` se definido (placeholder)
- [ ] `defaultRootObject: 'index.html'`
- [ ] Security headers mínimos via `ResponseHeadersPolicy` (HSTS, X-Content-Type-Options)

### Outputs

- [ ] `CfnOutput` `CloudFrontWebUrl` = URL da distribuição (sem barra final)
- [ ] Exportar via SSM: `/afro90s/{env}/cloudfront-web-url`

## Pré-requisitos

- Tasks 01, 02, 03 concluídas

## Critérios de conclusão

- [ ] `cdk synth` gera bucket + distribuição CloudFront com OAC
- [ ] URL CloudFront acessível após deploy (`https://*.cloudfront.net`)
- [ ] `index.html` servido em qualquer rota (SPA routing funcionando)
- [ ] Assets estáticos com cabeçalho `Cache-Control: max-age=31536000`
- [ ] `index.html` com `Cache-Control: no-cache`
- [ ] Output `CloudFrontWebUrl` disponível no CloudFormation
- [ ] `resources.md` atualizado
- [ ] Atualizar **Status** para `concluída`
