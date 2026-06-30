# Task 04 — Carrinho e checkout (`/checkout`)

**Status:** pendente  
**Arquivos alvo:** [`ui-ux.md`](../ui-ux.md) — Carrinho; [`integration.md`](../integration.md) — `POST /orders`

## Objetivo

Fechar carrinho local e fluxo de checkout com formulário do cliente.

## Decisões a tomar

- [ ] Carrinho: Context vs Zustand; persistir em `localStorage`?
- [ ] Página `/checkout` acessível só com itens no carrinho (redirect se vazio)
- [ ] Campos `customer`: name, address, postalCode, tel — máscaras CEP/tel?
- [ ] Validação client-side antes de `POST /orders` (Zod?)
- [ ] Exibir resumo: itens, subtotal, total (somente leitura — total vem da API na resposta)
- [ ] Botão submit: loading state durante POST

## Checklist de refinamento

- [ ] Body `POST /orders` alinhado a [api-routes.md](../../backend/api-routes.md)
- [ ] Tratamento de erros `INSUFFICIENT_STOCK`, `VALIDATION_ERROR`
- [ ] Limpar carrinho apenas após `201`
- [ ] Cross-link task [05-whatsapp-flow.md](05-whatsapp-flow.md)

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `ui-ux.md` e `integration.md`
- [ ] Marcar **Status** como `concluída`
