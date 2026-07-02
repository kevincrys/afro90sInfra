# Task 01 — Stacks CDK

**Status:** pendente  
**Arquivos alvo:** [`cdk.md`](../cdk.md) — estrutura de pastas, stacks e dependências

## Objetivo

Fechar divisão em stacks, ordem de deploy e constructs reutilizáveis.

## Decisões a tomar

- [ ] Confirmar 5 stacks: `DataStack`, `AuthStack`, `AssetsStack`, `ApiStack`, `FrontendStack`
NÃO, separar as stacks por recursor sempre, LAmbda Stack, STorageSTack, DBStack, e etc
- [ ] `AssetsStack` separado ou fundir com `FrontendStack`?
será por recyris
- [ ] Constructs compartilhados: `ApiRoute`, `DynamoTable`, `TaggedBucket` — quais na v1?
stacks separadas, o que puder ser compartilhado pode ser feito
- [ ] Um `app.ts` instancia todas vs apps por stack
um app.ts instancia todas 
- [ ] Exportações cross-stack: `Fn.importValue` vs props diretas entre stacks
 Exportações cross-stack: `Fn.importValue`

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
