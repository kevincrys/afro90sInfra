# Task 04 — Paginação (cursor opaco)

**Status:** pendente  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md) — seção *Paginação (cursor opaco)*; [`data-models.md`](../data-models.md) — `PaginatedResponse`

## Objetivo

Fechar implementação e contrato do cursor: encoding, schema interno, validação de filtros e erros.

## Decisões a tomar

- [ ] Encoding: **Base64URL** (recomendado para query string) vs Base64 padrão
- [ ] Versão do payload interno: fixar `v: 1` e política de breaking change
- [ ] TTL do cursor: sem expiração na v1 ou expirar após N horas?
- [ ] Hash de filtros no payload: algoritmo (ex.: SHA256 dos query params normalizados)
- [ ] `nextCursor` pode ser `null` ou apenas omitido na última página? (hoje: ambos mencionados)
- [ ] Listagem sem `name` em produtos: Scan ou Query em índice auxiliar? (impacta payload do cursor — ver task 15)

## Checklist de refinamento

- [ ] Fixar formato exato do payload interno (`v`, `index`, `key`, `filters`)
- [ ] Documentar exemplos de cursor decodificado só para implementadores (comentário ou appendix)
- [ ] Confirmar regra: filtros alterados + cursor antigo → `400 INVALID_CURSOR`
- [ ] Alinhar `limit` default (20) e max (100) em todas as rotas de listagem

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar seção *Paginação* em `api-routes.md`
- [ ] Atualizar nota em `PaginatedResponse` em `data-models.md` se necessário
- [ ] Marcar **Status** como `concluída`
