# Task 03 — Tags e naming

**Status:** pendente  
**Arquivos alvo:** [`overview.md`](../overview.md); [`resources.md`](../resources.md) — tabela de nomes

## Objetivo

Padronizar naming `afro90s-{env}-{tipo}-{nome}` e tags obrigatórias em todos os recursos.

## Decisões a tomar

- [ ] Tags fixas: `project=afro90s`, `env`, `managed-by=afro90sInfra` — mais alguma?
- [ ] `tipo` na convenção: `s3`, `cf`, `ddb`, `lambda`, `apigw`, `cognito` — lista fechada?
- [ ] `env` em production: string `production` ou `prod` nos nomes físicos?
- [ ] Exceções: recursos com limite de tamanho de nome (Lambda, etc.)
- [ ] Aplicar tags via aspect CDK global vs por construct

## Checklist de refinamento

- [ ] Tabela recurso → nome exemplo (dev e production)
- [ ] Validar consistência com `.cursor/rules/project-standards.mdc`
- [ ] Documentar recursos que não seguem prefixo (ex.: logical ID CloudFormation)

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `overview.md` e `resources.md`
- [ ] Marcar **Status** como `concluída`
