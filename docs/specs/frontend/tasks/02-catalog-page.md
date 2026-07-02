# Task 02 — Página de catálogo (`/`)

**Status:** pendente  
**Arquivos alvo:** [`ui-ux.md`](../ui-ux.md); [`integration.md`](../integration.md) — `GET /products`

## Objetivo

Refinar listagem pública: grid de produtos, busca por nome, paginação por cursor e skeletons.

## Decisões a tomar

- [ ] Paginação: botão "Carregar mais" vs scroll infinito
 scroll infinito
- [ ] Busca: debounce (ms)? disparo ao Enter ou em tempo real?
disparo ao enter
- [ ] Filtro por `category` na UI na v1?
sim
- [ ] Card de produto: imagem principal, nome, preço formatado BRL, badge esgotado?
ISSO
- [ ] Produtos `quantity = 0`: exibir com overlay "Esgotado" ou ocultar? (alinhar backend task 06)
Esgotado
- [ ] Formato de preço: `R$ 49,90` (pt-BR)
Sim
## Checklist de refinamento

- [ ] Integração `GET /products` com `limit`, `cursor`, `name`
- [ ] Repassar `nextCursor` sem alterar filtros (ver [backend task 04-pagination](../../backend/tasks/04-pagination-cursor.md))
- [ ] Skeleton de cards documentado em `ui-ux.md`
- [ ] Estados empty/error na listagem

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `ui-ux.md` e `integration.md`
- [ ] Marcar **Status** como `concluída`
