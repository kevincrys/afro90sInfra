# Visão e Escopo — afro90sInfra

## Objetivo

Provisionar, configurar e operar a infraestrutura necessária para o projeto **Afro90s**, de forma reprodutível, segura e documentada.

Este repositório é a fonte da verdade para:

- Definição de ambientes (dev, staging, production)
- Recursos de cloud e rede
- Políticas de acesso (IAM, secrets)
- Pipelines de deploy de infraestrutura

## Escopo

- Infraestrutura como código (IaC)
- Configuração de ambientes e recursos compartilhados
- Documentação técnica de infra (specs, ADRs, arquitetura)
- Automação de provisionamento e deploy

## Fora de escopo

- Código da aplicação Afro90s (frontend, backend, mobile)
- Lógica de negócio e APIs de produto
- Conteúdo editorial ou assets de mídia
- Gerenciamento de dependências de aplicação (npm, pip, etc.)

Repositórios de aplicação podem ter seus próprios pipelines; este repo foca na **camada de infra**.

## Princípios

1. **Reprodutibilidade** — ambientes criados a partir de código versionado, não configuração manual ad hoc.
2. **Segurança por padrão** — least privilege, secrets fora do repositório, recursos com tags e auditoria.
3. **Documentação viva** — specs e ADRs acompanham mudanças estruturais.
4. **Simplicidade** — preferir soluções diretas; complexidade só quando justificada em ADR.

## Stakeholders

| Papel | Responsabilidade |
|-------|------------------|
| Maintainer de infra | Evolução do repo, review de PRs, ADRs |
| Desenvolvedores | Consumir outputs (URLs, credenciais via vault, variáveis de ambiente) |
| Agentes de IA | Seguir AGENTS.md, specs e rules ao implementar |

## Roadmap inicial

- [ ] Definir cloud provider e stack IaC (ver ADR-001)
- [ ] Spec detalhada de ambientes
- [ ] Módulos base (rede, compute, storage)
- [ ] Pipeline de CI/CD para plan/apply
- [ ] Integração com repositórios de aplicação

## Referências

- [Arquitetura](architecture.md)
- [Glossário](glossary.md)
- [ADRs](adr/)
