# Task 00 — Ambientes (dev / production)

**Status:** pendente  
**Arquivos alvo:** [`overview.md`](../overview.md) — seção *Ambientes*; [`cdk.md`](../cdk.md) — contexto de ambiente

## Objetivo

Fechar estratégia dos dois ambientes v1: isolamento, região AWS e nomenclatura de stages.

## Decisões a tomar

- [ ] Isolamento: mesma conta AWS com stacks separadas vs contas AWS distintas (dev / prod)
- [ ] Região padrão: `sa-east-1` (São Paulo) ou outra?
- [ ] Stage API Gateway: `dev` + `prod` ou `dev` + `production`?
- [ ] Nome do context CDK: `-c env=dev` e `-c env=production` — confirmar
- [ ] `staging` explicitamente fora de escopo até novo ADR?
- [ ] Domínios customizados na v1 ou apenas URLs CloudFront/API GW default?

## Checklist de refinamento

- [ ] Documentar matriz dev vs production (tráfego, PITR, alarmes, deploy)
- [ ] Alinhar stage names com [`api-routes.md`](../../backend/api-routes.md) (task backend 00)
- [ ] Definir se production exige aprovação manual no CI (já indicado em overview)

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `overview.md` e `cdk.md`
- [ ] Marcar **Status** como `concluída`
