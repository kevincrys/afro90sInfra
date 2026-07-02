# ADR-007: Deploy do código Lambda via S3 + update-function-code

**Status:** Aceito  
**Data:** 2025-06-23  
**Autores:** Equipe Afro90s

## Contexto

O backend (`afro90sBackend`) e a infra (`afro90sInfra`) são repositórios separados. A spec inicial previa bundling do código Lambda via CDK `NodejsFunction` no pipeline da infra, o que impedia que merges no backend atualizassem a Lambda automaticamente.

Requisito: a **GitHub Action do backend** deve publicar o pacote da Lambda e atualizar a função em runtime, com histórico de versões e rollback simples.

## Decisão

Adotar **Opção 2 — S3 + `update-function-code`**:

| Responsabilidade | Repositório |
|------------------|-------------|
| Criar Lambda, IAM, API GW, env vars, bucket de artefatos | **afro90sInfra** (CDK) |
| Bundle (esbuild), upload S3, `UpdateFunctionCode` | **afro90sBackend** (GitHub Actions) |

### Fluxo de deploy

1. Merge em `dev` ou `main` no **afro90sBackend**
2. Workflow `deploy-dev.yml` / `deploy-prod.yml`:
   - `npm run bundle` → `lambda.zip`
   - `aws s3 cp` → `s3://afro90s-{env}-s3-lambda-artifacts/api/{sha}.zip` e `api/latest.zip`
   - `aws lambda update-function-code` apontando para `api/latest.zip`
3. CDK **não** redeploya código da Lambda em deploys subsequentes — apenas config (env, timeout, IAM)

### Recursos AWS

- Bucket: `afro90s-{env}-s3-lambda-artifacts` (privado, lifecycle opcional)
- Lambda inicial: `Code.fromInline` placeholder até primeiro deploy do backend
- IAM role GitHub backend: `s3:PutObject` no prefixo `api/*` + `lambda:UpdateFunctionCode`

### Custo incremental

Desprezível para o volume do projeto (~centavos/mês): S3 storage mínimo, PUTs por deploy, API Lambda sem cobrança extra por update.

## Alternativas rejeitadas

| Alternativa | Motivo |
|-------------|--------|
| NodejsFunction no CDK infra | Backend merge não atualiza Lambda sem redeploy infra |
| `update-function-code` direto (sem S3) | Sem histórico/rollback; limite 50 MB no upload direto |
| `repository_dispatch` para infra | Backend não controla o pacote; deploy mais lento |
| Backend roda `cdk deploy` | Acoplamento forte; role CDK no repo de app |

## Consequências

**Positivas**

- Paridade com frontend (CI + deploy no mesmo repo)
- Deploy de código rápido (~30s) independente do CDK
- Versões imutáveis por commit SHA no S3

**Negativas**

- Dois lugares definem aspectos da Lambda (CDK = config, backend = code)
- Disciplina: infra não deve usar `NodejsFunction` com source após ADR-007
- Variáveis GitHub adicionais no backend (`ARTIFACT_BUCKET`, `LAMBDA_FUNCTION_NAME`)

## Referências

- [github-pipeline-setup.md](../github-pipeline-setup.md)
- [backend/tasks/00-deploy-api.md](../../specs/backend/tasks/00-deploy-api.md)
- [infra/tasks/10-api-publica.md](../../specs/infra/tasks/10-api-publica.md)
