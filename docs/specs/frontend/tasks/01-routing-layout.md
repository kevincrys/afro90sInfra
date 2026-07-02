# Task 01 — Roteamento e layout

**Status:** pendente  
**Arquivos alvo:** [`overview.md`](../overview.md) — Páginas v1; [`ui-ux.md`](../ui-ux.md)

## Objetivo

Fechar rotas React Router, layout compartilhado (header, footer) e separação público vs admin.

## Decisões a tomar

- [ ] Rotas exatas: `/` vs `/catalogo`; `/produto/:id` vs `/products/:id`
Sim
- [ ] Layout único ou `PublicLayout` + `AdminLayout`
Layout único para facilitar
- [ ] Header: logo, carrinho (badge quantidade), link admin discreto?
logo, carrinho, barra de busca e categorys, no menu admin só logo e logoy
- [ ] Rotas admin em `/admin/*` com `Outlet` protegido
sim
- [ ] 404 customizada com tema anos 90
sim
- [ ] Scroll to top em mudança de rota
Sim
## Checklist de refinamento

- [ ] Tabela rota → componente → auth em `overview.md`
- [ ] `Navigate` para login em rotas admin sem token
- [ ] Breadcrumbs na v1 ou v2?

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `overview.md`
- [ ] Marcar **Status** como `concluída`
