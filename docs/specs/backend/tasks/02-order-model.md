# Task 02 — Modelo Order e Customer

**Status:** pendente  
**Arquivos alvo:** [`data-models.md`](../data-models.md) — `Order`, `OrderItem`, `Customer`, transições de status; [`api-routes.md`](../api-routes.md) — `POST /orders`, rotas admin de pedidos

## Objetivo

Fechar schema de pedido e regras de cálculo/validação do checkout.

## Decisões a tomar

- [ ] `fullPrice`: calculado **somente no servidor** (recomendado) ou aceito do cliente?
- [ ] `unitPrice` em cada item: snapshot do `Product.price` no momento do pedido — confirmar
- [ ] Permitir mesmo `productId` duas vezes em `items[]` ou merge automático de quantidades?
- [ ] Limite máximo de itens distintos por pedido (ex.: 20)
- [ ] Limite máximo de `quantity` por linha (ex.: 99)
- [ ] `customer.name`: min/max caracteres
- [ ] `customer.postalCode`: regex CEP BR (`00000-000` ou só dígitos)?
- [ ] `customer.tel`: regex (10–11 dígitos BR)? aceitar máscara com parênteses?
- [ ] `customer.address`: min/max; incluir complemento em campo único ou v2?

## Checklist de refinamento

- [ ] Documentar fórmula `fullPrice = sum(item.quantity * item.unitPrice)`
- [ ] Revisar tabela de transições de status — permitir admin pular estados? (hoje: não)
- [ ] Definir se `CANCELADO` exige motivo (campo opcional v2)
- [ ] Alinhar body de `POST /orders` com campos obrigatórios finais

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar modelos em `data-models.md`
- [ ] Atualizar `POST /orders` e `PATCH .../status` em `api-routes.md`
- [ ] Marcar **Status** como `concluída`
