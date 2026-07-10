# Plano BDD — Testes manuais em produção (pré-lançamento)

**Status:** Aprovado  
**Última atualização:** 2026-07-09  
**Escopo:** Afro90s v1 — loja pública + painel admin  
**Ambiente:** Produção (`{FRONTEND}` + `{API}`)  
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

**Superfície pública** (`GET /products`, `POST /orders`):

1. **NoSQL / expression injection** — mitigado pelo uso de placeholders; payloads maliciosos devem retornar lista vazia ou erro controlado (`400`), nunca `500` com stack trace.
2. **Abuso de busca (DoS leve)** — payloads longos ou buscas repetidas podem degradar performance (não vazam dados).
3. **XSS refletido** — se o frontend renderizar `name`/`category` sem escape na URL ou UI.

**Admin autenticado** (épico funcional, não segurança):

4. **Integridade de paginação** — `normalizeCursorFilters` não inclui `q` na validação do cursor; testar paginação com cursor de outro termo (inconsistência funcional, não acesso indevido).
5. **Robustez de busca** — caracteres especiais e strings longas em `q` devem retornar resultado coerente ou `400`, sem `500` (ver épico 5).

---

## Pré-requisitos do testador

- [ ] Preencher tabela **Dados de teste (referência)** abaixo
- [ ] Conta admin válida: `{ADMIN_EMAIL}` (grupo Cognito `admins`)
- [ ] Conta sem admin: `{NON_ADMIN_EMAIL}` (sem grupo `admins`)
- [ ] Ferramentas: navegador (DevTools), Postman/Insomnia/curl, dispositivo mobile
- [ ] **Regra:** marcar pedidos/produtos com prefixo `QA-TEST-`; limpar após os testes

---

## Dados de teste (referência)

Preencher **uma vez** antes da execução. Nos cenários abaixo, substituir `{...}` pelos valores reais obtidos nos passos anteriores.

| Variável | Valor | Como obter |
|----------|-------|------------|
| `{FRONTEND}` | `https://afroo90s.com.br` | URL de produção |
| `{API}` | `https://api.afroo90s.com.br` | URL da API prod |
| `{ADMIN_EMAIL}` | `operador@exemplo.com` | Conta no grupo Cognito `admins` |
| `{ADMIN_PASSWORD}` | *(senha real)* | Console Cognito / gestor de senhas |
| `{NON_ADMIN_EMAIL}` | `usuario-sem-admin@exemplo.com` | Conta Cognito **sem** grupo `admins` |
| `{NON_ADMIN_PASSWORD}` | *(senha real)* | — |
| `{ADMIN_TOKEN}` | `eyJraWQiOi...` | Login admin → DevTools → Network → header `Authorization` |
| `{NON_ADMIN_TOKEN}` | `eyJraWQiOi...` | Login usuário sem grupo `admins` |
| `{TOKEN_INVALIDO}` | `invalido` | Literal fixa |
| `{TOKEN_EXPIRADO}` | JWT expirado | Reutilizar `{ADMIN_TOKEN}` após expiração (~1 h) ou forçar no Cognito |
| `{PRODUCT_ID}` | ex.: `550e8400-e29b-41d4-a716-446655440000` | `GET {API}/products?limit=1` → `items[0].id` |
| `{PRODUCT_COM_OPCOES}` | UUID de produto com `options` não vazio | `GET {API}/products?limit=20` → item com `options: ["Preto", ...]` |
| `{PRODUCT_PRECO}` | ex.: `89.9` | `items[0].price` do produto escolhido |
| `{PRODUCT_ESTOQUE}` | ex.: `1` | Ajustar via admin ou escolher produto com `quantity: 1` |
| `{PRODUCT_QA_ID}` | UUID criado no teste | Retorno de `POST {API}/admin/products` |
| `{PRODUCT_QA_NAME}` | `QA-TEST-20260709-1430` | `QA-TEST-` + data/hora (único por execução) |
| `{ORDER_ID}` | ex.: `7c9e6679-7425-40de-944b-e07fc1f90ae7` | Retorno de `POST {API}/orders` (checkout de teste) |
| `{ORDER_ID_NUEVO}` | UUID de segundo pedido QA | Segundo `POST {API}/orders` no mesmo teste |
| `{ORDER_PREFIX_8}` | ex.: `7c9e6679` | Primeiros 8 caracteres de `{ORDER_ID}` |
| `{UUID_INEXISTENTE}` | `00000000-0000-4000-8000-000000000000` | UUID v4 válido, garantidamente inexistente |
| `{UUID_ALEATORIO}` | `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa` | Para testes sem auth |
| `{CURSOR_PEDIDOS}` | `eyJuYW1lIjo...` | `GET {API}/admin/orders?limit=20` → `nextCursor` |
| `{STRING_5001}` | `a` repetido 5001× | `python -c "print('a'*5001)"` ou equivalente |
| `{VITE_WHATSAPP_NUMBER}` | ex.: `5511999998888` | `.env` prod do frontend (sem `+`) |
| `{CDN_URL}` | ex.: `https://cdn.afroo90s.com.br` | `photos[0]` de um produto real |

**Body padrão de checkout (válido):**

```json
{
  "items": [
    {
      "productId": "{PRODUCT_ID}",
      "quantity": 1,
      "selectedOption": "Preto"
    }
  ],
  "customer": {
    "name": "Maria QA Test",
    "address": "Rua QA Teste, 123 - Centro",
    "postalCode": "01310-100",
    "tel": "11999998888"
  }
}
```

**Body padrão de criação de produto (admin):**

```json
{
  "name": "{PRODUCT_QA_NAME}",
  "description": "Produto de teste manual — remover após aceite",
  "price": 49.9,
  "quantity": 10,
  "category": "oculos",
  "options": ["Preto", "Dourado"]
}
```

---

## Matriz de rastreabilidade

| Épico | Rotas / área | Risco principal |
|-------|--------------|-----------------|
| SEG | API pública + bypass `/admin/*` | Acesso indevido, vazamento na superfície pública |
| LOJA | `/`, `/products/:id` | Checkout, estoque, preço |
| AUTH | `/admin/login`, `/admin` | Bypass de autenticação |
| PROD | Tab Produtos | CRUD, upload |
| PED | Tab Pedidos | Busca, status, robustez de paginação |
| INFRA | Headers, CORS, CDN | Configuração prod |

---

## Modelo de segurança (escopo dos testes)

O painel admin (`/admin`) é **área restrita por design**: usuário no grupo `admins` com JWT válido **deve** visualizar pedidos e dados do cliente (nome, endereço, telefone). A barreira de segurança está na **autenticação e autorização**, não em limitar o que um admin legítimo pode ver.

| Superfície | O que testar em segurança (P0) | O que **não** é falha de segurança |
|------------|--------------------------------|-------------------------------------|
| API pública | Injeção, vazamento, manipulação de preço/estoque | — |
| `/admin/*` sem auth ou sem grupo `admins` | Bypass, 401, redirecionamento no frontend | — |
| Admin autenticado (épico funcional) | Apenas campos **internos** do modelo (`customerNameLower`) e erros sem stack trace | Ver PII de clientes, listar todos os pedidos, buscar por nome/ID |

**Regra:** testes de exploração (injeção, IDOR, enumeração) aplicam-se à **superfície pública** e ao **bypass de auth**. Busca com caracteres especiais, strings longas e paginação no admin pertencem aos épicos funcionais (4 e 5), não ao de segurança.

---

## Épico 1 — Segurança e injeção (P0)

### Feature: Proteção contra injeção nos campos de busca (superfície pública)

```gherkin
Cenário: Busca de produtos com payload SQL clássico não expõe dados nem erro interno
  Dado que estou na loja pública em produção
  Quando faço GET {API}/products?name=%27%20OR%20%271%27%3D%271
    E faço GET {API}/products?name=%22%3B%20DROP%20TABLE%20orders%3B%20--
    E faço GET {API}/products?name=1%27%20UNION%20SELECT%20*%20FROM%20users--
    E faço GET {API}/products?name=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E
    E faço GET {API}/products?name=../../../etc/passwd
  Então todas as respostas retornam HTTP 200 com JSON válido
    E items é array (possivelmente vazio)
    E não há stack trace, mensagem SQL ou detalhes de infraestrutura no body
    E não aparecem pedidos ou dados de clientes na resposta

Cenário: Filtro de categoria com payload malicioso
  Quando faço GET {API}/products?category=oculos%27%20OR%20%271%27%3D%271
    E GET {API}/products?category=admin
    E GET {API}/products?category=../../
  Então resposta é 200 com lista controlada ou 400 INVALID_QUERY
    E nunca retorna HTTP 500 com detalhes internos

Cenário: Parâmetros de paginação inválidos na API pública
  Quando faço GET {API}/products?limit=-1
    E GET {API}/products?limit=0
    E GET {API}/products?limit=99999
    E GET {API}/products?limit=1e10
    E GET {API}/products?limit=abc
    E GET {API}/products?cursor=invalid
  Então API responde 400 ou lista controlada
    E não há stack trace no body
```

**Requisições exatas (copiar no Postman/curl):**

| # | Método | URL completa |
|---|--------|--------------|
| 1 | `GET` | `{API}/products?name=%27%20OR%20%271%27%3D%271` |
| 2 | `GET` | `{API}/products?name=%22%3B%20DROP%20TABLE%20orders%3B%20--` |
| 3 | `GET` | `{API}/products?name=1%27%20UNION%20SELECT%20*%20FROM%20users--` |
| 4 | `GET` | `{API}/products?name=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E` |
| 5 | `GET` | `{API}/products?name=../../../etc/passwd` |
| 6 | `GET` | `{API}/products?category=oculos%27%20OR%20%271%27%3D%271` |
| 7 | `GET` | `{API}/products?category=admin` |
| 8 | `GET` | `{API}/products?category=../../` |
| 9 | `GET` | `{API}/products?limit=-1` |
| 10 | `GET` | `{API}/products?limit=0` |
| 11 | `GET` | `{API}/products?limit=99999` |
| 12 | `GET` | `{API}/products?limit=1e10` |
| 13 | `GET` | `{API}/products?limit=abc` |
| 14 | `GET` | `{API}/products?cursor=invalid` |

> **Admin autenticado:** payloads em `q` (pedidos) e busca de produtos no painel são testados nos épicos funcionais 4 e 5 (robustez de busca), não como exploração de segurança — o operador já tem acesso legítimo aos dados.

---

### Feature: Bloqueio de acesso admin (P0)

```gherkin
Cenário: Rotas admin sem autenticação
  Quando chamo GET {API}/admin/products (sem header Authorization)
    E GET {API}/admin/orders (sem header Authorization)
    E POST {API}/admin/products com Content-Type: application/json e body {} (sem Authorization)
    E PUT {API}/admin/orders/{ORDER_ID} com Content-Type: application/json e body {"status":"EM_ATENDIMENTO"} (sem Authorization)
  Então todas retornam HTTP 401
    E body contém {"code":"UNAUTHORIZED",...}

Cenário: Token JWT inválido ou expirado
  Quando envio GET {API}/admin/products com Authorization: Bearer {TOKEN_INVALIDO}
    E GET {API}/admin/orders com Authorization: Bearer {TOKEN_INVALIDO}
    E GET {API}/admin/products com Authorization: Bearer {TOKEN_EXPIRADO}
  Então retorno é 401 em todas as rotas /admin/*

Cenário: Usuário Cognito sem grupo admins
  Dado que fiz login com {NON_ADMIN_EMAIL} / {NON_ADMIN_PASSWORD}
  Quando acesso GET {API}/admin/products com Authorization: Bearer {NON_ADMIN_TOKEN}
  Então retorno é 401
    E body contém code UNAUTHORIZED

Cenário: Bypass via frontend (rota protegida)
  Dado que não estou autenticado (sessão limpa / aba anônima)
  Quando acesso diretamente {FRONTEND}/admin
  Então sou redirecionado para {FRONTEND}/admin/login
    E nenhuma lista de pedidos ou produtos é exibida

Cenário: Bypass via DevTools (token forjado)
  Dado aba anônima em {FRONTEND}/admin/login
  Quando executo no console do DevTools:
    """
    fetch("{API}/admin/orders?limit=1", {
      headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.forjado" }
    }).then(r => r.json()).then(console.log)
    """
  Então resposta HTTP 401 com code UNAUTHORIZED
    E ao tentar acessar {FRONTEND}/admin sem login, UI não exibe dados sensíveis
```

**curl de referência (sem auth):**

```bash
curl -s -o /dev/null -w "%{http_code}" "{API}/admin/products"
curl -s -o /dev/null -w "%{http_code}" "{API}/admin/orders"
curl -s -w "\n%{http_code}" -X POST "{API}/admin/products" -H "Content-Type: application/json" -d "{}"
curl -s -w "\n%{http_code}" -X PUT "{API}/admin/orders/{ORDER_ID}" -H "Content-Type: application/json" -d '{"status":"EM_ATENDIMENTO"}'
```

---

### Feature: Vazamento de dados na API pública (P0)

```gherkin
Cenário: Pedidos não são listáveis publicamente
  Quando chamo GET {API}/orders (sem Authorization)
    E GET {API}/orders/{ORDER_ID} (sem Authorization)
  Então retorno é 404 (rota inexistente) — não 200 com dados

Cenário: Dados internos não aparecem na API pública
  Quando listo GET {API}/products?limit=1
    E GET {API}/products/{PRODUCT_ID}
  Então resposta não contém customerNameLower
    E não contém dados de clientes de pedidos

Cenário: Rotas admin inacessíveis sem autenticação (IDOR na superfície pública)
  Quando tento GET {API}/admin/orders/{UUID_ALEATORIO} (sem Authorization)
    E GET {API}/admin/orders/{ORDER_ID} (sem Authorization)
  Então retorno é 401 em todas as tentativas
    E nenhum dado de pedido ou cliente é retornado
```

### Feature: Campos internos do modelo (admin autenticado — P0)

> Objetivo: validar que a API não vaza campos de implementação (`customerNameLower`), **não** impedir que o admin veja dados do cliente — isso é esperado.

```gherkin
Cenário: Resposta de pedido admin não expõe campo interno de busca
  Dado pedido {ORDER_ID} existente
  Quando faço GET {API}/admin/orders/{ORDER_ID} com Authorization: Bearer {ADMIN_TOKEN}
  Então JSON não contém customerNameLower
    E contém customer com name "Maria QA Test", address, postalCode "01310-100", tel "11999998888"
```

---

### Feature: Manipulação de preço e estoque (P0)

```gherkin
Cenário: Cliente não define preço no checkout
  Dado produto {PRODUCT_ID} com preço {PRODUCT_PRECO} (ex.: 89.90)
  Quando envio POST {API}/orders com Content-Type: application/json e body:
    """
    {
      "items": [
        {
          "productId": "{PRODUCT_ID}",
          "quantity": 1,
          "unitPrice": 0.01,
          "fullPrice": 0.01,
          "selectedOption": "Preto"
        }
      ],
      "customer": {
        "name": "Maria QA Test",
        "address": "Rua QA Teste, 123 - Centro",
        "postalCode": "01310-100",
        "tel": "11999998888"
      }
    }
    """
  Então API ignora campos extras ou retorna 400 VALIDATION_ERROR
    E se 201, fullPrice na resposta é {PRODUCT_PRECO} × quantity (calculado pelo servidor)

Cenário: Quantidade acima do estoque
  Dado produto {PRODUCT_ID} com quantity = 1
  Quando envio POST {API}/orders com body (mesmo customer do checkout padrão) e items:
    """
    [{"productId": "{PRODUCT_ID}", "quantity": 99, "selectedOption": "Preto"}]
    """
  Então retorno 409 INSUFFICIENT_STOCK

Cenário: Produto inexistente no pedido
  Quando envio POST {API}/orders com body (mesmo customer do checkout padrão) e items:
    """
    [{"productId": "{UUID_INEXISTENTE}", "quantity": 1}]
    """
  Então retorno 404 PRODUCT_NOT_FOUND
```

---

### Feature: CORS e headers (P1)

```gherkin
Cenário: CORS restrito à origem do site
  Quando faço OPTIONS {API}/products com headers:
    | Origin | https://site-malicioso.com |
    | Access-Control-Request-Method | GET |
  Então Access-Control-Allow-Origin NÃO é https://site-malicioso.com
  Quando faço GET {API}/products?limit=1 com header Origin: https://site-malicioso.com
  Então Access-Control-Allow-Origin NÃO reflete origem arbitrária

Cenário: Respostas de erro não vazam stack
  Quando provoco GET {API}/products?limit=abc → 400 INVALID_QUERY
    E GET {API}/products/{UUID_INEXISTENTE} → 404 NOT_FOUND
    E GET {API}/admin/products (sem Authorization) → 401 UNAUTHORIZED
  Então cada body contém code, message, requestId
    E não há file paths, nomes de tabelas DynamoDB ou variáveis de ambiente
```

---

## Épico 2 — Loja pública (P0)

### Feature: Catálogo e navegação

```gherkin
Cenário: Home carrega produtos
  Dado que acesso {FRONTEND}/
  Então produtos são exibidos com imagem, nome e preço em R$
    E não há erro de console crítico (CORS, 404 de assets)

Cenário: Filtro por categoria
  Quando seleciono categoria "óculos" na UI
    E equivalente a GET {API}/products?category=oculos
  Então apenas produtos com category "oculos" aparecem
  Quando acesso {FRONTEND}/?category=hack
    E equivalente a GET {API}/products?category=hack
  Então API retorna 400 INVALID_QUERY

Cenário: Busca por nome na loja
  Dado produto conhecido com nome contendo "Vintage" (obter de GET {API}/products?limit=1)
  Quando busco "Vintage" na barra de busca
    E equivalente a GET {API}/products?name=Vintage
  Então produto aparece nos resultados
  Quando busco "ZZZNOMESINEXISTENTE999"
    E equivalente a GET {API}/products?name=ZZZNOMESINEXISTENTE999
  Então mensagem de lista vazia (sem erro)

Cenário: Paginação "carregar mais"
  Dado catálogo com mais de 20 itens (GET {API}/products?limit=20 retorna hasMore: true)
  Quando clico em "carregar mais"
    E segunda requisição inclui cursor de nextCursor da primeira
  Então novos itens aparecem sem duplicar os anteriores

Cenário: Deep link de produto
  Quando acesso {FRONTEND}/products/{PRODUCT_ID}
  Então modal ou página de detalhe abre com nome e preço do produto
  Quando acesso {FRONTEND}/products/{UUID_INEXISTENTE}
  Então tratamento de erro amigável (404)
```

---

### Feature: Carrinho e checkout

```gherkin
Cenário: Adicionar ao carrinho
  Dado produto {PRODUCT_ID} com price {PRODUCT_PRECO}
  Quando adiciono 1 unidade ao carrinho
  Então contador do carrinho exibe 1
    E valor total exibe R$ {PRODUCT_PRECO}

Cenário: Produto com opções obrigatórias
  Dado produto {PRODUCT_COM_OPCOES} com options ["Preto", "Dourado"]
  Quando tento finalizar checkout sem selecionar opção
  Então validação impede envio na UI
  Quando envio POST {API}/orders com selectedOption "Inexistente":
    """
    {
      "items": [{"productId": "{PRODUCT_COM_OPCOES}", "quantity": 1, "selectedOption": "Inexistente"}],
      "customer": {"name": "Maria QA Test", "address": "Rua QA Teste, 123", "postalCode": "01310-100", "tel": "11999998888"}
    }
    """
  Então retorno 400 INVALID_OPTION

Cenário: Checkout com dados válidos
  Quando preencho no formulário:
    | campo | valor |
    | nome | Maria QA Test |
    | endereço | Rua QA Teste, 123 - Centro |
    | CEP | 01310-100 |
    | telefone | 11999998888 |
    E adiciono produto {PRODUCT_ID} (opção "Preto" se aplicável)
    E confirmo pedido
  Então POST {API}/orders retorna 201 com id {ORDER_ID}
    E UI exibe confirmação com {ORDER_ID}
    E link WhatsApp (wa.me) abre com itens, total e dados do cliente

Cenário: Validação de campos do cliente
  Quando envio POST {API}/orders com customer.name "Maria123"
  Então 400 VALIDATION_ERROR
  Quando envio com customer.postalCode "123"
  Então 400 VALIDATION_ERROR
  Quando envio com customer.tel "11999"
  Então 400 VALIDATION_ERROR
  Quando envio com items []
  Então 400 VALIDATION_ERROR
```

**Bodies exatos para validação (POST {API}/orders):**

```json
{"items":[{"productId":"{PRODUCT_ID}","quantity":1}],"customer":{"name":"Maria123","address":"Rua QA Teste, 123","postalCode":"01310-100","tel":"11999998888"}}
```

```json
{"items":[{"productId":"{PRODUCT_ID}","quantity":1}],"customer":{"name":"Maria QA Test","address":"Rua QA Teste, 123","postalCode":"123","tel":"11999998888"}}
```

```json
{"items":[{"productId":"{PRODUCT_ID}","quantity":1}],"customer":{"name":"Maria QA Test","address":"Rua QA Teste, 123","postalCode":"01310-100","tel":"11999"}}
```

```json
{"items":[],"customer":{"name":"Maria QA Test","address":"Rua QA Teste, 123","postalCode":"01310-100","tel":"11999998888"}}
```

---

## Épico 3 — Autenticação admin (P0)

### Feature: Login e sessão

```gherkin
Cenário: Login com credenciais válidas
  Dado que acesso {FRONTEND}/admin/login
  Quando informo email {ADMIN_EMAIL} e senha {ADMIN_PASSWORD}
    E clico em entrar
  Então sou redirecionado para {FRONTEND}/admin
    E tab Pedidos ou Produtos carrega com dados

Cenário: Login com credenciais inválidas
  Dado que acesso {FRONTEND}/admin/login
  Quando informo email {ADMIN_EMAIL} e senha "senha-errada-xyz"
  Então mensagem de erro em pt-BR (ex.: credenciais inválidas)
    E permaneço em {FRONTEND}/admin/login

Cenário: Logout
  Dado autenticado em {FRONTEND}/admin
  Quando clico em sair
  Então volto para {FRONTEND}/admin/login
    E GET {API}/admin/products com Authorization: Bearer {ADMIN_TOKEN} retorna 401 após expiração do token

Cenário: Sessão expirada
  Dado {TOKEN_EXPIRADO} (aguardar expiração ou invalidar sessão no Cognito)
  Quando navego para {FRONTEND}/admin
  Então redirecionamento para {FRONTEND}/admin/login sem exibir dados stale
```

---

## Épico 4 — Admin produtos (P0/P1)

### Feature: CRUD de produtos

```gherkin
Cenário: Listar produtos admin
  Dado autenticado em {FRONTEND}/admin tab Produtos
  Então GET {API}/admin/products?limit=20 com Authorization: Bearer {ADMIN_TOKEN} retorna lista
  Quando busco "QA" na barra de busca
    E equivalente a GET {API}/admin/products?name=QA&limit=20
  Então filtro retorna apenas produtos cujo nome contém "QA"

Cenário: Busca de produtos com caracteres especiais (robustez)
  Dado autenticado na tab Produtos
  Quando busco cada termo abaixo (UI ou GET {API}/admin/products?name=...):
    | termo |
    | ' OR 1=1-- |
    | João |
    | O'Brien |
    | 测试 |
    | %00 |
    | <script>alert(1)</script> |
  Então resultados são coerentes ou lista vazia
    E API responde 200 ou 400 — nunca 500 com stack trace

**URLs exatas (GET com Authorization: Bearer {ADMIN_TOKEN}):**

| termo | URL |
|-------|-----|
| `' OR 1=1--` | `{API}/admin/products?name=%27%20OR%201%3D1--&limit=20` |
| `João` | `{API}/admin/products?name=Jo%C3%A3o&limit=20` |
| `O'Brien` | `{API}/admin/products?name=O%27Brien&limit=20` |
| `测试` | `{API}/admin/products?name=%E6%B5%8B%E8%AF%95&limit=20` |
| `%00` | `{API}/admin/products?name=%2500&limit=20` |
| `<script>alert(1)</script>` | `{API}/admin/products?name=%3Cscript%3Ealert(1)%3C%2Fscript%3E&limit=20` |

Cenário: Criar produto (JSON)
  Quando envio POST {API}/admin/products com Authorization: Bearer {ADMIN_TOKEN}, Content-Type: application/json e body:
    """
    {
      "name": "{PRODUCT_QA_NAME}",
      "description": "Produto de teste manual — remover após aceite",
      "price": 49.9,
      "quantity": 10,
      "category": "oculos",
      "options": ["Preto", "Dourado"]
    }
    """
  Então retorno 201 com id {PRODUCT_QA_ID}
    E GET {API}/products/{PRODUCT_QA_ID} retorna o produto

Cenário: Upload de imagem
  Quando envio POST {API}/admin/products multipart/form-data com:
    | campo | valor |
    | name | {PRODUCT_QA_NAME}-img |
    | price | 59.9 |
    | quantity | 5 |
    | category | oculos |
    | photo_0 | arquivo JPEG < 5 MB (ex.: foto-qa.jpg) |
  Então retorno 201 e photos[0] carrega via CDN com HTTP 200
  Quando envio photo_0 com arquivo > 5 MB ou application/pdf
  Então 413 ou 400 INVALID_IMAGE

Cenário: Editar produto
  Dado produto {PRODUCT_QA_ID} criado no teste
  Quando envio PUT {API}/admin/products/{PRODUCT_QA_ID} com Authorization: Bearer {ADMIN_TOKEN} e body:
    """
    {"name": "{PRODUCT_QA_NAME}", "description": "Descrição alterada QA", "price": 59.9, "quantity": 10, "category": "oculos"}
    """
  Então GET {API}/products/{PRODUCT_QA_ID} exibe price 59.9 e description "Descrição alterada QA"

Cenário: Ajuste de estoque
  Dado produto {PRODUCT_QA_ID} com quantity 10
  Quando envio PATCH {API}/admin/products/{PRODUCT_QA_ID}/stock com Authorization: Bearer {ADMIN_TOKEN} e body {"delta": 5}
  Então quantity passa a 15
  Quando envio PATCH {API}/admin/products/{PRODUCT_QA_ID}/stock com Authorization: Bearer {ADMIN_TOKEN} e body {"delta": -2}
  Então quantity passa a 13
  Quando envio PATCH {API}/admin/products/{PRODUCT_QA_ID}/stock com Authorization: Bearer {ADMIN_TOKEN} e body {"delta": -99}
  Então 409 INSUFFICIENT_STOCK

Cenário: Excluir produto
  Quando envio DELETE {API}/admin/products/{PRODUCT_QA_ID} com Authorization: Bearer {ADMIN_TOKEN}
  Então GET {API}/products/{PRODUCT_QA_ID} retorna 404 NOT_FOUND
```

---

## Épico 5 — Admin pedidos (P0)

### Feature: Listagem, busca e status

```gherkin
Cenário: Listar pedidos por status
  Quando filtro tab status SOLICITADO
    E equivalente a GET {API}/admin/orders?status=SOLICITADO&limit=20
  Então apenas pedidos com status "SOLICITADO" aparecem

Cenário: Busca por UUID completo
  Dado pedido {ORDER_ID} criado no checkout com cliente "Maria QA Test"
  Quando busco q={ORDER_ID}
    E GET {API}/admin/orders?q={ORDER_ID}&limit=20
  Então retorna exatamente 1 pedido com id {ORDER_ID}

Cenário: Busca por prefixo de ID
  Dado pedido {ORDER_ID}
  Quando busco q={ORDER_PREFIX_8}
    E GET {API}/admin/orders?q={ORDER_PREFIX_8}&limit=20
  Então pedido {ORDER_ID} aparece na lista

Cenário: Busca por nome do cliente
  Dado pedido com customer.name "Maria QA Test"
  Quando busco q=maria
    E GET {API}/admin/orders?q=maria&limit=20
  Então pedido aparece (case insensitive)

Cenário: Busca com menos de 2 caracteres
  Quando busco q=a
    E GET {API}/admin/orders?q=a&limit=20
  Então 400 com message "Busca deve ter ao menos 2 caracteres"

Cenário: Modo idOrName (hex sem dígitos)
  Quando busco q=dead
    E GET {API}/admin/orders?q=dead&limit=20
  Então resultados são união controlada: pedidos cujo id começa com "dead" OU customerNameLower começa com "dead"

Cenário: Paginação com busca ativa
  Dado GET {API}/admin/orders?q=maria&limit=20 retorna hasMore: true e nextCursor {CURSOR_PEDIDOS}
  Quando faço GET {API}/admin/orders?q=maria&limit=20&cursor={CURSOR_PEDIDOS}
  Então resultados da página 2 são coerentes com q=maria
  Quando faço GET {API}/admin/orders?q=joao&limit=20&cursor={CURSOR_PEDIDOS}
  Então 400 INVALID_CURSOR ou lista inconsistente (bug conhecido do cursor/q)

Cenário: Busca com caracteres especiais, Unicode e payloads (robustez)
  Dado autenticado na tab Pedidos
  Quando busco cada termo (UI ou GET {API}/admin/orders?q=...&limit=20):
    | q |
    | João |
    | O'Brien |
    | 测试 |
    | %00 |
    | <script>alert(1)</script> |
    | ' OR 1=1-- |
    | 550e8400' UNION SELECT-- |
  Então resultados são coerentes ou lista vazia
    E API responde 200 ou 400 INVALID_QUERY — nunca 500 com stack trace
    E nenhum script executa na UI admin

**URLs exatas (GET com Authorization: Bearer {ADMIN_TOKEN}):**

| q | URL |
|---|-----|
| `João` | `{API}/admin/orders?q=Jo%C3%A3o&limit=20` |
| `O'Brien` | `{API}/admin/orders?q=O%27Brien&limit=20` |
| `测试` | `{API}/admin/orders?q=%E6%B5%8B%E8%AF%95&limit=20` |
| `%00` | `{API}/admin/orders?q=%2500&limit=20` |
| `<script>alert(1)</script>` | `{API}/admin/orders?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E&limit=20` |
| `' OR 1=1--` | `{API}/admin/orders?q=%27%20OR%201%3D1--&limit=20` |
| `550e8400' UNION SELECT--` | `{API}/admin/orders?q=550e8400%27%20UNION%20SELECT--&limit=20` |

Cenário: Busca com string extremamente longa
  Dado {STRING_5001} (5001 caracteres "a")
  Quando envio GET {API}/admin/orders?q={STRING_5001}&limit=20
  Então API responde 200 ou 400 em menos de 30s
    E frontend não trava ao colar o mesmo valor na barra de busca

Cenário: Pedido inexistente retorna 404
  Dado autenticado com {ADMIN_TOKEN}
  Quando acesso GET {API}/admin/orders/{UUID_INEXISTENTE}
  Então retorno 404 NOT_FOUND
    E body {"code":"NOT_FOUND",...} sem stack trace

Cenário: Atualização de status válida
  Dado pedido {ORDER_ID} com status SOLICITADO
  Quando envio PUT {API}/admin/orders/{ORDER_ID} com Authorization: Bearer {ADMIN_TOKEN} e body {"status": "EM_ATENDIMENTO"}
  Então 200 e status atualizado para EM_ATENDIMENTO
  Quando envio PUT {API}/admin/orders/{ORDER_ID} com Authorization: Bearer {ADMIN_TOKEN} e body {"status": "CONCLUIDO"}
  Então 400 INVALID_STATUS_TRANSITION

Cenário: Fluxo completo de status até terminal
  Dado pedido {ORDER_ID} em SOLICITADO
  Quando executo em sequência PUT {API}/admin/orders/{ORDER_ID} com Authorization: Bearer {ADMIN_TOKEN}:
    | body |
    | {"status": "EM_ATENDIMENTO"} |
    | {"status": "AGUARDANDO_PAGAMENTO"} |
    | {"status": "EM_PREPARACAO"} |
    | {"status": "ENVIADO"} |
    | {"status": "CONCLUIDO"} |
  Então cada passo retorna 200
  Quando envio PUT {API}/admin/orders/{ORDER_ID_NUEVO} com Authorization: Bearer {ADMIN_TOKEN} e body {"status": "CANCELADO"} (pedido novo em SOLICITADO)
```

---

## Épico 6 — Integrações e e-mail (P1)

```gherkin
Cenário: Notificação de novo pedido
  Quando envio POST {API}/orders com body do checkout padrão (cliente "Maria QA Test")
  Então retorno 201 com id {ORDER_ID}
    E admin ({ADMIN_EMAIL}) recebe e-mail SES com orderId {ORDER_ID} e customerName "Maria QA Test" (se SES_ENABLED=true)

Cenário: WhatsApp pós-checkout
  Quando finalizo checkout na UI com cliente "Maria QA Test" e produto {PRODUCT_ID}
  Então link abre https://wa.me/{VITE_WHATSAPP_NUMBER}?text=...
    E mensagem contém nome do produto, total em R$ e dados "Maria QA Test", "01310-100", "11999998888"
```

---

## Épico 7 — UX, acessibilidade e responsividade (P1/P2)

```gherkin
Cenário: Mobile 375px — loja
  Dado viewport 375×812 (iPhone SE)
  Quando acesso {FRONTEND}/
  Então grid, modal de produto e carrinho drawer usáveis sem overflow horizontal

Cenário: Mobile — admin
  Dado viewport 375×812 e autenticado em {FRONTEND}/admin
  Quando alterno tabs Pedidos e Produtos
    E busco q=maria na tab Pedidos
    E abro detalhe do pedido {ORDER_ID}
  Então controles são acessíveis sem scroll horizontal

Cenário: Desktop 1280px
  Dado viewport 1280×800
  Quando acesso {FRONTEND}/
  Então grid do catálogo exibe 4 colunas

Cenário: Estados de loading e erro
  Dado DevTools → Network → Offline
  Quando recarrego {FRONTEND}/admin tab Produtos
  Então spinner/skeleton aparece durante fetch
    E toast de erro ao falhar rede
```

---

## Épico 8 — Regressão e smoke pós-deploy (P0)

```gherkin
Cenário: Health check mínimo pós-lançamento
  Quando executo em sequência:
    | passo | comando / ação |
    | 1 | curl -s -o /dev/null -w "%{http_code}" "{API}/products?limit=1" → 200 |
    | 2 | curl -s -w "\n%{http_code}" -X POST "{API}/orders" -H "Content-Type: application/json" -d '<body checkout padrão>' → 201, salvar ORDER_ID |
    | 3 | curl -s -o /dev/null -w "%{http_code}" "{API}/admin/orders?limit=1" -H "Authorization: Bearer {ADMIN_TOKEN}" → 200 |
    | 4 | curl -s -o /dev/null -w "%{http_code}" -X DELETE "{API}/admin/products/{PRODUCT_QA_ID}" -H "Authorization: Bearer {ADMIN_TOKEN}" → 200/204 (se produto QA criado) |
  Então todos os passos críticos passam em menos de 2 min

Cenário: Assets e CDN
  Dado GET {API}/products/{PRODUCT_ID} retorna photos[0] = "{CDN_URL}/products/..."
  Quando abro {CDN_URL} no navegador
  Então HTTP 200 e imagem carrega

Cenário: SPA routing
  Quando recarrego {FRONTEND}/products/{PRODUCT_ID}
  Então página do produto carrega (index.html via CloudFront, sem 403)
  Quando recarrego {FRONTEND}/admin (autenticado)
  Então painel admin carrega (index.html, sem 403)
```

**Script curl completo do smoke (substituir variáveis):**

```bash
curl -s "{API}/products?limit=1"
curl -s -w "\n%{http_code}" -X POST "{API}/orders" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"{PRODUCT_ID}","quantity":1}],"customer":{"name":"Maria QA Test","address":"Rua QA Teste, 123","postalCode":"01310-100","tel":"11999998888"}}'
curl -s -o /dev/null -w "%{http_code}" "{API}/admin/orders?limit=1" \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

---

## Checklist de critérios de go/no-go

| # | Critério | P | Status |
|---|----------|---|--------|
| 1 | Nenhuma rota `/admin/*` acessível sem JWT válido + grupo `admins` | P0 | ☐ |
| 2 | Payloads de injeção na API **pública** não causam 500 nem vazamento | P0 | ☐ |
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

1. **SQL injection:** arquitetura DynamoDB + expressões parametrizadas tornam o vetor **improvável**; os testes de segurança validam a **superfície pública** e o **bypass de auth**. Busca no admin com payloads especiais é teste de **robustez funcional** (épicos 4–5), não de exploração — o operador autenticado já tem acesso legítimo aos dados do cliente.
2. **Produção:** prefira dados com prefixo `QA-TEST`; evite deletar pedidos reais; limite testes de carga.
3. **Gap conhecido:** validação de cursor com `q` — inclua o cenário de paginação com `q` trocado para detectar inconsistência.

---

## Referências

- [api-routes.md](../backend/api-routes.md) — contrato de rotas e busca admin (`q`)
- [tasks/20-aceite-fase4.md](tasks/20-aceite-fase4.md) — smoke test automatizado
- [tasks/17-aceite-fase3.md](tasks/17-aceite-fase3.md) — aceite rotas admin
- Frontend: [tasks/17-aceite-fase4.md](../frontend/tasks/17-aceite-fase4.md)
