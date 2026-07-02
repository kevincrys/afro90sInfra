# Task 10 — IAM e segurança

**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md), [`overview.md`](../overview.md)

## Objetivo

Implementar roles IAM de execução Lambda com least privilege e políticas de segurança transversais.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Roles | Compartilhada por domínio funcional (público / admin) |
| DynamoDB | Permissão por tabela + índice específico |
| S3 assets | `PutObject`/`DeleteObject` apenas em `products/*` |
| SES | Restrito ao `From` verificado |
| CloudWatch Logs | Criação automática (CDK padrão) |
| Segredos | SSM/Secrets Manager — nenhum no código |

## O que implementar

### Role — Lambda pública (`afro90s-{env}-role-lambda-public`)

Rotas: `GET /products`, `GET /products/{id}`, `POST /orders`

- [ ] DynamoDB `products`: `dynamodb:GetItem`, `dynamodb:Query`, `dynamodb:Scan` + índices
- [ ] DynamoDB `orders`: `dynamodb:PutItem`
- [ ] SES: `ses:SendTemplatedEmail` restrito ao ARN da identidade verificada
- [ ] SSM: `ssm:GetParameter` em `/afro90s/{env}/*`
- [ ] Logs: policy automática CDK (`logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`)

### Role — Lambda admin (`afro90s-{env}-role-lambda-admin`)

Rotas: `/admin/products*`, `/admin/orders*`

- [ ] DynamoDB `products`: CRUD completo (`GetItem`, `PutItem`, `UpdateItem`, `DeleteItem`, `Query`, `Scan`) + índices
- [ ] DynamoDB `orders`: `GetItem`, `Query`, `UpdateItem` + índice `gsi-status-createdAt`
- [ ] S3 assets: `s3:PutObject`, `s3:DeleteObject` restrito ao prefixo `products/*` do bucket `afro90s-{env}-s3-assets`
- [ ] SSM: `ssm:GetParameter` em `/afro90s/{env}/*`
- [ ] Logs: policy automática CDK

### Boas práticas gerais

- [ ] Nenhuma policy `"Resource": "*"` — sempre ARN específico
- [ ] Adicionar `aws:RequestedRegion: us-east-1` em conditions onde possível
- [ ] API Gateway → Lambda: permission gerenciada automaticamente pelo CDK (`addPermission`)
- [ ] Verificar no `cdk synth` que nenhum `ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')` está nas roles de Lambda

## Pré-requisitos

- Tasks 07 (tabelas criadas — precisar dos ARNs)
- Task 05 (bucket assets — precisa do ARN)

## Critérios de conclusão

- [ ] Lambda pública consegue ler products e criar orders
- [ ] Lambda admin consegue criar/editar/excluir products e atualizar orders
- [ ] Lambda pública NÃO consegue acessar rotas admin (teste: `aws lambda invoke` com event admin)
- [ ] `resources.md` atualizado com matriz Lambda → actions → resources
- [ ] `overview.md` seção segurança atualizada
- [ ] Atualizar **Status** para `concluída`
