# Task 07 — DynamoDB

**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md)

## Objetivo

Implementar `DatabaseStack`: tabelas `products` e `orders` com GSIs, billing no free tier e backup apenas em prod.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Billing | PROVISIONED (free tier: 25 WCU + 25 RCU total) |
| PITR | Somente prod, somente tabela `orders` |
| GSI products | `gsi-name` (PK: `nameLower`, SK: `id`) |
| GSI products | `gsi-createdAt` (PK: `createdAt`) para listagem pública |
| GSI orders | `gsi-status-createdAt` (PK: `status`, SK: `createdAt`) |
| `nameLower` | lowercase + remoção de acentos |
| TTL | Fora de escopo v1 |
| Deletion protection | Prod apenas |

## O que implementar

### Capacidade (free tier)

Distribuir as 25 WCU e 25 RCU gratuitas entre tabelas e GSIs:

| Recurso | WCU | RCU |
|---------|-----|-----|
| `products` table | 3 | 5 |
| `gsi-name` | 1 | 2 |
| `gsi-createdAt` | 1 | 2 |
| `orders` table | 3 | 5 |
| `gsi-status-createdAt` | 1 | 2 |
| **Total** | **9** | **16** |

> Abaixo dos 25 gratuitos. Ajustar conforme carga real.

### Tabela `products`

- [ ] Nome: `afro90s-{env}-ddb-products`
- [ ] PK: `id` (String)
- [ ] `billingMode: BillingMode.PROVISIONED`, WCU 3, RCU 5
- [ ] `removalPolicy: DESTROY` em dev; `RETAIN` em prod
- [ ] `deletionProtection: true` em prod
- [ ] GSI `gsi-name`: PK `nameLower` (String), SK `id` (String), WCU 1, RCU 2
- [ ] GSI `gsi-createdAt`: PK `createdAt` (String), WCU 1, RCU 2
- [ ] Auto-scaling: **desativado** (para evitar cobranças além do free tier)

### Tabela `orders`

- [ ] Nome: `afro90s-{env}-ddb-orders`
- [ ] PK: `id` (String)
- [ ] `billingMode: BillingMode.PROVISIONED`, WCU 3, RCU 5
- [ ] `removalPolicy: DESTROY` em dev; `RETAIN` em prod
- [ ] `deletionProtection: true` em prod
- [ ] `pointInTimeRecovery: true` **somente em prod**
- [ ] GSI `gsi-status-createdAt`: PK `status` (String), SK `createdAt` (String), WCU 1, RCU 2

### Exports via SSM

- [ ] `/afro90s/{env}/products-table-name`
- [ ] `/afro90s/{env}/orders-table-name`

### Outputs CloudFormation

- [ ] `CfnOutput` `ProductsTableName`
- [ ] `CfnOutput` `OrdersTableName`

## Pré-requisitos

- Tasks 01, 02, 03 concluídas

## Critérios de conclusão

- [ ] Tabelas criadas no CloudFormation sem erro
- [ ] GSIs visíveis no console DynamoDB
- [ ] Total de WCU + RCU (tabelas + GSIs) ≤ 25 de cada (free tier)
- [ ] PITR ativo em prod somente para `orders`
- [ ] Outputs `ProductsTableName` e `OrdersTableName` no CloudFormation
- [ ] `resources.md` atualizado com schema de atributos
- [ ] Atualizar **Status** para `concluída`
