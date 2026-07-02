# Task 05 — Assets storage (imagens de produtos)

**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md), [`outputs.md`](../outputs.md)

## Objetivo

Implementar `StorageStack`: bucket S3 de imagens de produtos com entrega via behavior `/assets/*` na distribuição CloudFront web.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| CDN | Behavior `/assets/*` na distribuição cf-web (não distribuição separada) |
| Acesso público | OAC via CloudFront |
| Estrutura de chave | `products/{productId}/{uuid}.{ext}` |
| Upload | Via Lambda admin (não direto do browser) |
| Encryption | SSE-S3 (padrão AWS) |
| Lifecycle orphans | Fora de escopo v1 (v2) |

## O que implementar

### S3 — bucket assets

- [ ] Criar bucket `afro90s-{env}-s3-assets`
- [ ] `blockPublicAccess: BlockPublicAccess.BLOCK_ALL`
- [ ] `encryption: BucketEncryption.S3_MANAGED` (SSE-S3)
- [ ] `versioned: false` em dev; `false` em prod (imagens são substituídas por UUID)
- [ ] `removalPolicy: DESTROY` em dev, `RETAIN` em prod
- [ ] `cors: []` — sem CORS (upload somente via Lambda)

### CloudFront — behavior `/assets/*`

- [ ] Adicionar origin do bucket assets na distribuição criada na task 04
  - Usar `S3BucketOrigin.withOriginAccessControl()` para o bucket assets
- [ ] Adicionar `additionalBehaviors` para path `assets/*`:
  - `allowedMethods: AllowedMethods.ALLOW_GET_HEAD`
  - `cachePolicy: CachePolicy.CACHING_OPTIMIZED`
  - `viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS`

> A distribuição pertence ao `FrontendStack`. O `StorageStack` exporta o bucket ARN/nome para que o `FrontendStack` adicione o behavior. Usar SSM para cross-stack.

### Exports via SSM

- [ ] `/afro90s/{env}/assets-bucket-name` = nome do bucket
- [ ] `/afro90s/{env}/assets-bucket-arn` = ARN do bucket

### Outputs CloudFormation

- [ ] `CfnOutput` `AssetsBucketName`
- [ ] `CfnOutput` `AssetsCdnUrl` = `https://{cloudfront-domain}/assets` (sem barra final)

## Pré-requisitos

- Task 04 concluída (distribuição CloudFront web existente)
- Task 10 concluída (permissões IAM Lambda para PutObject)

## Critérios de conclusão

- [ ] Imagem salva em `products/test/uuid.jpg` acessível via `{AssetsCdnUrl}/products/test/uuid.jpg`
- [ ] Bucket não acessível publicamente por URL S3 direta (403)
- [ ] Outputs `AssetsBucketName` e `AssetsCdnUrl` no CloudFormation
- [ ] `resources.md` e `outputs.md` atualizados
- [ ] Atualizar **Status** para `concluída`
