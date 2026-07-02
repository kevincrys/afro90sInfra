# Task 08 — Cognito (admin)

**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md), [`outputs.md`](../outputs.md)

## Objetivo

Implementar `AuthStack`: User Pool Cognito para administradores, integrado ao authorizer do API Gateway.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Self sign-up | Desativado (`selfSignUpEnabled: false`) |
| MFA | Não (fora do escopo v1) |
| App client secret | Sem secret (SPA) |
| Fluxo de auth | SRP (`USER_SRP_AUTH`) |
| Criação de usuários | Console AWS manualmente |
| Senha mínima | Política padrão AWS |
| Hosted UI | Não necessário na v1 |
| Grupos | Único grupo `admins` |

## O que implementar

### User Pool

- [ ] Criar `UserPool` com nome `afro90s-{env}-cognito-admins`
- [ ] `selfSignUpEnabled: false`
- [ ] `mfa: Mfa.OFF`
- [ ] `passwordPolicy`: política padrão CDK (8+ chars, maiúsc, número, símbolo)
- [ ] `removalPolicy: DESTROY` em dev; `RETAIN` em prod

### Grupo de administradores

- [ ] Criar `CfnUserPoolGroup` com nome `admins`
- [ ] Documentar no README que todo usuário admin deve ser adicionado a esse grupo após criação

### App Client

- [ ] Criar `UserPoolClient` com:
  - `generateSecret: false`
  - `authFlows: { userSrp: true }`
  - `preventUserExistenceErrors: true`

### Exports via SSM

- [ ] `/afro90s/{env}/cognito-user-pool-id`
- [ ] `/afro90s/{env}/cognito-client-id`
- [ ] `/afro90s/{env}/cognito-region` = `us-east-1`

### Outputs CloudFormation

- [ ] `CfnOutput` `CognitoUserPoolId`
- [ ] `CfnOutput` `CognitoClientId`
- [ ] `CfnOutput` `CognitoRegion`

### Pós-deploy — criação de usuário admin (manual)

Documentar os passos no `resources.md`:

```
1. Console AWS → Cognito → User pools → afro90s-{env}-cognito-admins
2. Users → Create user
3. Preencher email e senha temporária
4. Groups → Adicionar usuário ao grupo "admins"
```

## Pré-requisitos

- Tasks 01, 02, 03 concluídas

## Critérios de conclusão

- [ ] User Pool criado sem erro
- [ ] App client sem secret e com SRP habilitado
- [ ] Grupo `admins` existente
- [ ] Outputs `CognitoUserPoolId`, `CognitoClientId`, `CognitoRegion` no CloudFormation
- [ ] Login de usuário admin funcional via frontend (task 15)
- [ ] `resources.md` e `outputs.md` atualizados
- [ ] Atualizar **Status** para `concluída`
