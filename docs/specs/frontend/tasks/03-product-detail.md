# Task 03 — Detalhe do produto (`/produto/:id`)

**Status:** pendente  
**Arquivos alvo:** [`ui-ux.md`](../ui-ux.md); [`integration.md`](../integration.md) — `GET /products/{id}`

## Objetivo

Refinar página de detalhe: galeria de fotos, informações e adicionar ao carrinho.

## Decisões a tomar

- [ ] Galeria: carrossel vs imagem única + thumbnails
- [ ] URLs de `photos[]`: prefixar com `VITE_ASSETS_CDN_URL` se relativo?
- [ ] Quantidade no carrinho: seletor 1..N limitado ao `product.quantity`?
- [ ] Botão "Comprar" desabilitado se esgotado
- [ ] SEO v1: `document.title` = nome do produto?

## Checklist de refinamento

- [ ] `GET /products/{id}` com React Query `['product', id]`
- [ ] Skeleton de detalhe em `ui-ux.md`
- [ ] `alt` em imagens = `product.name`
- [ ] Link "Voltar ao catálogo"

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `ui-ux.md` e `integration.md`
- [ ] Marcar **Status** como `concluída`
