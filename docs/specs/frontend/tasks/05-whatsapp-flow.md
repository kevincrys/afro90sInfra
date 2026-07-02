# Task 05 — Fluxo WhatsApp pós-pedido

**Status:** pendente  
**Arquivos alvo:** [`integration.md`](../integration.md); [ADR-006](../../../foundation/adr/006-whatsapp-integration.md)

## Objetivo

Fechar UX após `POST /orders` com sucesso: confirmação na tela e abertura do WhatsApp.

## Decisões a tomar

- [ ] Abrir `wa.me` automaticamente em nova aba ou só botão "Continuar no WhatsApp"?
Continuar no WhatsApp automaticamente em nova aba ao clicar em finalizar
- [ ] Template da mensagem: incluir lista de itens ou só resumo?
Só resumo, 
- [ ] `VITE_WHATSAPP_NUMBER`: validar formato (DDI + DDD + número)
sim
- [ ] Tela de confirmação: exibir `orderId` para o cliente anotar 
ira ser enviado para a mensagem do WhasApp
- [ ] Mobile: deep link `whatsapp://` vs `https://wa.me`
 deep link `whatsapp://`

## Checklist de refinamento

- [ ] Função `openWhatsAppOrder(order)` documentada com texto final
- [ ] Fluxo em `integration.md` atualizado passo a passo
- [ ] Fallback se popup bloqueado (link clicável)
- [ ] Fora de escopo v1: WhatsApp Business API no backend

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `integration.md`
- [ ] Marcar **Status** como `concluída`
