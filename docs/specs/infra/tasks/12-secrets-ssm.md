# Task 12 — SSM Parameter Store

**Status:** pendente  
**Arquivos alvo:** [`outputs.md`](../outputs.md), [`overview.md`](../overview.md)

## Objetivo

Implementar todos os parâmetros SSM necessários via CDK e documentar o contrato de paths para Lambdas e CI.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Serviço | SSM Parameter Store Standard (gratuito) |
| Quem cria | CDK `StringParameter` |
| E-mails do sistema | SSM |
| WhatsApp admin | SSM |
| Rotação de secrets | Fora de escopo v1 |
| `.env` local | `.gitignore` + `.env.example` sem valores |

## O que implementar

### Parâmetros por ambiente

Criar em cada stack relevante com `new StringParameter(...)`:

| Path | Tipo | Stack que cria | Quem consome |
|------|------|----------------|--------------|
| `/afro90s/{env}/admin-email` | String | ApiStack ou SesStack | Lambda (SES destino) |
| `/afro90s/{env}/ses-from-email` | String | ApiStack ou SesStack | Lambda (SES remetente) |
| `/afro90s/{env}/whatsapp-number` | String | ApiStack | Frontend via CI |
| `/afro90s/{env}/cloudfront-web-url` | String | FrontendStack | ApiStack (CORS) |
| `/afro90s/{env}/assets-bucket-name` | String | StorageStack | ApiStack |
| `/afro90s/{env}/assets-bucket-arn` | String | StorageStack | ApiStack (IAM) |
| `/afro90s/{env}/products-table-name` | String | DatabaseStack | ApiStack |
| `/afro90s/{env}/orders-table-name` | String | DatabaseStack | ApiStack |
| `/afro90s/{env}/cognito-user-pool-id` | String | AuthStack | ApiStack (authorizer) |
| `/afro90s/{env}/cognito-client-id` | String | AuthStack | Frontend via CI |
| `/afro90s/{env}/api-base-url` | String | ApiStack | Frontend via CI |

- [ ] Todos como `parameterType: ParameterType.STRING` (Standard — gratuito)
- [ ] Valores sensíveis nulos no CDK: preencher via `cdk deploy` com `--parameters` ou setar no console antes do deploy
  - `admin-email`, `ses-from-email`, `whatsapp-number` têm placeholder inicial

### Leitura nas Lambdas

- [ ] Lambdas leem parâmetros via SDK (`GetParameter`) em tempo de execução — **não** via CDK `valueFromLookup` (que hardcodaria no template)
- [ ] Ou, preferível: CDK lê SSM na synth para injetar como env var na Lambda (elimina chamada runtime)
  - Usar `StringParameter.valueForStringParameter(this, '/afro90s/dev/...')` no CDK

### `.env.example`

- [ ] Criar `infra/.env.example` com todas as chaves sem valores:

```
AWS_PROFILE=kevincrys-admin
CDK_DEFAULT_ACCOUNT=083171867610
CDK_DEFAULT_REGION=us-east-1
```

- [ ] Confirmar que `infra/.env` está no `.gitignore`

### IAM para Lambdas

- [ ] Permissão `ssm:GetParameter` restrita ao path `/afro90s/{env}/*` nas roles da task 10

## Pré-requisitos

- Task 10 (IAM roles criadas)

## Critérios de conclusão

- [ ] Todos os parâmetros visíveis em SSM Parameter Store (`us-east-1`) para dev
- [ ] Lambda consegue ler `/afro90s/dev/products-table-name` sem erro de permissão
- [ ] `.env.example` criado e `.env` no `.gitignore`
- [ ] `outputs.md` e `overview.md` atualizados
- [ ] Atualizar **Status** para `concluída`
