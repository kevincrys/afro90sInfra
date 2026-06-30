# Tasks — Refinamento das specs de frontend

Backlog de tarefas pequenas para refinar [`overview.md`](../overview.md), [`ui-ux.md`](../ui-ux.md) e [`integration.md`](../integration.md).

Os specs principais permanecem em **três arquivos únicos**. Cada task concluída deve resultar em edições pontuais nos specs alvo.

Repo de implementação futuro: **`afro90s-web`**.

## Legenda de status

| Status | Significado |
|--------|-------------|
| `pendente` | Ainda não revisada |
| `em revisão` | Decisões em andamento |
| `concluída` | Specs alvo atualizadas |

Atualize o campo **Status** no topo de cada arquivo de task.

## Índice

### Fundação

| Task | Arquivo | Foco |
|------|---------|------|
| 00 | [00-project-stack.md](00-project-stack.md) | React, Vite, TypeScript, estrutura do repo |
| 01 | [01-routing-layout.md](01-routing-layout.md) | Rotas, layout, navegação |

### Loja pública

| Task | Arquivo | Foco |
|------|---------|------|
| 02 | [02-catalog-page.md](02-catalog-page.md) | Catálogo, busca, paginação |
| 03 | [03-product-detail.md](03-product-detail.md) | Detalhe do produto, carrinho |
| 04 | [04-cart-checkout.md](04-cart-checkout.md) | Carrinho e formulário de pedido |
| 05 | [05-whatsapp-flow.md](05-whatsapp-flow.md) | Pós-pedido e link wa.me |

### Integração API

| Task | Arquivo | Foco |
|------|---------|------|
| 06 | [06-api-client-query.md](06-api-client-query.md) | Cliente HTTP, React Query, tipos |

### Admin

| Task | Arquivo | Foco |
|------|---------|------|
| 07 | [07-admin-auth.md](07-admin-auth.md) | Login Cognito, rotas protegidas |
| 08 | [08-admin-products.md](08-admin-products.md) | CRUD produtos, upload de imagens |
| 09 | [09-admin-orders.md](09-admin-orders.md) | Listagem e status de pedidos |

### UI/UX e entrega

| Task | Arquivo | Foco |
|------|---------|------|
| 10 | [10-theme-visual.md](10-theme-visual.md) | Temática anos 90, responsividade |
| 11 | [11-states-a11y.md](11-states-a11y.md) | Loading, empty, error, acessibilidade |
| 12 | [12-env-deploy.md](12-env-deploy.md) | Variáveis VITE, build, deploy S3 |
| 13 | [13-acceptance-v1.md](13-acceptance-v1.md) | Critérios de aceite e testes v1 |

## Ordem sugerida

**Trilha mínima (loja pública):** `00 → 01 → 06 → 02 → 03 → 04 → 05`

**Trilha UI:** `10 → 11` (em paralelo com páginas)

**Trilha admin:** `07 → 08 → 09`

**Antes do primeiro deploy:** `12 → 13`

**Cross-links:**

- API: [backend/api-routes.md](../../backend/api-routes.md) e [backend/tasks/](../../backend/tasks/)
- Infra: [infra/outputs.md](../../infra/outputs.md) e [infra/tasks/04-frontend-hosting.md](../../infra/tasks/04-frontend-hosting.md)

## Como usar

1. Abra uma task e preencha **Decisões a tomar** e **Notas / rascunho**.
2. Marque **Status** como `em revisão` enquanto discute.
3. Ao fechar decisões, edite as seções referenciadas em `overview.md`, `ui-ux.md` ou `integration.md`.
4. Marque checklists em **Quando concluir** e mude **Status** para `concluída`.

## Template

```markdown
# Task NN — Título
**Status:** pendente
**Arquivos alvo:** ...

## Objetivo
## Decisões a tomar
## Checklist de refinamento
## Notas / rascunho
## Quando concluir
```
