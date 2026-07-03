# Runbook — Task 00 (environments)

Passos de **setup inicial** que exigem **AWS Console** (preferido) ou **AWS CLI** local (opcional).

> **Fluxo padrão:** configurar OIDC, roles e GitHub manualmente; **não** é necessário CLI local para operar o projeto. CDK bootstrap roda na pipeline ([task 04](../../docs/specs/infra/tasks/04-cicd.md)).

Login console: https://083171867610.signin.aws.amazon.com/console

## 1. IAM roles GitHub

### Opção A — Console (recomendado se evitar CLI)

1. **IAM → Identity providers** — OIDC `https://token.actions.githubusercontent.com`, audience `sts.amazonaws.com`
2. Criar as **8 roles** conforme [github-pipeline-setup.md](../../docs/foundation/github-pipeline-setup.md) (seção 3) ou outputs do template abaixo

> **Frontend:** exige distribution IDs **dev** e **prod** separados (CloudFront console) antes de aplicar/atualizar o template OIDC.

### Opção B — CloudFormation (CLI local)

Requer perfil admin (`aws configure --profile kevincrys-admin`):

```bash
cd infra/iam
aws cloudformation deploy \
  --profile kevincrys-admin \
  --region us-east-1 \
  --stack-name afro90s-github-oidc-roles \
  --template-file github-oidc-roles.template.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    FrontendDevCloudFrontDistributionId=E1234567890ABC \
    FrontendProdCloudFrontDistributionId=E9876543210XYZ \
  --no-fail-on-empty-changeset
```

Substituir os IDs `E…` pelos valores reais (CloudFront console → distribuição web de cada ambiente). Devem ser **iguais** a `CLOUDFRONT_DISTRIBUTION_ID` nos GitHub Environments do `afro90sFrontend`.

Se o OIDC provider **já existir**, remova o recurso `GitHubOidcProvider` do template ou importe o provider existente.

Anote os ARNs das roles para o GitHub.

## 2. GitHub — afro90sInfra

### Branch `dev`

```bash
git checkout -b dev
git push -u origin dev
```

(Ou criar a branch direto no GitHub.)

### Repository variables

| Nome | Valor |
|------|-------|
| `AWS_REGION` | `us-east-1` |
| `AWS_ROLE_ARN_PR` | ARN role `afro90s-github-cdk-pr` |

### Environment `dev`

| Variable | Valor |
|----------|-------|
| `AWS_ROLE_ARN` | ARN role `afro90s-github-cdk-dev` |
| `CDK_ENV` | `dev` |

### Environment `prod`

| Variable | Valor |
|----------|-------|
| `AWS_ROLE_ARN` | ARN role `afro90s-github-cdk-prod` |
| `CDK_ENV` | `prod` |

Proteger `main`: PR + required checks (checks de workflow aparecem após [task 04](../../docs/specs/infra/tasks/04-cicd.md)).

## 3. GitHub — afro90sBackend

Environments `dev` e `prod` com:

| Variable | dev |
|----------|-----|
| `AWS_ROLE_ARN` | ARN role `afro90s-github-backend-dev` |
| `AWS_REGION` | `us-east-1` |
| `ARTIFACT_BUCKET` | Output `LambdaArtifactsBucketName` (copiar 1x para GitHub Environment) |

Nomes das Lambdas: **SSM em runtime** — não configurar no GitHub (ver [outputs.md](../../infra/outputs.md)).

(prod: valores `prod` após task 10)

## 4. GitHub — afro90sFrontend

Environments **`dev`** e **`production`** com:

| Variable | dev |
|----------|-----|
| `AWS_ROLE_ARN` | ARN role `afro90s-github-frontend-dev` |
| `AWS_REGION` | `us-east-1` |
| `S3_BUCKET` | `afro90s-dev-s3-web` |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID CloudFront web dev (mesmo valor do parâmetro OIDC `FrontendDevCloudFrontDistributionId`) |

(production: valores prod — distribution ID **prod**, bucket `afro90s-prod-s3-web`)

`VITE_*` (fase 1): **SSM em runtime** — não configurar no GitHub. Ver [outputs.md](../../docs/specs/infra/outputs.md) § Frontend deploy.

## 5. Validar synth local (sem AWS)

Só Node.js — não precisa de credenciais:

```bash
cd infra
npm ci
npm run build
npm run synth:dev
npm run synth:prod
```

## 6. CDK bootstrap — **não nesta task**

O stack `CDKToolkit` (bucket S3 + roles internas do CDK) é criado **automaticamente** na primeira execução dos workflows de deploy ([task 04](../../docs/specs/infra/tasks/04-cicd.md)), via:

```bash
npx cdk bootstrap aws://083171867610/us-east-1 -c env=dev
```

Comando idempotente: se já existir, não altera nada.

**Alternativa local** (opcional): rodar o mesmo comando com `--profile kevincrys-admin` antes da pipeline.

## Usuário IAM admin (recomendado)

- Criar `kevincrys-admin` com `AdministratorAccess` + MFA
- MFA na conta root
- Access key + `aws configure` **apenas** se for usar CLI local

> **SES:** configuração e verificação de e-mails → [task 18](../../docs/specs/infra/tasks/18-ses.md) (fase 4).
