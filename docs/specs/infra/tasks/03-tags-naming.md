# Task 03 — Tags e naming

**Status:** pendente  
**Arquivos alvo:** [`overview.md`](../overview.md); [`resources.md`](../resources.md) — tabela de nomes

## Objetivo

Padronizar naming `afro90s-{env}-{tipo}-{nome}` e tags obrigatórias em todos os recursos.

## Decisões a tomar

- [ ] Tags fixas: `project=afro90s`, `env`, `managed-by=afro90sInfra` — mais alguma?
a princio não
- [ ] `tipo` na convenção: `s3`, `cf`, `ddb`, `lambda`, `apigw`, `cognito` — lista fechada?
acredito que sim
- [ ] `env` em production: string `production` ou `prod` nos nomes físicos?
prod
- [ ] Exceções: recursos com limite de tamanho de nome (Lambda, etc.)
não ultrapasse o limite padrão da aws somentes
- [ ] Aplicar tags via aspect CDK global vs por construct
aspect CDK global

## Checklist de refinamento

- [ ] Tabela recurso → nome exemplo (dev e production)
- [ ] Validar consistência com `.cursor/rules/project-standards.mdc`
- [ ] Documentar recursos que não seguem prefixo (ex.: logical ID CloudFormation)

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `overview.md` e `resources.md`
- [ ] Marcar **Status** como `concluída`
