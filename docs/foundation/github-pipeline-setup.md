# Configuração de Pipelines — GitHub (ecossistema Afro90s)

Guia para configurar **GitHub Actions**, **Environments**, **branch protection**, **rulesets** e **OIDC AWS** nos três repositórios do projeto.

## Repositórios


| Repositório         | GitHub                      | Pipeline              | Deploy                                     |
| ------------------- | --------------------------- | --------------------- | ------------------------------------------ |
| **afro90sInfra**    | `kevincrys/afro90sInfra`    | CDK validate + deploy | Recursos AWS (CDK) — **não** código Lambda |
| **afro90sBackend**  | `kevincrys/afro90sBackend`  | CI + deploy API       | S3 artifact + `update-function-code`       |
| **afro90sFrontend** | `kevincrys/afro90sFrontend` | CI + deploy SPA       | S3 sync + invalidação CloudFront           |


**Ordem de deploy:** infra (recursos) → backend (código Lambda) → frontend (SPA).

Specs detalhadas de workflows: [pipelines/overview.md](../specs/pipelines/overview.md).

---



## 1. Branches padrão

Em **cada repositório**:


| Branch | Uso                                   |
| ------ | ------------------------------------- |
| `main` | Production — merge só via PR aprovado |
| `dev`  | Integração contínua — deploy automático em `dev` |


```bash
# Criar branch dev (uma vez por repo)
git checkout -b dev
git push -u origin dev
```

---



## 2. AWS — OIDC provider (uma vez na conta)

Console: **IAM → Identity providers → Add provider**


| Campo    | Valor                                         |
| -------- | --------------------------------------------- |
| Type     | OpenID Connect                                |
| URL      | `https://token.actions.githubusercontent.com` |
| Audience | `sts.amazonaws.com`                           |


Conta AWS: `083171867610` · Região: `us-east-1`

---



## 3. AWS — Roles IAM por repositório

Cada role usa trust policy com `token.actions.githubusercontent.com:sub` restrito ao repo e ref/evento.

### afro90sInfra


| Role                      | `sub` no token OIDC (GitHub)                        | Policy (v1)                                   |
| ------------------------- | --------------------------------------------------- | --------------------------------------------- |
| `afro90s-github-cdk-pr`   | `repo:kevincrys/afro90sInfra:pull_request`        | CFN read + diff + `sts:GetCallerIdentity` (ver template) |
| `afro90s-github-cdk-dev`  | `…:environment:dev` **ou** `…:ref:refs/heads/dev` | AdministratorAccess*                          |
| `afro90s-github-cdk-prod` | `…:environment:prod` **ou** `…:ref:refs/heads/main` | AdministratorAccess*                          |

> **Workflows com `environment:` no job** enviam `sub` com `environment:dev` / `environment:prod`, **não** `ref:refs/heads/*`. A trust policy da role IAM precisa incluir o claim `environment:*` — senão: *Not authorized to perform sts:AssumeRoleWithWebIdentity*.


 Restringir após v1 conforme [task 00](../specs/infra/tasks/00-environments.md).

**Deploy automatizado:** [`infra/iam/github-oidc-roles.template.yaml`](../../infra/iam/github-oidc-roles.template.yaml) — OIDC + roles com policies JSON (`sts:GetCallerIdentity`, CFN read/diff).

### afro90sBackend


| Role                          | Trigger GitHub                                      | Policy                                                                                                |
| ----------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `afro90s-github-backend-dev`  | `repo:kevincrys/afro90sBackend:ref:refs/heads/dev`  | `s3:PutObject` em `afro90s-dev-s3-lambda-artifacts/api/*` + `lambda:UpdateFunctionCode` na função dev |
| `afro90s-github-backend-prod` | `repo:kevincrys/afro90sBackend:ref:refs/heads/main` | Idem para recursos prod                                                                               |


> Deploy de **código** Lambda neste repo ([ADR-007](adr/007-backend-lambda-s3-deploy.md)). CI em PR não exige AWS na v1.



### afro90sFrontend


| Role                           | Trigger GitHub                                       | Policy (v1)                                                                     |
| ------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| `afro90s-github-frontend-pr`   | `repo:kevincrys/afro90sFrontend:pull_request`        | `sts:GetCallerIdentity`                                                         |
| `afro90s-github-frontend-dev`  | `repo:kevincrys/afro90sFrontend:ref:refs/heads/dev`  | S3 `PutObject/DeleteObject` no bucket web dev + `cloudfront:CreateInvalidation` |
| `afro90s-github-frontend-prod` | `repo:kevincrys/afro90sFrontend:ref:refs/heads/main` | Idem para recursos prod                                                         |




### Exemplo de trust policy (deploy com GitHub Environment)

Role **cdk-prod** — workflow usa `environment: prod`:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::083171867610:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": [
          "repo:kevincrys/afro90sInfra:environment:prod",
          "repo:kevincrys/afro90sInfra:ref:refs/heads/main"
        ]
      }
    }
  }]
}
```

Role **cdk-dev** — substituir por `environment:dev` e `ref:refs/heads/dev`. PR: `pull_request`.

---



## 4. GitHub Environments

Configurar em **Settings → Environments** de cada repositório.

### afro90sInfra


| Environment  | Variables                                               | Protection rules                                           |
| ------------ | ------------------------------------------------------- | ---------------------------------------------------------- |
| `dev`        | `AWS_ROLE_ARN` = ARN role cdk-dev · `CDK_ENV` = `dev`   | Nenhuma (deploy automático)                                |
| `prod` | `AWS_ROLE_ARN` = ARN role **cdk-prod** · `CDK_ENV` = `prod` | Required reviewers (1+) · Deployment branches: `main` only |

> **`AWS_ROLE_ARN` é obrigatório em cada Environment** (`dev` e `prod`), não basta na repository variable. Se estiver vazio, `configure-aws-credentials` falha com *Could not load credentials from any providers*.

> **Região:** os workflows de infra usam `AWS_REGION=us-east-1` no YAML (fixo).


**Repository variables** (Settings → Secrets and variables → Actions → Variables):


| Nome              | Valor                               |
| ----------------- | ----------------------------------- |
| `AWS_REGION`      | `us-east-1`                         |
| `AWS_ROLE_ARN_PR` | ARN da role `afro90s-github-cdk-pr` |




### afro90sBackend


| Environment  | Variables                                                                  | Protection rules                 |
| ------------ | -------------------------------------------------------------------------- | -------------------------------- |
| `dev`        | `AWS_ROLE_ARN` · `AWS_REGION` · `ARTIFACT_BUCKET` · `LAMBDA_FUNCTION_NAME` | Nenhuma                          |
| `prod` | Idem (valores prod)                                                        | Required reviewers · `main` only |


**Repository variables:**


| Nome           | Valor       |
| -------------- | ----------- |
| `AWS_REGION`   | `us-east-1` |
| `NODE_VERSION` | `20`        |


Valores de `ARTIFACT_BUCKET` e `LAMBDA_FUNCTION_NAME` vêm dos [outputs CDK](../specs/infra/outputs.md) por ambiente.

### afro90sFrontend


| Environment  | Variables                                                              | Protection rules                 |
| ------------ | ---------------------------------------------------------------------- | -------------------------------- |
| `dev`        | `AWS_ROLE_ARN` · `S3_BUCKET` · `CLOUDFRONT_DISTRIBUTION_ID` · `VITE_*` | Nenhuma                          |
| `prod` | Idem com valores prod                                                  | Required reviewers · `main` only |


**Repository variables:**


| Nome                   | Valor                                  |
| ---------------------- | -------------------------------------- |
| `AWS_REGION`           | `us-east-1`                            |
| `VITE_API_BASE_URL`    | Output `ApiBaseUrl` da infra (por env) |
| `VITE_ASSETS_CDN_URL`  | Output `AssetsCdnUrl`                  |
| `VITE_WHATSAPP_NUMBER` | SSM `/afro90s/{env}/whatsapp-number`   |


> Preferir **Variables** para valores não sensíveis. **Secrets** apenas para tokens que não podem ser variables.

---



## 5. Branch protection rules

**Settings → Branches → Add branch protection rule** (ou Rulesets — seção 6).

### Regra para `main` (todos os repos)


| Opção                                 | Valor                                                    |
| ------------------------------------- | -------------------------------------------------------- |
| Require a pull request before merging | ✅                                                        |
| Required approvals                    | 1                                                        |
| Require status checks to pass         | ✅                                                        |
| Status checks                         | Nome do workflow CI/validate (ex.: `ci`, `cdk-validate`) |
| Require branches to be up to date     | ✅                                                        |
| Do not allow bypassing                | ✅ (admins incluídos, se possível)                        |
| Restrict pushes                       | Apenas via PR                                            |




### Regra para `dev` (opcional)


| Opção                 | Valor                      |
| --------------------- | -------------------------- |
| Require status checks | ✅                          |
| Allow direct push     | ✅ (para integração rápida) |


---



## 6. Rulesets (GitHub Rules)

Alternativa ou complemento às branch protection rules clássicas.

**Settings → Rules → Rulesets → New ruleset**


| Campo           | Valor sugerido                                                            |
| --------------- | ------------------------------------------------------------------------- |
| Name            | `main-protection`                                                         |
| Enforcement     | Active                                                                    |
| Target branches | `main`                                                                    |
| Rules           | Require PR · Require 1 approval · Require status check · Block force push |


Repita por repositório. Rulesets oferecem controle mais granular (ex.: bypass list para bots).

---



## 7. Workflows por repositório



### afro90sInfra


| Arquivo                                 | Trigger                                      | Environment  |
| --------------------------------------- | -------------------------------------------- | ------------ |
| `.github/workflows/cdk-validate.yml`    | PR em `infra/**` ou workflows CDK            | —            |
| `.github/workflows/cdk-deploy-dev.yml`  | Push `dev` · ou **Run workflow** (manual)    | `dev`        |
| `.github/workflows/cdk-deploy-prod.yml` | Push `main` · ou **Run workflow** (manual)  | `prod` |

> **Dev e prod são independentes:** push em `main` **não** dispara deploy dev (e vice-versa). Cada workflow usa branch + environment + role OIDC próprios. Para atualizar **dev** na AWS: merge/push na branch `dev`, ou Actions → `cdk-deploy-dev` → **Run workflow**.


Spec: [infra/tasks/04-cicd.md](../specs/infra/tasks/04-cicd.md)

### afro90sBackend


| Arquivo                             | Trigger                    | Environment  |
| ----------------------------------- | -------------------------- | ------------ |
| `.github/workflows/ci.yml`          | PR + push (todas branches) | —            |
| `.github/workflows/deploy-dev.yml`  | Push `dev`                 | `dev`        |
| `.github/workflows/deploy-prod.yml` | Push `main`                | `prod` |


Steps CI: `npm ci` → `npm run build` → `npm run test:coverage` → `npm run lint`

Steps deploy: `npm run bundle` → zip → S3 `api/{sha}.zip` + `api/latest.zip` → `lambda update-function-code`

Spec: [backend/tasks/00-deploy-api.md](../specs/backend/tasks/00-deploy-api.md)

### afro90sFrontend


| Arquivo                             | Trigger     | Environment  |
| ----------------------------------- | ----------- | ------------ |
| `.github/workflows/ci.yml`          | PR + push   | —            |
| `.github/workflows/deploy-dev.yml`  | Push `dev`  | `dev`        |
| `.github/workflows/deploy-prod.yml` | Push `main` | `prod` |


Spec: [frontend/tasks/04-cicd-deploy.md](../specs/frontend/tasks/04-cicd-deploy.md)

### Snippet OIDC (workflows com AWS)

```yaml
permissions:
  id-token: write
  contents: read

env:
  AWS_REGION: us-east-1

- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ vars.AWS_ROLE_ARN }}
    aws-region: ${{ env.AWS_REGION }}
```

**Nunca** usar `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` nos repositórios.

---



## 8. Checklist de configuração

**Número da task = ordem de execução.** Ver [tasks/README.md](../specs/infra/tasks/README.md).

### Task 00 — fundação manual (console / GitHub) ✅

**AWS (uma vez na conta):**

- [x] OIDC provider criado
- [x] Roles IAM para os 3 repos (v1)
- [ ] MFA em `kevincrys-admin` e conta root *(recomendado; não bloqueia CI/CD)*

**afro90sInfra (GitHub):**

- [x] Branch `dev` criada
- [x] Environments `dev` e `prod` configurados
- [x] Variables preenchidas (`AWS_REGION`, `AWS_ROLE_ARN_PR`, env vars)
- [x] Branch protection / ruleset em `main`

### Tasks 01–04 — fundação CDK (em sequência)

- [ ] **01** — config por ambiente (`lib/config/`) ✅
- [ ] **02** — stacks scaffold ✅
- [ ] **03** — tags e naming ✅
- [ ] **04** — workflows + bootstrap na pipeline ✅

### Validação end-to-end (após stacks CDK existirem)

- [ ] Merge infra em `dev` → stacks CloudFormation atualizam
- [ ] Merge backend em `dev` → deploy-dev publica zip e Lambda dev atualiza
- [ ] Merge frontend em `dev` → SPA publicada no CloudFront dev

---



## Referências

- [Task 00 — Environments e OIDC](../specs/infra/tasks/00-environments.md)
- [Task 04 — CI/CD infra](../specs/infra/tasks/04-cicd.md)
- [Pipelines overview](../specs/pipelines/overview.md)
- [Arquitetura — fluxo de deploy](architecture.md)

