# Task 10 — IAM e segurança

**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md) — IAM; [`overview.md`](../overview.md) — segurança

## Objetivo

Fechar roles de execução Lambda com least privilege e políticas de segurança transversais.

## Decisões a tomar

- [ ] Uma role por Lambda vs role compartilhada por domínio
 role compartilhada por domínio
- [ ] DynamoDB: permissões em tabela específica + índices (`table/index/*`)
isso
- [ ] S3 assets: `PutObject`/`DeleteObject` apenas no prefixo `products/*`
Sim
- [ ] SES: restrito ao `From` verificado
Sim
- [ ] Logs: `logs:CreateLogGroup` automático vs explícito
`logs:CreateLogGroup` automático (adicionar permissão para acompanhar logs via cloudWatchs)
- [ ] CI/CD: OIDC GitHub → AWS vs access keys (recomendado: OIDC)
OIDC GitHub
- [ ] Nenhum secret no Git — confirmar uso SSM/Secrets Manager
SSM/Secrets Manager
## Checklist de refinamento

- [ ] Matriz Lambda → actions → resources
- [ ] API Gateway invoke permission (gerenciado pelo CDK)
- [ ] Revisar checklist de segurança em `overview.md`
- [ ] Cross-link task [12-secrets-ssm.md](12-secrets-ssm.md)

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `resources.md` e `overview.md`
- [ ] Marcar **Status** como `concluída`
