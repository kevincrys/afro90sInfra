# Pipelines — afro90sInfra

**Status:** Rascunho  
**Última atualização:** 2025-06-23

## Escopo deste repositório

Pipelines de **validação e deploy de infraestrutura AWS** via CDK. **Não** inclui deploy do código da Lambda — isso é responsabilidade do **afro90sBackend** ([ADR-007](../../foundation/adr/007-backend-lambda-s3-deploy.md)).

## Workflows planejados

| Workflow | Arquivo | Trigger | Ação |
|----------|---------|---------|------|
| Validate | `cdk-validate.yml` | PR alterando `infra/**` | build → synth → diff → artifact `cdk.out` |
| Deploy dev | `cdk-deploy-dev.yml` | Push em `dev` | `cdk deploy` ambiente dev |
| Deploy prod | `cdk-deploy-prod.yml` | Push em `main` | `cdk deploy` ambiente production |

## O que o CDK deploya vs o que o backend deploya

| Aspecto | afro90sInfra (CDK) | afro90sBackend (Actions) |
|---------|-------------------|--------------------------|
| Lambda function (recurso) | ✅ Cria | — |
| Lambda **código** (zip) | Placeholder inicial | ✅ S3 + `update-function-code` |
| API Gateway, DynamoDB, IAM | ✅ | — |
| Env vars, timeout, memory | ✅ | — |
| Bucket `s3-lambda-artifacts` | ✅ Cria | ✅ Upload zip |

## Configuração GitHub

Guia completo: [github-pipeline-setup.md](../../foundation/github-pipeline-setup.md)

## Tasks de implementação

Ordem sequencial: ver [tasks/README.md](../infra/tasks/README.md).

| Task | Descrição | Status |
|------|-----------|--------|
| [00-environments](../infra/tasks/00-environments.md) | OIDC, roles IAM, GitHub | concluída |
| [01-cdk-config-deploy](../infra/tasks/01-cdk-config-deploy.md) | Config dev/prod + scripts npm | concluída |
| [02-cdk-stacks](../infra/tasks/02-cdk-stacks.md) | Stacks scaffold | concluída |
| [03-tags-naming](../infra/tasks/03-tags-naming.md) | Tags globais | concluída |
| [04-cicd](../infra/tasks/04-cicd.md) | Workflows + bootstrap na pipeline | concluída |

## Relação com outros repos

| Repo | Dependência |
|------|-------------|
| afro90sBackend | Consome outputs (`LAMBDA_FUNCTION_NAME`, `ARTIFACT_BUCKET`); publica código após infra fase 1 |
| afro90sFrontend | Infra provisiona S3/CloudFront; frontend consome outputs |

## Critérios de aceite (fase 0)

- [ ] PR em `infra/**` dispara validate e publica `cdk.out`
- [ ] Push em `dev` faz deploy em ambiente dev (recursos, não código app)
- [ ] Outputs disponíveis para workflows do backend e frontend
- [ ] Nenhum secret AWS no repositório
