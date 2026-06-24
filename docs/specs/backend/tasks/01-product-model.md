# Task 01 — Modelo Product

**Status:** pendente  
**Arquivos alvo:** [`data-models.md`](../data-models.md) — `Product`, `Category`; [`api-routes.md`](../api-routes.md) — bodies/responses que expõem `Product`

## Objetivo

Fechar schema de produto: tipos, limites de validação e representação de `price` e `quantity`.

## Decisões a tomar

- [ ] `price`: decimal BRL (`49.90`) vs inteiro em centavos (`4990`) — recomendado: decimal com 2 casas
- [ ] Arredondamento de `price` em cálculos de pedido (banker's rounding vs half-up)
- [ ] `name`: tamanho mínimo/máximo (ex.: 2–120 caracteres)
- [ ] `quantity`: máximo por produto (ex.: 99999) e default na criação
- [ ] Produto com `quantity = 0`: visível no catálogo público? (ver tasks 06 e 07)
- [ ] `category`: aceitar apenas lowercase; rejeitar sinônimos (`óculos` vs `oculos`)
- [ ] Campos somente leitura na resposta: `id`, `createdAt`, `updatedAt` — gerados sempre no servidor

## Checklist de refinamento

- [ ] Documentar regras Zod sugeridas (comentário ou tabela em `data-models.md`)
- [ ] Definir se `photos` pode ser array vazio na criação
- [ ] Alinhar `Category` enum com query param `category` nas rotas GET
- [ ] Documentar atributo derivado `nameLower` (persistência DynamoDB — task 15)

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `Product` e `Category` em `data-models.md`
- [ ] Ajustar exemplos JSON em `api-routes.md` se formato de `price` mudar
- [ ] Marcar **Status** como `concluída`
