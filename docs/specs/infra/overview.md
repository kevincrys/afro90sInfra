# Spec: Infraestrutura — Overview

**Status:** Rascunho  
**Última atualização:** 2025-06-23

## Objetivo

Definir requisitos de alto nível para a infraestrutura Afro90s antes da implementação em IaC.

## Requisitos

### Ambientes

- [ ] Três ambientes: `dev`, `staging`, `production`
- [ ] Isolamento entre ambientes (conta, VPC ou equivalente)
- [ ] Naming convention: `afro90s-{env}-{recurso}`

### Segurança

- [ ] Nenhum secret commitado no repositório
- [ ] IAM/policies com least privilege
- [ ] Tags obrigatórias em recursos: `project`, `env`, `managed-by`

### CI/CD

- [ ] Pipeline executa validação em todo PR
- [ ] `plan` automático em PRs que alteram IaC
- [ ] `apply` em `staging` após merge; `production` com aprovação manual

### Outputs para aplicações

- [ ] Documentar outputs exportados (URLs, ARNs, referências a secrets)
- [ ] Variáveis de ambiente padronizadas por ambiente

## Stack (a definir)

| Componente | Opções em avaliação | Decisão |
|------------|---------------------|---------|
| Cloud | AWS, GCP, Azure | — |
| IaC | Terraform, Pulumi, CDK | — |
| CI | GitHub Actions | — |
| Secrets | AWS Secrets Manager, Vault, etc. | — |

> Quando a stack for escolhida, registrar em novo ADR e atualizar esta spec.

## Critérios de aceite (fase 1)

1. Ambiente `dev` provisionável via IaC a partir deste repo
2. Documentação de outputs disponível para devs de aplicação
3. Pipeline de CI com validate + plan funcionando

## Referências

- [Arquitetura](../../foundation/architecture.md)
- [ADR-001](../../foundation/adr/001-repo-structure.md)
