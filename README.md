# afro90sInfra

Repositório de infraestrutura do projeto **Afro90s** — provisionamento, deploy e operação dos ambientes.

## Documentação

| Recurso | Descrição |
|---------|-----------|
| [Visão e escopo](docs/foundation/vision.md) | Objetivo, escopo e não-objetivos |
| [Arquitetura](docs/foundation/architecture.md) | Componentes, ambientes e fluxos |
| [Glossário](docs/foundation/glossary.md) | Termos do domínio |
| [ADRs](docs/foundation/adr/) | Registro de decisões arquiteturais |
| [Specs de infra](docs/specs/infra/) | Especificações técnicas |
| [Como contribuir](CONTRIBUTING.md) | Fluxo de trabalho e convenções |
| [Guia para agentes](AGENTS.md) | Instruções para assistentes de IA |

## Estrutura do repositório

```
afro90sInfra/
├── docs/
│   ├── foundation/     # fundamentações (visão, arquitetura, ADRs)
│   └── specs/          # especificações por domínio
├── .cursor/
│   └── rules/          # regras persistentes para o Cursor
└── (código IaC — a definir)
```

## Status

Repositório em fase inicial. A stack de infraestrutura e os módulos serão definidos nas specs e ADRs conforme o projeto evoluir.
