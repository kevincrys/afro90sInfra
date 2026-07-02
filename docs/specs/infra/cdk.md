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
│   ├── stacks/
│   │   ├── frontend-stack.ts  # S3 SPA + CloudFront
│   │   ├── assets-stack.ts    # S3 imagens de produtos + CloudFront (ou path no CF web)
│   │   ├── data-stack.ts      # DynamoDB tables
│   │   ├── auth-stack.ts      # Cognito User Pool
│   │   └── api-stack.ts       # API Gateway + Lambdas + SES permissions
│   └── constructs/            # constructs reutilizáveis (ex.: ApiRoute, Table)
├── test/                      # snapshot ou unit tests de synth
├── cdk.json
├── package.json
└── tsconfig.json
```

## Stacks e dependências

```
DataStack ──┬──► ApiStack
AuthStack  ──┘
FrontendStack (independente)
AssetsStack ──► ApiStack (Lambda precisa de PutObject no bucket)
```

Ordem de deploy sugerida: `DataStack` → `AuthStack` → `AssetsStack` → `ApiStack` → `FrontendStack`

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
