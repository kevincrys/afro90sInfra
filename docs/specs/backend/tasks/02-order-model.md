# Task 02 — Modelo Order e Customer

**Status:** pendente  
**Arquivos alvo:** `[data-models.md](../data-models.md)` — `Order`, `OrderItem`, `Customer`, transições de status; `[api-routes.md](../api-routes.md)` — `POST /orders`, rotas admin de pedidos

## Objetivo

Fechar schema de pedido e regras de cálculo/validação do checkout.

## Decisões a tomar

- `fullPrice`: calculado **somente no servidor** (recomendado) ou aceito do cliente?
- calcular no servidor oficialmente
- `unitPrice` em cada item: snapshot do `Product.price` no momento do pedido — confirmar
- sim
- Permitir mesmo `productId` duas vezes em `items[]` ou merge automático de quantidades?
-  merge automático de quantidades?
- Limite máximo de itens distintos por pedido (ex.: 20)
- 99
- Limite máximo de `quantity` por linha (ex.: 99)
- 99
- `customer.name`: min/max caracteres
- 02-200
- `customer.postalCode`: regex CEP BR (`00000-000` ou só dígitos)?
- só digitos, mascara no frontend
- `customer.tel`: regex (10–11 dígitos BR)? aceitar máscara com parênteses?
- so digitos, mascaras no frontend
- `customer.address`: min/max; incluir complemento em campo único ou v2?
- bom pegar valores de referencia, complemento em campo unico min 2 max refencias coleetadas via conven;cão

## Checklist de refinamento

- Documentar fórmula `fullPrice = sum(item.quantity * item.unitPrice)`
- Revisar tabela de transições de status — permitir admin pular estados? (hoje: não)
- Definir se `CANCELADO` exige motivo (campo opcional v2)
- Alinhar body de `POST /orders` com campos obrigatórios finais

## Notas / rascunho



## Quando concluir

- Atualizar modelos em `data-models.md`
- Atualizar `POST /orders` e `PATCH .../status` em `api-routes.md`
- Marcar **Status** como `concluída`

