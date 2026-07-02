# Task 14 — Observabilidade

**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md), [`overview.md`](../overview.md)

## Objetivo

Configurar logging estruturado, retenção de logs e dashboard CloudWatch dentro do free tier.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Retenção de logs | 14 dias (dev e prod) |
| Log level | `INFO` em todos os ambientes |
| Métricas | Defaults AWS/Lambda (sem customizadas) |
| Alarmes | Sem alarmes na v1 |
| X-Ray | Fora de escopo v1 |
| Dashboard | Um por ambiente, dentro do free tier |

## O que implementar

### CloudWatch Log Groups

- [ ] Criar `LogGroup` explícito para a Lambda `afro90s-{env}-lambda-api`:
  - Nome: `/aws/lambda/afro90s-{env}-lambda-api`
  - `retention: RetentionDays.TWO_WEEKS` (14 dias)
  - `removalPolicy: DESTROY` em dev

> Free tier CloudWatch Logs: 5 GB ingestão/mês + 5 GB armazenamento. Para a v1 está bem dentro do limite.

### Logging estruturado (contrato com backend)

- [ ] Documentar no `resources.md` o formato JSON esperado:

```json
{
  "level": "INFO",
  "requestId": "...",
  "route": "GET /products",
  "durationMs": 45,
  "message": "..."
}
```

- [ ] Lambda deve emitir logs nesse formato (backend implementa — documentar aqui como contrato)

### Dashboard CloudWatch

- [ ] Criar `Dashboard` CDK com nome `afro90s-{env}-dashboard`:
  - Widget: Lambda Invocations (count)
  - Widget: Lambda Errors (count)
  - Widget: Lambda Duration P50/P99
  - Widget: API Gateway 4xx / 5xx count
- [ ] Usar apenas métricas nativas AWS (gratuitas)

> Free tier CloudWatch Dashboards: 3 dashboards com até 50 métricas são gratuitos.

### Sem alarmes na v1

- [ ] Confirmar que não há `Alarm` ou `CfnAlarm` nos stacks (custo adicional)

## Pré-requisitos

- Task 06 (Lambda criada — para criar log group)

## Critérios de conclusão

- [ ] Log group `/aws/lambda/afro90s-dev-lambda-api` visível no CloudWatch
- [ ] Retenção configurada para 14 dias
- [ ] Dashboard `afro90s-dev-dashboard` visível no CloudWatch com os 4 widgets
- [ ] Nenhum alarme CloudWatch criado
- [ ] `resources.md` atualizado com seção observabilidade
- [ ] Atualizar **Status** para `concluída`
