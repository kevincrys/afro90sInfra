# Task 06 — Cliente API e React Query

**Status:** pendente  
**Arquivos alvo:** [`integration.md`](../integration.md); [`overview.md`](../overview.md)

## Objetivo

Fechar camada de integração HTTP: cliente tipado, tratamento de erros, React Query e paginação.

## Decisões a tomar

- [ ] Wrapper único `apiClient` com métodos get/post/put/patch/delete
- [ ] Erros da API: classe `ApiError` com `code` e `message`
- [ ] `QueryClient` defaults: `staleTime`, `retry` para listagens
- [ ] Invalidação de cache após mutações admin
- [ ] `encodeURIComponent` em `cursor` nas query strings
- [ ] Tipos importados de pacote compartilhado vs duplicados em `types/` (v1: local)

## Checklist de refinamento

- [ ] Módulos `api/products.ts`, `api/orders.ts`, `api/admin/*.ts`
- [ ] Tabela de query keys em `integration.md`
- [ ] Interceptor de `Authorization` para rotas admin
- [ ] Exemplo de hook `useProducts({ name, cursor })`

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `integration.md` e `overview.md` (estrutura `api/`)
- [ ] Marcar **Status** como `concluída`
