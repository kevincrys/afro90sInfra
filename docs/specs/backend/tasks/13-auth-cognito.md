# Task 13 — Autenticação Cognito (admin)

**Status:** pendente  
**Arquivos alvo:** `[api-routes.md](../api-routes.md)` — headers admin, erros `401`/`403`; `[overview.md](../overview.md)`; [ADR-005](../../../foundation/adr/005-admin-auth-v1.md)

## Objetivo

Fechar contrato de autenticação das rotas `/admin/`* com Cognito JWT.

## Decisões a tomar

- Token: apenas `access_token` ou também `id_token`? `access_token` 
- Authorizer API Gateway: validação automática vs validação na Lambda a principio automatica
- Grupo Cognito `admins` obrigatório ou qualquer usuário do pool? admin somente
- Expiração do access token e fluxo de refresh no frontend admin a cada uma hora refresh e expiração do acess token diaria 
- Claims necessários no JWT (ex.: `sub`, `cognito:groups`)  `sub`, `cognito:groups`
- Resposta `401` vs `403`: critério exato (expirado vs sem grupo) 401 sempre

## Checklist de refinamento

- Documentar header `Authorization: Bearer <access_token>` em bloco único reutilizável
- Exemplo de resposta `401` e `403` JSON
- Alinhar com `VITE_COGNITO_*` em `[outputs.md](../../infra/outputs.md)`
- Nota: rotas públicas sem auth na v1

## Notas / rascunho



## Quando concluir

- Atualizar convenções/rotas admin em `api-routes.md`
- Atualizar `overview.md` seção auth
- Marcar **Status** como `concluída`

