# Task 02 — Configuração e deploy CDK

**Status:** pendente  
**Arquivos alvo:** [`cdk.md`](../cdk.md) — contexto, comandos, CI/CD alvo

## Objetivo

Fechar configuração por ambiente, bootstrap AWS e fluxo de deploy local/CI.

## Decisões a tomar

- [ ] Arquivo de config: `lib/config/dev.ts` + `production.ts` vs único com mapa
`lib/config/dev.ts` + `production.ts`
- [ ] Parâmetros por env: `domainName`, `corsAllowedOrigins`, `adminEmail` — lista completa
domainName, adminEmail e qualquer parametro externo que não seja obtido por importValue
- [ ] Bootstrap CDK: uma vez por conta/região — documentar comando
Uma vez por conta 
- [ ] `cdk deploy --all` vs deploy stack a stack no CI
deploy stack a stack no CI com opção de all
- [ ] Política de destroy em `dev` (permitido?) vs `production` (bloqueado)
permitido em qualquer 
## Checklist de refinamento

- [ ] Tabela de parâmetros `lib/config/{env}.ts`
- [ ] Comandos npm scripts sugeridos (`build`, `synth`, `diff`, `deploy:dev`)
- [ ] Pré-requisitos: Node version, AWS CLI profile, credenciais CI (OIDC?)
- [ ] Alinhar com task [13-cicd.md](13-cicd.md)

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `cdk.md`
- [ ] Marcar **Status** como `concluída`
