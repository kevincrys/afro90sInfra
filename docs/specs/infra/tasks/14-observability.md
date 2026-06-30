# Task 14 — Observabilidade

**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md) ou [`overview.md`](../overview.md); [`architecture.md`](../../../foundation/architecture.md)

## Objetivo

Definir logging, métricas e alarmes mínimos para Lambdas e API Gateway em production.

## Decisões a tomar

- [ ] Retenção CloudWatch Logs (ex.: 14 dias dev, 30 dias production)
- [ ] Log level na Lambda: `INFO` vs `DEBUG` por ambiente
- [ ] Métricas customizadas na v1 ou só AWS/Lambda defaults?
- [ ] Alarmes production: 5xx API Gateway, Lambda errors, duration p99
- [ ] SNS ou e-mail para alarmes — destinatário admin
- [ ] X-Ray tracing na v1? (recomendado: fora de escopo v1)
- [ ] Dashboard CloudWatch único por ambiente

## Checklist de refinamento

- [ ] Log groups nomeados por Lambda
- [ ] Structured logging JSON na aplicação (contrato com backend)
- [ ] Lista mínima de alarmes para production
- [ ] Custo estimado de logs/alarmes aceitável para v1

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `resources.md` ou nova seção em `overview.md`
- [ ] Marcar **Status** como `concluída`
