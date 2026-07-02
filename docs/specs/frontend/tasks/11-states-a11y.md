# Task 11 — Estados de UI e acessibilidade

**Status:** pendente  
**Arquivos alvo:** [`ui-ux.md`](../ui-ux.md) — Loading skeletons, estados, acessibilidade

## Objetivo

Padronizar loading, empty, error, success e requisitos de acessibilidade.

## Decisões a tomar

- [ ] Biblioteca de toast: sonner, react-hot-toast ou custom
qSonner
- [ ] Componente `Skeleton` reutilizável vs por página
Por página
- [ ] Mensagens de erro: exibir `ApiError.message` direto ou mapear para pt-BR
Mapear, back sempre só em portugues
- [ ] Foco ao abrir modal/drawer admin sim
- [ ] `aria-live` para feedback de pedido criado |
Sim
- [ ] Skip link "ir para conteúdo" na v1?
Sim
## Checklist de refinamento

- [ ] Tabela tela → skeleton (completar em `ui-ux.md`)
- [ ] Padrão empty state com ilustração ou só texto
- [ ] Botão "Tentar novamente" em erros de query
- [ ] Checklist WCAG AA mínimo para checkout

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `ui-ux.md`
- [ ] Marcar **Status** como `concluída`
