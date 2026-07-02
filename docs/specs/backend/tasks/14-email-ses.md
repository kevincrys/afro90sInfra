# Task 14 — E-mail SES (novo pedido)

**Status:** pendente  
**Arquivos alvo:** `[overview.md](../overview.md)`; `[api-routes.md](../api-routes.md)` — efeitos colaterais de `POST /orders`; `[outputs.md](../../infra/outputs.md)`

## Objetivo

Especificar notificação por e-mail quando um pedido é criado.

## Decisões a tomar

- Destinatário: `ADMIN_EMAIL` fixo por ambiente (SSM)? sim
- Remetente: `SES_FROM_EMAIL` verificado no domínio sim
- Assunto do e-mail (template): ex. `[Afro90s] Novo pedido #{id} nesse primeiro momento seria [Afro90s] Pedido em preparação`
- Corpo: texto plano, HTML ou ambos? HTML
- Variáveis do template: `orderId`, `customerName`, `customerTel`, `fullPrice`, `itemsSummary no template somente seria o orderId e customerName`
- Falha SES após `PutItem` no DynamoDB: `201` + log ou rollback? (recomendado: `201`) 201 + log
- Retry SES na v1 ou apenas log em CloudWatch? log

## Checklist de refinamento

- Documentar template mínimo (exemplo em overview ou anexo na task)
- Cross-link com task 08 (`POST /orders`)
- Variáveis de ambiente `SES_FROM_EMAIL`, `ADMIN_EMAIL`
- Fora de escopo v1: e-mail ao cliente

## Notas / rascunho

## Quando concluir

- Atualizar `overview.md` (serviço email + regra de falha)
- Atualizar nota de efeito colateral em `POST /orders` em `api-routes.md`
- Marcar **Status** como `concluída`

