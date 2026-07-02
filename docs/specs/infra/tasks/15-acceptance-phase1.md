# Task 15 — Aceite fase 1

**Status:** pendente  
**Arquivos alvo:** [`overview.md`](../overview.md), [`tasks/README.md`](README.md)

## Objetivo

Executar script de smoke tests pós-deploy e validar integração entre todos os stacks e apps para declarar a fase 1 concluída.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Smoke tests | Script automatizado pós-deploy |
| Ordem de verificação | API → DynamoDB → S3 → CloudFront → Cognito |
| Responsável | Maintainer de infra |
| Rollback | Reverter deploy se script falhar |
| Critério "dev provisionável" | Todas as stacks green no CloudFormation |

## O que implementar

### Script de smoke tests

- [ ] Criar `infra/scripts/smoke-test.sh` que valida:

```bash
#!/bin/bash
set -e
ENV=${1:-dev}

# Ler outputs
API_URL=$(aws ssm get-parameter --name "/afro90s/${ENV}/api-base-url" --query Parameter.Value --output text)
CF_URL=$(aws ssm get-parameter --name "/afro90s/${ENV}/cloudfront-web-url" --query Parameter.Value --output text)
ASSETS_URL=$(aws ssm get-parameter --name "/afro90s/${ENV}/assets-cdn-url" --query Parameter.Value --output text 2>/dev/null || echo "")

echo "=== Smoke Tests afro90s ${ENV} ==="

# API: GET /products
echo -n "GET /products... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/products")
[ "$STATUS" = "200" ] && echo "OK ($STATUS)" || (echo "FALHOU ($STATUS)" && exit 1)

# API: rota inexistente deve retornar 404
echo -n "GET /naoexiste (404)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/naoexiste")
[ "$STATUS" = "404" ] && echo "OK ($STATUS)" || echo "AVISO ($STATUS)"

# API: /admin sem token deve retornar 401
echo -n "GET /admin/products sem token (401)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/admin/products")
[ "$STATUS" = "401" ] && echo "OK ($STATUS)" || (echo "FALHOU ($STATUS)" && exit 1)

# CloudFront: index.html
echo -n "CloudFront index.html... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${CF_URL}")
[ "$STATUS" = "200" ] && echo "OK ($STATUS)" || (echo "FALHOU ($STATUS)" && exit 1)

# CloudFront: SPA routing (rota interna deve retornar 200)
echo -n "CloudFront SPA routing /admin... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${CF_URL}/admin")
[ "$STATUS" = "200" ] && echo "OK ($STATUS)" || (echo "FALHOU ($STATUS)" && exit 1)

echo ""
echo "=== Todos os smoke tests passaram para ${ENV} ==="
```

- [ ] Adicionar script ao CI após `cdk deploy` (task 13, step final)

### Checklist manual pós-deploy

- [ ] Todas as stacks com status `CREATE_COMPLETE` ou `UPDATE_COMPLETE` no CloudFormation
- [ ] Outputs do CloudFormation acessíveis via CLI (`export-outputs.sh` funciona)
- [ ] `GET /products` retorna `200` com body `{ "items": [], "nextCursor": null }`
- [ ] CloudFront serve `index.html` com status `200`
- [ ] Rotas SPA (`/admin`, `/produto/xyz`) retornam `200` via CloudFront
- [ ] `POST /admin/products` sem token retorna `401`
- [ ] Login admin via Cognito funcional (frontend ou Postman)
- [ ] `POST /admin/products` com token válido retorna `201`
- [ ] Imagem de produto acessível via `AssetsCdnUrl`
- [ ] `POST /orders` cria pedido e e-mail admin recebido (sandbox)
- [ ] Dashboard CloudWatch exibe métricas da Lambda após invocações
- [ ] Pipeline CI: PR → validate/diff funcionando; merge dev → deploy automático

### Rollback

Se smoke tests falharem no CI:

- [ ] Deploy é marcado como falho (exit code ≠ 0)
- [ ] Manter versão anterior das stacks no CloudFormation (CDK não faz rollback automático em todos os casos — verificar manualmente se necessário)

## Pré-requisitos

- Tasks 00–14 todas concluídas

## Critérios de conclusão

- [ ] Script `smoke-test.sh dev` executa sem erros
- [ ] Todos os itens do checklist manual marcados
- [ ] `overview.md` critérios de aceite marcados como cumpridos
- [ ] `tasks/README.md` com status de todas as tasks `concluída`
- [ ] Atualizar **Status** para `concluída`
