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
│   └── constructs/            # constructs reutilizáveis
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
DatabaseStack ──┬──► ApiStack
AuthStack      ──┤
StorageStack   ──┘
FrontendStack (independente — CORS via SSM)
```

Ordem de instanciação em `bin/app.ts`: Database → Auth → Storage → Api → Frontend.

## Contexto de ambiente

```bash
cdk deploy --all -c env=dev
cdk deploy --all -c env=prod
```

Configuração centralizada em `lib/config/` (`getConfig(env)`).

| Parâmetro | dev | prod | Origem |
|-----------|-----|------|--------|
| `env` | `dev` | `prod` | contexto CDK `-c env=` |
| `account` | `083171867610` | `083171867610` | `lib/config/{env}.ts` |
| `region` | `us-east-1` | `us-east-1` | `lib/config/{env}.ts` |
| `domainName` | *(opcional)* | *(opcional)* | `lib/config/{env}.ts` — domínio a comprar |
| `adminEmail` | *(preencher)* | *(preencher)* | `lib/config/{env}.ts` — SES (fase 4) |
| `corsAllowedOrigins` | URL CloudFront dev | URL CloudFront prod | SSM / outputs (fase 1) |

## Tags obrigatórias

Aplicar em todo recurso via `Tags.of(this).add(...)`:

```typescript
{
  project: 'afro90s',
  env: 'dev',           // ou production
  'managed-by': 'afro90sInfra',
}
```

## Comandos

| Comando | Uso |
|---------|-----|
| `npm run build` | Compila TypeScript |
| `cdk synth -c env=dev` | Gera CloudFormation |
| `cdk diff -c env=dev` | Preview de mudanças |
| `cdk deploy --all -c env=dev` | Deploy completo |
| `cdk destroy -c env=dev` | Remove recursos (cuidado em prod) |

## CI/CD (alvo)

```yaml
# .github/workflows/cdk.yml (a implementar)
# PR: npm ci → npm run build → cdk synth → cdk diff
# merge main: cdk deploy dev
# manual workflow: cdk deploy production
```

## Referências

- [ADR-003](../../foundation/adr/003-cdk-iac.md)
- [Recursos AWS](resources.md)
- [Outputs](outputs.md)
