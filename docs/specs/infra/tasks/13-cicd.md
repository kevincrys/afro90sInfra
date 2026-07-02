# Task 13 — CI/CD (GitHub Actions)

**Status:** pendente  
**Arquivos alvo:** [`overview.md`](../overview.md) — CI/CD; [`cdk.md`](../cdk.md) — CI/CD alvo

## Objetivo

Especificar pipeline GitHub Actions para validação em PR e deploy em `dev` / `production`.

## Decisões a tomar

- [ ] Workflow único `cdk.yml` vs separados validate/deploy
 separados validate/deploy
- [ ] PR: `npm ci` → `build` → `cdk synth` → `cdk diff` (comentário no PR?)
IKSso mesmo
- [ ] Merge em `main`: deploy automático `dev` ou manual?merge em main deploy em prod, merge na branch devc, deploy em dev
- [ ] `production`: workflow_dispatch com approval environment GitHub
com trigger em push na main
- [ ] Autenticação AWS: OIDC `id-token: write` + IAM role
isso
- [ ] Paths filter: só rodar quando `infra/**` muda
Sim
- [ ] Artefato: guardar `cdk.out` em PR para review?
SIm

## Checklist de refinamento

- [ ] Esboço YAML do workflow (comentado ou em task até implementar)
- [ ] Permissões IAM da role de CI (CDK deploy)
- [ ] Critérios de aceite fase 1 item 3 (validate + diff)
- [ ] Cross-link task [02-cdk-config-deploy.md](02-cdk-config-deploy.md)

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `overview.md` e `cdk.md`
- [ ] Marcar **Status** como `concluída`
