# Task 09 — SES (e-mail de pedidos)

**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md) — SES; [`outputs.md`](../outputs.md); task [14-email-ses.md](../../backend/tasks/14-email-ses.md)

## Objetivo

Fechar identidade SES, template de notificação e parâmetros para Lambda `POST /orders`.

## Decisões a tomar

- [ ] Dev: sandbox SES com e-mails verificados vs production com domínio
- [ ] Identidade: domínio `afro90s.com.br` vs e-mail individual
- [ ] Template: SES template gerenciado vs string na Lambda
- [ ] Variáveis: `orderId`, `customerName`, `fullPrice`, `itemsSummary` — completar lista
- [ ] `SesFromEmail` e `AdminNotificationEmail` via SSM Parameter Store
- [ ] Permissão IAM: `ses:SendEmail` / `ses:SendTemplatedEmail` escopo mínimo

## Checklist de refinamento

- [ ] Documentar setup manual pré-deploy (verificar domínio/e-mail)
- [ ] Outputs `SesFromEmail`, `AdminNotificationEmail`
- [ ] Cross-link backend task 14 (falha SES após gravar pedido)
- [ ] DKIM/SPF se usar domínio customizado

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `resources.md` e `outputs.md`
- [ ] Marcar **Status** como `concluída`
