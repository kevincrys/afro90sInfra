# Task 07 — Autenticação admin (Cognito)

**Status:** pendente  
**Arquivos alvo:** [`integration.md`](../integration.md); [`overview.md`](../overview.md) — páginas admin

## Objetivo

Fechar login admin, armazenamento de token e proteção de rotas `/admin/*`.

## Decisões a tomar

- [ ] Biblioteca: Amplify `configure` + `signIn` vs cognito-identity-js
 Amplify `configure` + `signIn`
- [ ] Armazenar token: memória vs `sessionStorage` (evitar `localStorage`?)
Cookie se possivel, se não SessionStorage
- [ ] Refresh token automático na v1?
Sim
- [ ] Página `/admin/login`: redirect para `/admin/produtos` após sucesso
para /admin/pedidos

- [ ] Logout: limpar token e cache React Query admin
Sim
- [ ] Grupo `admins` — tratar `403` com mensagem específica
Sim
## Checklist de refinamento

- [ ] Variáveis `VITE_COGNITO_*` documentadas
- [ ] Componente `ProtectedRoute` ou loader de rota
- [ ] Cross-link [infra task 08-cognito](../../infra/tasks/08-cognito.md) e [backend task 13](../../backend/tasks/13-auth-cognito.md)
- [ ] Fluxo redirect em `401`

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `integration.md` e `overview.md`
- [ ] Marcar **Status** como `concluída`
