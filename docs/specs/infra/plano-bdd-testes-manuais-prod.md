# Plano BDD — Testes manuais em produção (pré-lançamento)

**Status:** Aprovado  
**Última atualização:** 2026-07-07  
**Escopo:** Afro90s v1 — loja pública + painel admin  
**Ambiente:** Produção (`https://{domínio-prod}` + API prod)  
**Formato:** Gherkin (Dado / Quando / Então)  
**Prioridade:** P0 = bloqueante · P1 = alto · P2 = desejável

> Documento editável — checklist de aceite manual para go/no-go de lançamento em produção.
> Complementa os smoke tests automatizados (`smoke-test-completo.sh`) e os testes E2E Cypress (frontend).

---

## Análise prévia: SQL Injection nos campos de busca

**Conclusão:** SQL injection clássica **não é possível** neste sistema.

| Aspecto | Evidência no backend |
|---------|----------------------|
| Banco de dados | **DynamoDB** (sem SQL, sem ORM relacional) |
| Busca de pedidos (`q`) | `FilterExpression` fixa + valores em `ExpressionAttributeValues` |
| Busca de produtos (`name`) | Mesmo padrão parametrizado |
| Expressões | Templates fixos como `begins_with(#id, :qLower)` — o input do usuário **nunca** entra na string da expressão |

Implementação de referência: `afro90sBackend/libs/repositories/src/order-search.ts`.

### Risco residual (não é SQL injection, mas vale testar manualmente)

1. **NoSQL / expression injection** — mitigado pelo uso de placeholders; payloads maliciosos devem retornar lista vazia ou erro controlado (`400`), nunca `500` com stack trace.
2. **Abuso de busca (DoS leve)** — buscas sem `status` fazem `Scan` no DynamoDB; payloads longos ou buscas repetidas podem degradar performance (não vazam dados).
3. **Integridade de paginação** — `normalizeCursorFilters` não inclui `q` na validação do cursor; testar paginação da busca com cursor de outro termo (cenário de inconsistência, não de acesso indevido).
4. **XSS refletido** — se o frontend renderizar `q`/`name` sem escape na URL ou UI.

---

## Pré-requisitos do testador

- [ ] URL de produção do frontend e da API
- [ ] Conta admin válida (grupo Cognito `admins`)
- [ ] Conta Cognito **sem** grupo `admins` (ou criar usuário de teste)
- [ ] Ferramentas: navegador (DevTools), Postman/Insomnia/curl, dispositivo mobile
- [ ] Produto de teste identificável (ex.: prefixo `QA-TEST-`)
- [ ] **Regra:** marcar pedidos/produtos de teste com prefixo claro; limpar após os testes

---

## Matriz de rastreabilidade

| Épico | Rotas / área | Risco principal |
|-------|--------------|-----------------|
| SEG | API + Admin | Acesso indevido, vazamento |
| LOJA | `/`, `/products/:id` | Checkout, estoque, preço |
| AUTH | `/admin/login`, `/admin` | Bypass de autenticação |
| PROD | Tab Produtos | CRUD, upload |
| PED | Tab Pedidos | Busca, status, PII |
| INFRA | Headers, CORS, CDN | Configuração prod |

---

## Épico 1 — Segurança e injeção (P0)

### Feature: Proteção contra injeção nos campos de busca

```gherkin
Cenário: Busca de produtos com payload SQL clássico não expõe dados nem erro interno
  Dado que estou na loja pública em produção
  Quando faço GET /products?name=' OR '1'='1
    E faço GET /products?name="; DROP TABLE orders; --
    E faço GET /products?name=1' UNION SELECT * FROM users--
  Então todas as respostas retornam HTTP 200 com JSON válido
    E items é array (possivelmente vazio)
    E não há stack trace, mensagem SQL ou detalhes de infraestrutura no body
    E não aparecem pedidos ou dados de clientes na resposta

Cenário: Busca admin de pedidos com payloads maliciosos
  Dado que tenho token admin válido
  Quando faço GET /admin/orders?q=' OR 1=1--
    E GET /admin/orders?q=550e8400' UNION SELECT--
    E GET /admin/orders?q=%27%20OR%201%3D1
    E GET /admin/orders?q=#status = :status
  Então resposta é 200 com lista controlada ou 400 INVALID_QUERY
    E nunca retorna HTTP 500 com detalhes internos
    E não retorna mais pedidos do que o esperado para o termo

Cenário: Busca com string extremamente longa
  Dado token admin válido
  Quando envio GET /admin/orders?q=<string com 5000+ caracteres>
  Então API responde 200 ou 400 sem timeout prolongado (>30s)
    E frontend não trava

Cenário: Busca com caracteres especiais e Unicode
  Quando busco por "João"; "O'Brien"; "测试"; "%00"; "<script>alert(1)</script>"
  Então resultados são coerentes ou lista vazia
    E nenhum script executa na UI admin
```

**Payloads obrigatórios (copiar na URL ou Postman):**

| Campo | Payloads |
|-------|----------|
| `name` (produtos) | `' OR 1=1--`, `"; DROP TABLE--`, `<img src=x onerror=alert(1)>`, `../../../etc/passwd` |
| `q` (pedidos) | `' OR '1'='1`, `deadbeef`, UUID válido de pedido real, `mar` (nome), `550e` (id) |
| `category` | `oculos' OR '1'='1`, `admin`, `../../` |
| `limit` | `-1`, `0`, `99999`, `1e10`, `abc` |
| `cursor` | `invalid`, cursor de outra rota, cursor com filtros trocados |

---

### Feature: Bloqueio de acesso admin (P0)

```gherkin
Cenário: Rotas admin sem autenticação
  Quando chamo GET /admin/products sem Authorization
    E GET /admin/orders sem Authorization
    E POST /admin/products sem Authorization
    E PUT /admin/orders/{id} sem Authorization
  Então todas retornam HTTP 401
    E body contém code UNAUTHORIZED (quando aplicável)

Cenário: Token JWT inválido ou expirado
  Quando envio Authorization: Bearer token-invalido
    E Authorization: Bearer eyJ... (token expirado)
  Então retorno é 401 em todas as rotas /admin/*

Cenário: Usuário Cognito sem grupo admins
  Dado que fiz login com usuário sem grupo admins
  Quando acesso GET /admin/products com o access_token desse usuário
  Então retorno é 401 UNAUTHORIZED
    E reason missing_admin_group (se visível em log interno)

Cenário: Bypass via frontend (rota protegida)
  Dado que não estou autenticado
  Quando acesso diretamente https://{prod}/admin
  Então sou redirecionado para /admin/login
    E nenhuma lista de pedidos ou produtos é exibida

Cenário: Bypass via DevTools (token forjado no localStorage)
  Dado que manipulo manualmente tokens no browser
  Quando tento carregar dados admin
  Então API retorna 401 e UI não exibe dados sensíveis
```

---

### Feature: Vazamento de dados e IDOR (P0)

```gherkin
Cenário: Pedidos não são listáveis publicamente
  Quando chamo GET /orders (sem auth)
    E GET /orders/{uuid-conhecido}
  Então retorno é 404 (rota inexistente) — não 200 com dados

Cenário: Dados internos não aparecem na API pública
  Quando listo GET /products e GET /products/{id}
  Então resposta não contém customerNameLower
    E não contém dados de clientes de pedidos

Cenário: Resposta de pedido admin não expõe campo interno
  Dado pedido existente
  Quando faço GET /admin/orders/{id} com token admin
  Então JSON não contém customerNameLower
    E contém apenas customer (name, address, postalCode, tel) esperados

Cenário: Enumeração de UUIDs
  Quando tento GET /admin/orders/{uuid-aleatorio} sem auth → 401
  Quando tento com auth e UUID inexistente → 404 NOT_FOUND
    E mensagem não confirma existência de outros registros além do padrão 404
```

---

### Feature: Manipulação de preço e estoque (P0)

```gherkin
Cenário: Cliente não define preço no checkout
  Dado produto com preço R$ 89,90
  Quando envio POST /orders com body contendo unitPrice ou fullPrice forjados
  Então API ignora campos extras ou retorna 400 VALIDATION_ERROR
    E fullPrice na resposta 201 é calculado pelo servidor (89,90 × qty)

Cenário: Quantidade acima do estoque
  Dado produto com quantity = 1
  Quando POST /orders com quantity = 99
  Então retorno 409 INSUFFICIENT_STOCK

Cenário: Produto inexistente no pedido
  Quando POST /orders com productId UUID aleatório
  Então retorno 404 PRODUCT_NOT_FOUND
```

---

### Feature: CORS e headers (P1)

```gherkin
Cenário: CORS restrito à origem do site
  Quando faço OPTIONS/GET da API com Origin: https://site-malicioso.com
  Então Access-Control-Allow-Origin NÃO reflete origem arbitrária
    E browser bloqueia leitura cross-origin em teste manual

Cenário: Respostas de erro não vazam stack
  Quando provoco erro 400, 404, 401
  Então body tem code, message, requestId
    E não há file paths, nomes de tabelas DynamoDB ou variáveis de ambiente
```

---

## Épico 2 — Loja pública (P0)

### Feature: Catálogo e navegação

```gherkin
Cenário: Home carrega produtos
  Dado que acesso a home em produção
  Então produtos são exibidos com imagem, nome e preço em R$
    E não há erro de console crítico (CORS, 404 de assets)

Cenário: Filtro por categoria
  Quando seleciono categoria "óculos"
  Então apenas produtos da categoria aparecem
  Quando seleciono categoria inválida via URL (?category=hack)
  Então API retorna 400 INVALID_QUERY

Cenário: Busca por nome na loja
  Quando busco por parte do nome de um produto conhecido
  Então produto aparece nos resultados
  Quando busco termo inexistente
  Então mensagem de lista vazia (sem erro)

Cenário: Paginação "carregar mais"
  Dado catálogo com mais de 20 itens
  Quando clico em carregar mais
  Então novos itens aparecem sem duplicar os anteriores

Cenário: Deep link de produto
  Quando acesso /products/{id-válido}
  Então modal ou página de detalhe abre com dados corretos
  Quando acesso /products/{uuid-inexistente}
  Então tratamento de erro amigável (404)
```

---

### Feature: Carrinho e checkout

```gherkin
Cenário: Adicionar ao carrinho
  Quando adiciono produto ao carrinho
  Então contador do carrinho atualiza
    E valor total reflete preço × quantidade

Cenário: Produto com opções obrigatórias
  Dado produto com options ["Preto", "Dourado"]
  Quando tento finalizar sem selecionar opção
  Então validação impede envio
  Quando seleciono opção inválida via API
  Então 400 INVALID_OPTION

Cenário: Checkout com dados válidos
  Quando preencho nome (só letras), endereço, CEP 8 dígitos, telefone 10-11 dígitos
    E confirmo pedido
  Então POST /orders retorna 201
    E UI exibe confirmação com ID do pedido
    E link WhatsApp abre com mensagem contendo itens e total

Cenário: Validação de campos do cliente
  Quando nome contém números → erro de validação
  Quando CEP inválido → erro
  Quando telefone curto → erro
  Quando items vazio → erro
```

---

## Épico 3 — Autenticação admin (P0)

### Feature: Login e sessão

```gherkin
Cenário: Login com credenciais válidas
  Dado que acesso /admin/login
  Quando informo email e senha de admin
  Então sou redirecionado para /admin
    E tab Pedidos ou Produtos carrega

Cenário: Login com credenciais inválidas
  Quando informo senha errada
  Então mensagem de erro em pt-BR
    E permaneço em /admin/login

Cenário: Logout
  Quando clico em sair
  Então volto para login
    E GET /admin/products com token antigo eventualmente falha após expiração

Cenário: Sessão expirada
  Dado token expirado (aguardar ou forçar)
  Quando navego no admin
  Então redirecionamento para login sem exibir dados stale
```

---

## Épico 4 — Admin produtos (P0/P1)

### Feature: CRUD de produtos

```gherkin
Cenário: Listar produtos admin
  Dado autenticado em /admin tab Produtos
  Então lista carrega com paginação
  Quando busco por nome parcial
  Então filtro funciona

Cenário: Criar produto (JSON)
  Quando crio produto QA-TEST-{timestamp} com preço, estoque, categoria
  Então aparece em GET /products público

Cenário: Upload de imagem
  Quando crio produto com imagem JPEG < 5MB
  Então URL da foto carrega via CDN
  Quando envio arquivo > 5MB ou tipo não imagem
  Então 413 ou 400 INVALID_IMAGE

Cenário: Editar produto
  Quando altero preço e descrição
  Então mudanças refletem na loja pública

Cenário: Ajuste de estoque
  Quando uso ajuste +5 / -2
  Então quantity atualiza
  Quando delta negativo excede estoque
  Então 409 INSUFFICIENT_STOCK

Cenário: Excluir produto
  Quando excluo produto de teste
  Então some do catálogo público (404 em GET /products/{id})
```

---

## Épico 5 — Admin pedidos (P0)

### Feature: Listagem, busca e status

```gherkin
Cenário: Listar pedidos por status
  Quando filtro status SOLICITADO
  Então apenas pedidos nesse status aparecem

Cenário: Busca por UUID completo
  Dado pedido criado no checkout de teste
  Quando busco pelo UUID completo em q
  Então retorna exatamente 1 pedido

Cenário: Busca por prefixo de ID
  Quando busco primeiros 8 chars do UUID
  Então pedido aparece na lista

Cenário: Busca por nome do cliente
  Dado pedido com cliente "Maria QA Test"
  Quando busco "maria" (case insensitive)
  Então pedido aparece

Cenário: Busca com menos de 2 caracteres
  Quando q = "a"
  Então 400 "Busca deve ter ao menos 2 caracteres"

Cenário: Modo idOrName (hex sem dígitos, ex: "dead")
  Quando busco termo ambíguo conforme regra do backend
  Então resultados são união controlada ID OU nome

Cenário: Paginação com busca ativa
  Dado mais resultados que o limit
  Quando navego para página 2 mantendo mesmo q
  Então resultados continuam coerentes
  Quando troco q mas reutilizo cursor antigo
  Então 400 INVALID_CURSOR ou lista inconsistente documentada (bug conhecido do cursor/q)

Cenário: Atualização de status válida
  Dado pedido SOLICITADO
  Quando mudo para EM_ATENDIMENTO
  Então 200 e status atualizado
  Quando tento transição inválida (ex: SOLICITADO → CONCLUIDO)
  Então 400 INVALID_STATUS_TRANSITION

Cenário: Fluxo completo de status até terminal
  Quando percorro SOLICITADO → … → CONCLUIDO (ou CANCELADO)
  Então cada passo respeita máquina de estados
```

---

## Épico 6 — Integrações e e-mail (P1)

```gherkin
Cenário: Notificação de novo pedido
  Quando crio pedido em produção
  Então admin recebe e-mail SES (se SES_ENABLED=true em prod)

Cenário: WhatsApp pós-checkout
  Quando finalizo pedido
  Então wa.me abre com número VITE_WHATSAPP_NUMBER
    E mensagem contém itens, total e dados do cliente
```

---

## Épico 7 — UX, acessibilidade e responsividade (P1/P2)

```gherkin
Cenário: Mobile 375px — loja
  Quando testo em viewport mobile
  Então grid, modal, carrinho drawer usáveis sem overflow horizontal

Cenário: Mobile — admin
  Então tabs Pedidos/Produtos navegáveis
    E busca e detalhe do pedido acessíveis

Cenário: Desktop 1280px
  Então grid 4 colunas no catálogo

Cenário: Estados de loading e erro
  Então skeletons/spinners aparecem durante fetch
    E toasts de erro em falhas de rede
```

---

## Épico 8 — Regressão e smoke pós-deploy (P0)

```gherkin
Cenário: Health check mínimo pós-lançamento
  Quando executo em sequência:
    | GET /products limit=1 |
    | POST /orders (pedido teste) |
    | GET /admin/orders com token |
    | DELETE produto teste se criado |
  Então todos os passos críticos passam em < 2 min

Cenário: Assets e CDN
  Quando abro imagem de produto
  Então URL é do CDN de produção e carrega com 200

Cenário: SPA routing
  Quando recarrego /products/{id} e /admin diretamente
  Então CloudFront retorna index.html (sem 403 permanente)
```

---

## Checklist de critérios de go/no-go

| # | Critério | P | Status |
|---|----------|---|--------|
| 1 | Nenhuma rota `/admin/*` acessível sem JWT válido + grupo `admins` | P0 | ☐ |
| 2 | Payloads de injeção em busca não causam 500 nem vazamento | P0 | ☐ |
| 3 | Não existe listagem pública de pedidos | P0 | ☐ |
| 4 | Preço sempre calculado no servidor | P0 | ☐ |
| 5 | Checkout completo + pedido visível no admin | P0 | ☐ |
| 6 | Busca admin por ID, nome e UUID funciona | P0 | ☐ |
| 7 | Transições de status respeitam regras | P0 | ☐ |
| 8 | CRUD produto + imagem CDN | P0 | ☐ |
| 9 | Login/logout admin | P0 | ☐ |
| 10 | Responsivo mobile loja + admin | P1 | ☐ |
| 11 | CORS e erros sem stack trace | P1 | ☐ |
| 12 | WhatsApp e e-mail (se habilitados) | P1 | ☐ |

**Go:** todos P0 aprovados, zero falhas de segurança abertas.  
**No-go:** qualquer P0 falhou, especialmente acesso admin indevido, vazamento de PII ou injeção com erro 500.

---

## Registro de execução (template)

| ID | Cenário | Executado em | Tester | Resultado | Evidência | Bug |
|----|---------|--------------|--------|-----------|-----------|-----|
| SEG-01 | SQL payload em name | | | PASS/FAIL | screenshot | |
| SEG-02 | Admin sem token | | | | | |
| SEG-03 | Pedidos não públicos | | | | | |
| LOJA-01 | Checkout completo | | | | | |
| AUTH-01 | Login admin | | | | | |
| PROD-01 | CRUD produto | | | | | |
| PED-01 | Busca por nome/ID | | | | | |
| INFRA-01 | Smoke pós-deploy | | | | | |

---

## Observações finais

1. **SQL injection:** arquitetura DynamoDB + expressões parametrizadas tornam o vetor **improvável**; os testes manuais acima validam isso em produção e cobrem XSS, abuso de parâmetros e erros inesperados.
2. **Produção:** prefira dados com prefixo `QA-TEST`; evite deletar pedidos reais; limite testes de carga.
3. **Gap conhecido:** validação de cursor com `q` — inclua o cenário de paginação com `q` trocado para detectar inconsistência.

---

## Referências

- [api-routes.md](../backend/api-routes.md) — contrato de rotas e busca admin (`q`)
- [tasks/20-aceite-fase4.md](tasks/20-aceite-fase4.md) — smoke test automatizado
- [tasks/17-aceite-fase3.md](tasks/17-aceite-fase3.md) — aceite rotas admin
- Frontend: [tasks/17-aceite-fase4.md](../frontend/tasks/17-aceite-fase4.md)
