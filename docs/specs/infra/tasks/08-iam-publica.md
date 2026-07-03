# Task 08 — IAM role pública

**Fase:** 1 — Site público  
**Status:** concluída  
**Arquivos alvo:** [`resources.md`](../resources.md)

## Objetivo

Criar a role IAM da Lambda pública (`GET /products`, `GET /products/{id}`, `POST /orders`) com least privilege. A role admin fica para a fase 3.

> **Nota:** `POST /orders` na fase 1 cria o pedido no DynamoDB mas **não envia e-mail** (SES é fase 4). A permissão SES é adicionada na task 18.

## O que implementar

### Role `afro90s-{env}-role-lambda-public`

- [x] DynamoDB `products`:
  - `dynamodb:GetItem`, `dynamodb:Query`, `dynamodb:Scan`
  - Em índices: `dynamodb:Query` no `gsi-name` e `gsi-createdAt`
  - Resource: ARN específico da tabela + `ARN/index/*`
- [x] DynamoDB `orders`:
  - `dynamodb:PutItem`
  - Resource: ARN específico da tabela
- [x] SSM:
  - `ssm:GetParameter` restrito a `/afro90s/{env}/*`
- [x] CloudWatch Logs: gerenciado automaticamente pelo CDK (não adicionar manualmente)
- [x] **SES: nenhuma permissão nesta fase** (adicionada na task 18)

### Boas práticas

- [x] Nenhuma action com `"Resource": "*"`
- [x] Verificar no `cdk synth` que a role **não** tem `AdministratorAccess`
- [x] API Gateway → Lambda: permission criada automaticamente pelo CDK (task 10)

Implementação: `lib/constructs/lambda-public-role.ts`, instanciada em `ApiStack`.

## Pré-requisitos

- [Task 07](07-assets-storage.md) concluída

## Critérios de conclusão

- [ ] Lambda pública consegue ler products e criar orders *(validar após task 10)*
- [x] Lambda pública **não** tem permissão SES (verificar no IAM console / testes synth)
- [x] `resources.md` atualizado com a role e suas actions
- [x] Atualizar **Status** para `concluída`
