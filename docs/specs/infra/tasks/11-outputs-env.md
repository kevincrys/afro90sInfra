# Task 11 — Outputs e variáveis de ambiente

**Status:** pendente  
**Arquivos alvo:** [`outputs.md`](../outputs.md); [`cdk.md`](../cdk.md) — exports cross-stack

## Objetivo

Fechar contrato de outputs CloudFormation e mapeamento para apps (`VITE_*` e Lambda env).

## Decisões a tomar

- [ ] Lista completa de CfnOutput por stack — algum output faltando?
Não tem como saber por agora a lista completa
- [ ] URLs sem barra final — confirmar em todos os outputs
Sim
- [ ] `ApiBaseUrl` inclui stage (`/dev`) ou base sem stage?
Sem Stage
- [ ] Export names estáveis para cross-stack (`Export`) vs SSM parameters
SSM parameters
- [ ] Outputs sensíveis: nenhum secret em CfnOutput — confirmar
Sim
- [ ] Como apps consomem: CI lê `aws cloudformation describe-stacks` vs arquivo gerado
arquivo gerado
## Checklist de refinamento

- [ ] Tabela Output → variável frontend → variável Lambda
- [ ] Exemplos realistas para `dev` e `production`
- [ ] Cross-link [`frontend/integration.md`](../../frontend/integration.md)
- [ ] Cross-link [`backend/overview.md`](../../backend/overview.md)

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `outputs.md`
- [ ] Marcar **Status** como `concluída`
