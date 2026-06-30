# Task 12 — Variáveis de ambiente e deploy

**Status:** pendente  
**Arquivos alvo:** [`integration.md`](../integration.md); [`overview.md`](../overview.md)

## Objetivo

Fechar configuração `VITE_*`, build de produção e deploy para S3/CloudFront.

## Decisões a tomar

- [ ] Arquivo `.env.example` com chaves sem valores
- [ ] Ambientes: `.env.development` local apontando para API `dev`
- [ ] CI: GitHub Actions no repo `afro90s-web` — build + `aws s3 sync` + invalidação CF
- [ ] Injeção de env no CI a partir de outputs da infra (task [infra 11](../../infra/tasks/11-outputs-env.md))
- [ ] `base` no Vite: `/` para SPA na raiz do CloudFront
- [ ] Preview deployments na v1? (fora de escopo)

## Checklist de refinamento

- [ ] Tabela completa `VITE_*` com origem e exemplo
- [ ] Script `npm run build` e artefato `dist/`
- [ ] Cross-link [infra task 04-frontend-hosting](../../infra/tasks/04-frontend-hosting.md)
- [ ] Ordem de deploy: infra primeiro, depois frontend

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `integration.md` e `overview.md`
- [ ] Marcar **Status** como `concluída**
