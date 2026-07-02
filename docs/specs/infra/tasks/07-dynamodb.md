# Task 07 — DynamoDB

**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md) — tabelas `products` e `orders`; [`cdk.md`](../cdk.md) — `DataStack`

## Objetivo

Fechar modelagem física DynamoDB, GSIs, billing e backup — alinhado ao backend.

## Decisões a tomar

- [ ] Billing: on-demand confirmado para v1 

 Provisionado no modelo gratuito
- [ ] PITR: apenas `production` ou também `dev`?
prod somente na tabela de pedidos 
- [ ] GSI `gsi-name` (PK `nameLower`, SK `id`) — confirmar para busca por nome

sim  certifique-se de que a soma das RCUs/WCUs da tabela principal + as RCUs/WCUs do GSI não ultrapasse o limite global
- [ ] GSI `gsi-status-createdAt` (PK `status`, SK `createdAt`) — confirmar
sim,  certifique-se de que a soma das RCUs/WCUs da tabela principal + as RCUs/WCUs do GSI não ultrapasse o limite global
- [ ] Listagem pública sem `name`: Scan vs novo GSI (ex.: `gsi-createdAt`) — alinhar [backend task 15](../../backend/tasks/15-dynamodb-access.md) 
novo gsi,  certifique-se de que a soma das RCUs/WCUs da tabela principal + as RCUs/WCUs do GSI não ultrapasse o limite global
- [ ] Atributo `nameLower`: normalização (lowercase, remover acentos?)
sim, remova
- [ ] TTL em registros — v2?
v2
## Checklist de refinamento

- [ ] Schema de atributos por tabela documentado
- [ ] Nomes físicos: `afro90s-{env}-ddb-products`, `afro90s-{env}-ddb-orders`
- [ ] Export table names como outputs (task 11)
- [ ] Point-in-time recovery e deletion protection em production

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `resources.md`
- [ ] Sinalizar mudanças necessárias em backend task 15 se GSIs mudarem
- [ ] Marcar **Status** como `concluída`
