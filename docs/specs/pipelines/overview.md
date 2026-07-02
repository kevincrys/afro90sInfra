# Pipelines — afro90sInfra

**Status:** Rascunho  
**Última atualização:** 2025-06-23

## Escopo deste repositório

Pipelines de **validação e deploy de infraestrutura AWS** via CDK. Não inclui CI dos repos de aplicação.

## Workflows planejados

| Workflow | Arquivo | Trigger | Ação |
|----------|---------|---------|------|
| Validate | `cdk-validate.yml` | PR alterando `infra/**` | build → synth → diff → artifact `cdk.out` |
| Deploy dev | `cdk-deploy-dev.yml` | Push em `dev` | `cdk deploy` ambiente dev |
| Deploy prod | `cdk-deploy-prod.yml` | Push em `main` | `cdk deploy` ambiente production |

## Configuração GitHub

Guia completo: [github-pipeline-setup.md](../../foundation/github-pipeline-setup.md)

Resumo:

- **Environments:** `dev`, `production`
- **Auth:** OIDC (`id-token: write`) — sem access keys
- **Variables:** `AWS_REGION`, `AWS_ROLE_ARN_PR` (repo) · `AWS_ROLE_ARN`, `CDK_ENV` (por environment)

## Tasks de implementação

| Task | Descrição | Status |
|------|-----------|--------|
| [00-environments](../infra/tasks/00-environments.md) | OIDC, roles IAM, environments GitHub | pendente |
| [04-cicd](../infra/tasks/04-cicd.md) | Workflows GitHub Actions | pendente |
| [11-outputs](../infra/tasks/11-outputs.md) | Export outputs pós-deploy | pendente |

## Relação com outros repos

| Repo | Dependência |
|------|-------------|
| afro90sBackend | CDK empacota/deploya Lambda; backend CI deve passar antes do merge |
| afro90sFrontend | Infra provisiona S3/CloudFront; frontend consome outputs |

## Critérios de aceite (fase 0)

- [ ] PR em `infra/**` dispara validate e publica `cdk.out`
- [ ] Push em `dev` faz deploy em ambiente dev
- [ ] Push em `main` faz deploy em production com approval do environment
- [ ] Nenhum secret AWS no repositório
