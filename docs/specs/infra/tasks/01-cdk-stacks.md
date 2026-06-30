# Task 01 — Stacks CDK

**Status:** pendente  
**Arquivos alvo:** [`cdk.md`](../cdk.md) — estrutura de pastas, stacks e dependências

## Objetivo

Fechar divisão em stacks, ordem de deploy e constructs reutilizáveis.

## Decisões a tomar

- [ ] Confirmar 5 stacks: `DataStack`, `AuthStack`, `AssetsStack`, `ApiStack`, `FrontendStack`
- [ ] `AssetsStack` separado ou fundir com `FrontendStack`?
- [ ] Constructs compartilhados: `ApiRoute`, `DynamoTable`, `TaggedBucket` — quais na v1?
- [ ] Um `app.ts` instancia todas vs apps por stack
- [ ] Exportações cross-stack: `Fn.importValue` vs props diretas entre stacks

## Checklist de refinamento

- [ ] Diagrama de dependências atualizado
- [ ] Ordem de deploy documentada com justificativa
- [ ] Nome dos arquivos em `lib/stacks/` alinhado ao naming `afro90s-{env}-...`
- [ ] Cross-stack: outputs que `ApiStack` consome de Data, Auth, Assets

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `cdk.md`
- [ ] Marcar **Status** como `concluída`
