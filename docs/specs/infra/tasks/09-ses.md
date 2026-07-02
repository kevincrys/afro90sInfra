# Task 09 — SES (e-mail de pedidos)

**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md), [`outputs.md`](../outputs.md)

## Objetivo

Configurar identidade SES e template de notificação de pedidos consumido pela Lambda `POST /orders`.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Dev | Sandbox SES com e-mails verificados manualmente |
| Prod | Domínio `afro90s.com.br` (a verificar quando comprado) |
| Identidade | E-mail individual em dev; domínio em prod |
| Template | SES template gerenciado (não string na Lambda) |
| Variáveis do template | `orderId`, `customerName` |
| Parâmetros | `SesFromEmail` e `AdminNotificationEmail` via SSM |
| IAM | `ses:SendTemplatedEmail` escopo mínimo |

## O que implementar

### SES — identidade (setup manual pré-deploy)

> Feito no console ou via CDK `CfnEmailIdentity`. Em dev usar e-mail; em prod usar domínio.

- [ ] **dev**: verificar e-mail remetente (já feito na task 00) e e-mail destino admin no console SES sandbox
- [ ] **prod**: quando domínio for comprado, criar `CfnEmailIdentity` para o domínio + configurar registros DKIM/SPF no DNS

### SES — template CDK

- [ ] Criar `CfnTemplate` com nome `afro90s-{env}-ses-new-order`:

```typescript
new CfnTemplate(this, 'OrderTemplate', {
  template: {
    templateName: `afro90s-${env}-ses-new-order`,
    subjectPart: 'Novo pedido #{orderId}',
    htmlPart: `
      <h2>Novo pedido recebido</h2>
      <p><strong>ID:</strong> {{orderId}}</p>
      <p><strong>Cliente:</strong> {{customerName}}</p>
    `,
    textPart: 'Novo pedido {{orderId}} de {{customerName}}',
  },
});
```

- [ ] Variáveis do template: `{{orderId}}`, `{{customerName}}`

### SSM — parâmetros

- [ ] `/afro90s/{env}/ses-from-email` — e-mail remetente verificado
- [ ] `/afro90s/{env}/admin-notification-email` — e-mail destino do admin

> Criar como `StringParameter` no CDK. Preencher valor antes do deploy via `cdk deploy` ou via console.

### Outputs CloudFormation

- [ ] `CfnOutput` `SesFromEmail` (valor lido do SSM, não hardcoded)
- [ ] `CfnOutput` `AdminNotificationEmail` (idem)

## Pré-requisitos

- Task 00 (verificação de e-mail SES feita no setup)
- Task 12 (SSM parameters)
- Task 10 (IAM: `ses:SendTemplatedEmail`)

## Critérios de conclusão

- [ ] Template SES visível no console (`us-east-1` → SES → Email templates)
- [ ] Lambda `POST /orders` envia e-mail sem erro após pedido criado
- [ ] Sandbox: e-mail recebido no endereço de destino verificado
- [ ] Outputs `SesFromEmail` e `AdminNotificationEmail` no CloudFormation
- [ ] `resources.md` e `outputs.md` atualizados
- [ ] Atualizar **Status** para `concluída`
