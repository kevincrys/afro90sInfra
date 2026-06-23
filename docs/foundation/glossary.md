# Glossário — Afro90s / afro90sInfra

Termos usados neste repositório e no ecossistema Afro90s.

| Termo | Definição |
|-------|-----------|
| **Afro90s** | Projeto principal. Este repo (`afro90sInfra`) cuida apenas da camada de infraestrutura. |
| **afro90sInfra** | Repositório de infraestrutura como código e documentação de infra do Afro90s. |
| **IaC** | Infrastructure as Code — infra definida em arquivos versionados (Terraform, Pulumi, etc.). |
| **ADR** | Architecture Decision Record — documento curto que registra uma decisão, contexto e consequências. |
| **Spec** | Especificação técnica ou funcional descrevendo *o que* deve existir ou se comportar. |
| **Ambiente** | Instância isolada de infra (`dev`, `staging`, `production`). |
| **Foundation** | Documentação de fundamentação: visão, arquitetura, glossário, ADRs. |
| **Output** | Valor exportado pela infra para consumo externo (URL, ARN, connection string via secret). |
| **Least privilege** | Princípio de conceder apenas permissões mínimas necessárias. |
| **Plan / Apply** | Ciclo IaC: `plan` previewa mudanças; `apply` executa no ambiente alvo. |

## Adicionar termos

Ao introduzir conceito novo recorrente no projeto, adicione uma linha nesta tabela via PR.
