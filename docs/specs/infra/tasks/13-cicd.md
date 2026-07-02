# Task 13 — CI/CD (GitHub Actions)

**Status:** pendente  
**Arquivos alvo:** [`overview.md`](../overview.md), [`cdk.md`](../cdk.md), `.github/workflows/`

## Objetivo

Criar os 3 workflows GitHub Actions para validação em PRs e deploy automático em `dev` e `prod`.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Workflows | Separados: `validate`, `deploy-dev`, `deploy-prod` |
| PR | `build` → `synth` → `diff` + upload `cdk.out` |
| Branch `dev` → deploy | Automático em `dev` |
| Branch `main` → deploy | Automático em `prod` |
| Auth AWS | OIDC (`id-token: write`) |
| Path filter | Só quando `infra/**` muda |
| Artefato | `cdk.out` guardado no PR |

## O que implementar

### `.github/workflows/cdk-validate.yml`

- [ ] Trigger: `pull_request` com `paths: ['infra/**']`
- [ ] Permissions: `id-token: write`, `contents: read`, `pull-requests: write`
- [ ] Steps:
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` com Node 20
  3. `aws-actions/configure-aws-credentials@v4` usando `${{ vars.AWS_ROLE_ARN_PR }}`
  4. `npm ci` em `infra/`
  5. `npm run build`
  6. `npm run synth:dev`
  7. `npm run diff:dev`
  8. `actions/upload-artifact@v4` com `cdk.out/`

### `.github/workflows/cdk-deploy-dev.yml`

- [ ] Trigger: `push` em `dev` com `paths: ['infra/**']`
- [ ] `environment: dev`
- [ ] Permissions: `id-token: write`, `contents: read`
- [ ] Steps:
  1. Checkout
  2. Node 20
  3. `configure-aws-credentials` usando `${{ vars.AWS_ROLE_ARN }}`
  4. `npm ci`
  5. `npm run build`
  6. `npm run deploy:dev -- --require-approval never`
  7. `bash infra/scripts/export-outputs.sh dev`
  8. Upload `outputs-dev.json` como artifact

### `.github/workflows/cdk-deploy-prod.yml`

- [ ] Trigger: `push` em `main` com `paths: ['infra/**']`
- [ ] `environment: production`
- [ ] Permissions: `id-token: write`, `contents: read`
- [ ] Steps: iguais ao deploy-dev mas com `prod`
- [ ] Após deploy: `bash infra/scripts/export-outputs.sh prod`

### Snippet OIDC padrão (todos os workflows)

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ vars.AWS_ROLE_ARN }}
    aws-region: us-east-1
```

### Variáveis nos workflows (sem hardcode)

- [ ] `AWS_ROLE_ARN` via GitHub Environment variable (definido na task 00)
- [ ] `AWS_ROLE_ARN_PR` via repository variable (definido na task 00)
- [ ] `CDK_ENV` via GitHub Environment variable

## Pré-requisitos

- Task 00 concluída (OIDC provider e roles IAM criados, Environments no GitHub configurados)
- Task 02 concluída (scripts npm funcionando)

## Critérios de conclusão

- [ ] PR alterando `infra/**` dispara `cdk-validate.yml` e artifacts `cdk.out` disponíveis
- [ ] Merge em `dev` dispara `cdk-deploy-dev.yml` e stacks atualizam no CloudFormation
- [ ] Merge em `main` dispara `cdk-deploy-prod.yml` com environment `production`
- [ ] Nenhum secret AWS nas variáveis do repositório (somente ARN da role)
- [ ] `overview.md` e `cdk.md` atualizados com referência aos workflows
- [ ] Atualizar **Status** para `concluída`
