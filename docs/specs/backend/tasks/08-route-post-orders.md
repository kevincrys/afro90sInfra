# Task 08 — Rota `POST /orders`

**Status:** pendente  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md) — seção `POST /orders`; [`data-models.md`](../data-models.md) — `Order`; task [14-email-ses.md](14-email-ses.md)

## Objetivo

Refinar criação de pedido: validação, estoque, resposta, efeitos colaterais (DynamoDB + SES).

## Decisões a tomar

- [ ] `fullPrice` calculado no servidor (recomendado) ou aceito do cliente?
- [ ] Permitir pedido com produto `quantity = 0` no estoque? (hoje: `409 INSUFFICIENT_STOCK`)
- [ ] Se SES falhar após gravar pedido: retornar `201` mesmo assim ou `500`? (recomendado: `201` + log)
- [ ] Validar formato `tel` / `postalCode` (regex BR)?
- [ ] Limite máximo de itens por pedido
- [ ] Idempotência: header `Idempotency-Key` na v1? (recomendado: fora de escopo v1)
- [ ] Resposta `201`: `Order` completo ou subset (`id`, `status`, `fullPrice`)?

## Checklist de refinamento

- [ ] Request body final com todos os campos obrigatórios
- [ ] Fluxo: validar produtos → validar estoque → calcular preços → gravar → SES
- [ ] Status inicial sempre `SOLICITADO`
- [ ] Não decrementar estoque no POST (regra v1 — confirmar em overview)
- [ ] Tabela de erros completa (`VALIDATION_ERROR`, `PRODUCT_NOT_FOUND`, `INSUFFICIENT_STOCK`)
- [ ] Cross-link com task 14 (conteúdo do e-mail)

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar seção `POST /orders` em `api-routes.md`
- [ ] Atualizar `overview.md` regras de negócio se necessário
- [ ] Marcar **Status** como `concluída`
