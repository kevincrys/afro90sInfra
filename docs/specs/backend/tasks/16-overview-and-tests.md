# Task 16 — Overview, handlers e testes v1

**Status:** pendente  
**Arquivos alvo:** `[overview.md](../overview.md)`; todas as tasks concluídas

## Objetivo

Consolidar mapeamento handlers ↔ rotas, critérios de aceite da API v1 e casos de teste mínimos.

## Decisões a tomar

- Um Lambda por domínio (4 functions) vs Lambda monolítico com router — confirmar estrutura em overview  
Lambda monolítico com router
- Framework HTTP na Lambda: raw API GW event vs Middy vs Hono  
 Middy 
- Cobertura mínima de testes antes de deploy `dev 80%`
- Contract tests: OpenAPI gerado a partir da spec ou só markdown manual na v1? OpenAPI 

## Checklist de refinamento

- Tabela handler → rotas (products-public, orders-public, products-admin, orders-admin)
- Lista de testes unitários por service (product, order, image, email, pagination)
- Lista de testes de integração (DynamoDB Local) por rota crítica
- Critérios de aceite v1 (checklist deployável):
  - 3 rotas públicas funcionando
  - 8 rotas admin com Cognito
  - Paginação em 3 listagens
  - Upload imagem (pelo menos um modo: url ou base64)
  - POST order + SES (ou mock)

## Notas / rascunho



## Quando concluir

- Atualizar `overview.md` (handlers, testes, aceite)
- Revisar `[tasks/README.md](README.md)` — marcar tasks dependentes como concluídas
- Marcar **Status** como `concluída`

