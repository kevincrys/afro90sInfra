# Specs de infraestrutura (canônico)

Repositório **afro90sInfra** — fonte da verdade para CDK, recursos AWS e tasks de infra.

## Espelho em outros repos

| Repo | Path | Uso |
|------|------|-----|
| afro90sBackend | `docs/specs/infra/` | Referência de contratos (outputs, resources) |
| afro90sFrontend | *(se existir)* | Idem |

Após alterar specs aqui, sincronizar:

```bash
cp -r afro90sInfra/docs/specs/infra/* afro90sBackend/docs/specs/infra/
```

Deploy de **código** Lambda: [../backend/tasks/00-deploy-api.md](../backend/tasks/00-deploy-api.md) no repo **afro90sBackend**.
