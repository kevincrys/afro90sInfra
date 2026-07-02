# Task 08 — Cognito (admin)

**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md) — Cognito; [`outputs.md`](../outputs.md); [`cdk.md`](../cdk.md) — `AuthStack`

## Objetivo

Fechar User Pool para administradores e integração com API Gateway / frontend admin.

## Decisões a tomar

- [ ] `selfSignUpEnabled: false` — confirmar SIM
- [ ] Grupo `admins` obrigatório para rotas `/admin/*`?
sim, mas so vai ter admim
- [ ] App client: sem secret (SPA) — confirmar
sempre
- [ ] Fluxo de login: USER_PASSWORD_AUTH vs SRP no frontend
SRP no frontend
- [ ] Criação de usuários admin: console AWS vs script CLI vs invitation
console AWS
- [ ] Política de senha mínima
política padrão automátic
- [ ] MFA na v1? (recomendado: fora de escopo v1)
não

## Checklist de refinamento

- [ ] Outputs: `CognitoUserPoolId`, `CognitoClientId`, `CognitoRegion`
- [ ] Authorizer HTTP API referenciando o User Pool
- [ ] Alinhar com [backend task 13-auth-cognito.md](../../backend/tasks/13-auth-cognito.md)
- [ ] Domínio Cognito hosted UI — necessário na v1?

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `resources.md` e `outputs.md`
- [ ] Marcar **Status** como `concluída`
