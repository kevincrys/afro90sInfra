# Task 08 — Cognito (admin)

**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md) — Cognito; [`outputs.md`](../outputs.md); [`cdk.md`](../cdk.md) — `AuthStack`

## Objetivo

Fechar User Pool para administradores e integração com API Gateway / frontend admin.

## Decisões a tomar

- [ ] `selfSignUpEnabled: false` — confirmar
- [ ] Grupo `admins` obrigatório para rotas `/admin/*`?
- [ ] App client: sem secret (SPA) — confirmar
- [ ] Fluxo de login: USER_PASSWORD_AUTH vs SRP no frontend
- [ ] Criação de usuários admin: console AWS vs script CLI vs invitation
- [ ] Política de senha mínima
- [ ] MFA na v1? (recomendado: fora de escopo v1)

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
