# Guia para Agentes de IA

Este arquivo orienta assistentes de IA (Cursor, Copilot, etc.) ao trabalhar neste repositório.

## Antes de implementar

1. Leia [docs/foundation/vision.md](docs/foundation/vision.md) para entender o escopo.
2. Consulte [docs/foundation/architecture.md](docs/foundation/architecture.md) para alinhar com a arquitetura.
3. Verifique se existe spec em [docs/specs/](docs/specs/) para a tarefa solicitada.
4. Siga as regras em [.cursor/rules/](.cursor/rules/).

## Onde encontrar o quê

| Tipo | Local |
|------|-------|
| Fundamentação (por quê) | `docs/foundation/` |
| Especificações (o quê) | `docs/specs/` |
| Decisões arquiteturais | `docs/foundation/adr/` |
| Regras de código/convenções | `.cursor/rules/` |
| Glossário do domínio | `docs/foundation/glossary.md` |

## Princípios

- **Spec first**: não implemente infra sem spec ou ADR correspondente quando a decisão for estrutural.
- **Mínimo escopo**: altere apenas o necessário para a tarefa.
- **Convenções existentes**: siga padrões já estabelecidos no repo antes de introduzir novos.
- **Documentar decisões**: mudanças arquiteturais exigem novo ADR em `docs/foundation/adr/`.

## Stack

A ser definida. Consulte `docs/specs/infra/overview.md` e os ADRs mais recentes antes de assumir tecnologias.

## O que não fazer

- Não commitar secrets, `.env` ou credenciais.
- Não alterar documentação de fundamentação sem solicitação explícita.
- Não criar recursos de infra fora do escopo da spec/ADR em vigor.
