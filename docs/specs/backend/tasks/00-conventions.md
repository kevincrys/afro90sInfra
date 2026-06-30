# Task 00 — Convenções globais da API

**Status:** pendente  
**Arquivos alvo:** `[api-routes.md](../api-routes.md)` — seção *Convenções globais* (Base URL, headers)

## Objetivo

Fechar convenções transversais a todas as rotas: URL base, stages (`dev` / `production`), CORS, charset JSON e headers de rastreio.

## Decisões a tomar

- Região AWS padrão da API (ex.: `sa-east-1`)  
`us-east-1`
- Nome do stage no API Gateway: `dev` e `prod` ou `dev` e `production`?  
`dev` e `prod`
- CORS: apenas domínio CloudFront por ambiente ou lista fixa na spec?

 a principio dominio cloudfront por ambiente, mas deve ter como testar local

- `X-Request-Id`: gerado pela API se ausente? formato UUID v4?
  Sim e sim
- Charset e encoding: sempre UTF-8; como tratar `name` com acentos na query string?

ser insensitive nesse caso, mas não tera produtos com acento

- Versionamento de API no path (ex.: `/v1/products`) — sim ou não na v1?  
nào em nenhum caso

## Checklist de refinamento

- Documentar URL de exemplo para `dev` e `production`
- Listar headers de request/response obrigatórios vs recomendados
- Definir comportamento de CORS (preflight, `Access-Control-Allow-Headers` inclui `Authorization`?)
- Alinhar stage names com `[outputs.md](../../infra/outputs.md)` e ambientes (2 ambientes)

## Notas / rascunho



## Quando concluir

- Atualizar seção *Convenções globais* em `api-routes.md`
- Verificar consistência com `overview.md` e infra outputs
- Marcar **Status** como `concluída`

