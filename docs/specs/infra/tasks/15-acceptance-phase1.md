# Task 15 — Aceite fase 1 e wiring entre stacks

**Status:** pendente  
**Arquivos alvo:** [`overview.md`](../overview.md) — critérios de aceite; todas as tasks infra concluídas

## Objetivo

Consolidar checklist pós-deploy da fase 1 e validar integração entre stacks e apps.

## Decisões a tomar

- [ ] Definição de "dev provisionável": todas as 5 stacks green?
- [ ] Smoke tests manuais vs script automatizado pós-deploy
- [ ] Ordem de verificação: API → DynamoDB → S3 → CloudFront → Cognito
- [ ] Quem valida outputs: maintainer infra vs dev app
- [ ] Rollback strategy em production na v1

## Checklist de refinamento

- [ ] Critérios aceite fase 1 (overview) expandidos em checklist executável:
  - [ ] `cdk deploy --all -c env=dev` sem erros
  - [ ] Outputs documentados acessíveis via CLI
  - [ ] `GET /products` retorna 200 (mesmo vazio)
  - [ ] CloudFront serve `index.html`
  - [ ] Cognito login admin funcional
  - [ ] Pipeline CI validate + diff no PR
- [ ] Diagrama wiring: FrontendStack → ApiStack CORS origin
- [ ] ApiStack → DataStack table names
- [ ] ApiStack → AssetsStack bucket
- [ ] ApiStack → AuthStack authorizer
- [ ] Dependências entre repos: afro90sInfra deploy antes de afro90s-api/web

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `overview.md` critérios de aceite
- [ ] Revisar [`tasks/README.md`](README.md) — marcar progresso geral
- [ ] Marcar **Status** como `concluída`
