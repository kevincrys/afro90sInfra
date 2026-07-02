# Task 08 — Admin — CRUD de produtos

**Status:** pendente  
**Arquivos alvo:** [`ui-ux.md`](../ui-ux.md) — upload; [`integration.md`](../integration.md) — rotas admin products

## Objetivo

Fechar painel de produtos: listagem, criar, editar, excluir e upload de imagens.

## Decisões a tomar

- [ ] UI: tabela vs cards no admin
CArds
- [ ] Formulário create/edit: mesma página ou modal/drawer
Modal
- [ ] Upload padrão: multipart (stream) vs base64 no JSON
multipart
- [ ] Preview de imagens antes de salvar; reordenar fotos na v1?
Sim, Sim
- [ ] Confirmação antes de `DELETE`
Sim
- [ ] Ajuste de estoque: na mesma tela ou ação separada (`PATCH .../stock`)?
Mesma tela
## Checklist de refinamento

- [ ] Consumir todas as rotas `/admin/products*`
- [ ] Modos A e B de upload conforme [api-routes.md](../../backend/api-routes.md)
- [ ] Cross-link [backend task 03-photo-upload](../../backend/tasks/03-photo-upload.md)
- [ ] Skeleton admin produtos em `ui-ux.md`

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `ui-ux.md` e `integration.md`
- [ ] Marcar **Status** como `concluída`
