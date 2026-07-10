# Spec: CDK — Estrutura e deploy

**Status:** Aprovado  
**Última atualização:** 2025-06-23

## Objetivo

Definir a organização do projeto AWS CDK no repositório `afro90sInfra`.

## Estrutura de pastas

```
infra/
├── bin/
│   └── app.ts                 # entry point; instancia stacks por env
├── lib/
│   ├── config/
│   │   ├── types.ts           # AppConfig
│   │   ├── dev.ts / prod.ts
│   │   └── index.ts           # getConfig()
│   ├── stacks/
│   │   ├── database-stack.ts  # DynamoDB
│   │   ├── auth-stack.ts      # Cognito
│   │   ├── storage-stack.ts   # S3 assets
│   │   ├── api-stack.ts       # API Gateway + Lambda
│   │   └── frontend-stack.ts  # S3 web + CloudFront
│   └── constructs/            # constructs reutilizáveis (site-certificate, hosted-zone — task 21; dev-access-gate-function — task 22)
├── test/
├── cdk.json
├── package.json
└── tsconfig.json
```

## Stacks e dependências

Nomes físicos: `afro90s-{env}-stack-{nome}`

| Stack | Sufixo | Recursos (fase) |
|-------|--------|-----------------|
| DatabaseStack | `database` | DynamoDB (task 05) |
| AuthStack | `auth` | Cognito (task 13) |
| StorageStack | `storage` | S3 assets (task 07) |
| ApiStack | `api` | API GW + Lambda (task 10) |
| FrontendStack | `frontend` | S3 web + CloudFront (task 06) |

```
DatabaseStack ──┬──► ApiStack ◄── siteCertificate (cross-stack ref)
AuthStack      ──┤         ▲
StorageStack   ──┼──► FrontendStack (ACM cert + SSM)
                 └── (ApiStack depends on FrontendStack)
```

Ordem de instanciação em `bin/app.ts`: Database → Auth → Storage → Frontend → Api.

Deploy CI: `cdk deploy --all -c env=prod` (`cdk-deploy-prod.yml`) — dependências CDK definem a ordem; não é necessário deploy manual por stack.

## Contexto de ambiente

```bash
cdk deploy --all -c env=dev
cdk deploy --all -c env=prod
```

Configuração centralizada em `lib/config/` (`getConfig(env)`).

## Mensagens de erro (código e CI)

Specs, docs e comentários podem permanecer em português. **Mensagens de erro operacionais** devem ser **sempre em inglês**:

| Escopo | Exemplos | Idioma |
|--------|----------|--------|
| `throw new Error(...)` em CDK/scripts | contexto CDK ausente, env inválido | **English** |
| Annotations `::error::` em GitHub Actions | variável AWS ausente | **English** |
| Logs de operador / stack traces / CI | synth, bootstrap, deploy | **English** |

Exemplos:

```typescript
throw new Error('Required context: pass -c env=dev or -c env=prod');
throw new Error(`Invalid env: ${env}. Expected 'dev' or 'prod'.`);
```

```yaml
echo "::error::AWS_ROLE_ARN is empty in GitHub Environment 'prod'."
```

> Mensagens **voltadas ao usuário final** da API (`ApiError.message`) seguem pt-BR — ver [backend task 01](../../backend/tasks/01-convencoes-globais.md).

| Parâmetro | dev | prod | Origem |
|-----------|-----|------|--------|
| `env` | `dev` | `prod` | contexto CDK `-c env=` |
| `account` | `083171867610` | `083171867610` | `lib/config/{env}.ts` |
| `region` | `us-east-1` | `us-east-1` | `lib/config/{env}.ts` |
| `domainName` | *(opcional)* | `afroo90s.com.br` | `lib/config/prod.ts` — task 21 |
| `apiSubdomain` | *(opcional)* | `api` | `lib/config/prod.ts` — task 21 |
| `hostedZoneId` | *(opcional)* | Route 53 zone ID | `lib/config/prod.ts` — substituir `REPLACE_WITH_HOSTED_ZONE_ID` antes do deploy |
| `adminEmail` | *(preencher)* | *(preencher)* | `lib/config/{env}.ts` — SES (fase 4) |
| `devAccess` | — | — | GitHub Secrets (`dev` env) no CI; `lib/config/dev.access.local.json` local (gitignored, task 22) |
| CORS origin (prod) | URL CloudFront dev | `https://afroo90s.com.br` | ApiStack + Lambda `CLOUDFRONT_WEB_URL` (task 21) |

## Tags obrigatórias

Aplicadas globalmente via `TaggingAspect` (`lib/constructs/tagging-aspect.ts`) em `bin/app.ts` **após** instanciar as stacks:

```typescript
cdk.Aspects.of(app).add(new TaggingAspect(config.env));
```

Tags em todo recurso CDK:

```typescript
{
  project: 'afro90s',
  env: 'dev',           // ou prod
  'managed-by': 'afro90sInfra',
}
```

Convenção de nomes físicos: ver [resources.md](resources.md).

## Comandos

| Comando | Uso |
|---------|-----|
| `npm run build` | Compila TypeScript |
| `cdk synth -c env=dev` | Gera CloudFormation |
| `cdk diff -c env=dev` | Preview de mudanças |
| `cdk deploy --all -c env=dev` | Deploy completo |
| `cdk destroy -c env=dev` | Remove recursos (cuidado em prod) |

## CI/CD

Workflows em `.github/workflows/`:

| Workflow | Arquivo | Trigger |
|----------|---------|---------|
| Validate | `cdk-validate.yml` | PR em `infra/**` |
| Deploy dev | `cdk-deploy-dev.yml` | Push `dev` |
| Deploy prod | `cdk-deploy-prod.yml` | Push `main` |

Guia de configuração GitHub: [github-pipeline-setup.md](../../foundation/github-pipeline-setup.md)

## Referências

- [ADR-003](../../foundation/adr/003-cdk-iac.md)
- [Recursos AWS](resources.md)
- [Outputs](outputs.md)
