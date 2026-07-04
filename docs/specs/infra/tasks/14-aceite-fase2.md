# Task 14 — Aceite Fase 2 (Login admin)

**Fase:** 2 — Login admin  
**Status:** concluída  
**Arquivos alvo:** [`overview.md`](../overview.md)

## Objetivo

Validar que o login de admin via Cognito está funcional. As rotas `/admin/*` ainda não existem — o token apenas deve ser emitido e aceito pelo authorizer.

## Checklist de aceite

- [x] `cdk deploy --all -c env=dev` sem erros após adicionar `AuthStack`
- [x] User Pool `afro90s-dev-cognito-admins` visível no console Cognito
- [x] Usuário admin criado e adicionado ao grupo `admins`
- [x] Login funcional: obter token de acesso via Cognito (Postman ou frontend)
- [x] Token JWT decodificado contém `cognito:groups: ["admins"]`
- [x] `GET /admin/products` com token válido retorna `404` ou `501` (rota ainda não existe, mas **não** `401`)
  - Confirmar que o authorizer aceita o token (não rejeita com `401`)
- [x] Rotas públicas da fase 1 continuam funcionando (regressão)
- [x] Outputs `CognitoUserPoolId` e `CognitoClientId` disponíveis no CloudFormation

### Script `smoke-test-fase2.sh`

- [x] `infra/scripts/smoke-test-fase2.sh` — SSM Cognito + regressão API pública
- [x] Opcional: `ADMIN_ACCESS_TOKEN=<jwt> bash infra/scripts/smoke-test-fase2.sh dev`

## Pré-requisitos

- [Task 13](13-cognito.md) concluída

## Critérios de conclusão

- [x] Todos os itens do checklist marcados
- [x] `overview.md` atualizado com status da fase 2
- [x] **Status** concluída — **fase 2 entregue**
