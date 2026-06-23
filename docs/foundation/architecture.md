# Arquitetura — afro90sInfra

> Documento vivo. Atualize quando ADRs ou specs alterarem a arquitetura.

## Visão geral

```
┌─────────────────────────────────────────────────────────┐
│                    Repositório afro90sInfra              │
│  docs/foundation  │  docs/specs  │  .cursor/rules       │
│  ─────────────────┼──────────────┼──────────────────────  │
│  (IaC — a definir: Terraform, Pulumi, CDK, etc.)        │
└──────────────────────────┬──────────────────────────────┘
                           │ provisiona
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Cloud Provider (a definir)                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────────┐              │
│  │   dev   │  │ staging │  │ production  │              │
│  └─────────┘  └─────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────┘
                           │ expõe outputs
                           ▼
┌─────────────────────────────────────────────────────────┐
│           Repositórios de aplicação Afro90s              │
│         (consomem endpoints, secrets, env vars)          │
└─────────────────────────────────────────────────────────┘
```

## Ambientes

| Ambiente | Propósito | Isolamento |
|----------|-----------|------------|
| **dev** | Desenvolvimento e experimentação | Conta/VPC separada ou namespace isolado |
| **staging** | Validação pré-produção | Espelha production em escala reduzida |
| **production** | Tráfego real | Máximo isolamento e controle de mudanças |

Detalhes de recursos por ambiente: [spec de infra](../specs/infra/overview.md).

## Camadas (planejadas)

### 1. Rede

- VPC, subnets públicas/privadas
- Security groups / firewall rules
- DNS e certificados (quando aplicável)

### 2. Compute

- Serviços de execução (containers, serverless ou VMs — a definir)
- Auto-scaling e health checks

### 3. Dados

- Bancos gerenciados, caches, object storage
- Backups e retenção por ambiente

### 4. Identidade e acesso

- IAM roles/policies com least privilege
- Secrets em vault gerenciado (não no Git)
- CI/CD com OIDC ou credenciais rotacionadas

### 5. Observabilidade

- Logs centralizados
- Métricas e alertas
- Rastreamento (se necessário)

## Fluxo de deploy (alvo)

```
PR → CI (lint, validate, plan) → Review → Merge → CD (apply staging) → Promo manual → production
```

Implementação concreta depende da stack escolhida (ver ADRs).

## Dependências externas

| Sistema | Uso |
|---------|-----|
| GitHub | Versionamento, CI/CD, PRs |
| Cloud provider | Hospedagem de recursos |
| Registry de secrets | Credenciais e chaves |

## Decisões registradas

| ADR | Título | Status |
|-----|--------|--------|
| [001](adr/001-repo-structure.md) | Estrutura de documentação do repositório | Aceito |

## Próximos passos arquiteturais

1. Escolher cloud provider e ferramenta IaC (novo ADR)
2. Definir topologia de rede
3. Especificar outputs consumidos pelas apps Afro90s
