# Task 11 — Outputs e variáveis de ambiente

**Status:** pendente  
**Arquivos alvo:** [`outputs.md`](../outputs.md), [`cdk.md`](../cdk.md)

## Objetivo

Garantir que todos os `CfnOutput` estejam definidos por stack e gerar arquivo de outputs pós-deploy para consumo pelos repos `afro90s-api` e `afro90s-web`.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Cross-stack | SSM Parameters (não `Fn.importValue`) |
| `ApiBaseUrl` | Sem stage, sem barra final |
| Secrets em outputs | Nenhum — outputs são valores não sensíveis |
| Consumo pelos apps | Arquivo gerado por script CI pós-deploy |

## O que implementar

### CfnOutputs por stack

Verificar que cada stack exporta seus outputs:

| Stack | Output | Descrição |
|-------|--------|-----------|
| FrontendStack | `CloudFrontWebUrl` | URL CDN frontend |
| StorageStack | `AssetsBucketName` | Nome bucket imagens |
| StorageStack | `AssetsCdnUrl` | Base URL CDN assets |
| ApiStack | `ApiBaseUrl` | URL base API Gateway |
| DatabaseStack | `ProductsTableName` | Nome tabela products |
| DatabaseStack | `OrdersTableName` | Nome tabela orders |
| AuthStack | `CognitoUserPoolId` | ID User Pool |
| AuthStack | `CognitoClientId` | ID App Client |
| AuthStack | `CognitoRegion` | `us-east-1` |

- [ ] Todos com `exportName` definido e estável (não mudar entre deploys)
- [ ] Nenhum output contém valores sensíveis (senhas, secrets, tokens)
- [ ] URLs sem barra final em todos os outputs

### Script de geração do arquivo de outputs

- [ ] Criar `infra/scripts/export-outputs.sh`:

```bash
#!/bin/bash
ENV=${1:-dev}
aws cloudformation describe-stacks \
  --region us-east-1 \
  --query "Stacks[?contains(StackName, 'afro90s-${ENV}')].Outputs[]" \
  --output json > infra/outputs-${ENV}.json
echo "Outputs salvos em infra/outputs-${ENV}.json"
```

- [ ] `outputs-dev.json` e `outputs-prod.json` adicionados ao `.gitignore`
- [ ] Script chamado no CI após `cdk deploy` (task 13)

### Injeção de variáveis na Lambda (CDK)

- [ ] Confirmar que `ApiStack` injeta via `environment` no construct Lambda:
  - `PRODUCTS_TABLE`, `ORDERS_TABLE`, `ASSETS_BUCKET`, `ASSETS_CDN_URL`
  - `SES_FROM_EMAIL`, `ADMIN_EMAIL`, `AWS_REGION`

## Pré-requisitos

- Todas as stacks de recursos (04–10) concluídas

## Critérios de conclusão

- [ ] `aws cloudformation describe-stacks` retorna todos os outputs listados acima
- [ ] Script `export-outputs.sh` gera JSON válido
- [ ] `outputs.md` com tabela completa atualizada
- [ ] `cdk.md` com documentação de exports cross-stack via SSM
- [ ] Atualizar **Status** para `concluída`
