# Task 12 — Secrets e SSM Parameter Store

**Status:** pendente  
**Arquivos alvo:** [`outputs.md`](../outputs.md); [`overview.md`](../overview.md) — segurança

## Objetivo

Definir o que fica em SSM/Secrets Manager vs CDK context vs variáveis não sensíveis na Lambda.

## Decisões a tomar

- [ ] SSM vs Secrets Manager para e-mails e WhatsApp number
- [ ] `VITE_WHATSAPP_NUMBER`: injetado no build CI do frontend (não é secret) — confirmar
- [ ] `ADMIN_EMAIL`, `SES_FROM_EMAIL`: SSM path sugerido `/afro90s/{env}/...`
- [ ] Parâmetros criados manualmente antes do deploy vs CDK `StringParameter`
- [ ] Rotação de secrets na v1 — fora de escopo?
- [ ] `.env` local para dev: `.gitignore` + exemplo `.env.example` sem valores

## Checklist de refinamento

- [ ] Tabela parâmetro → tipo → quem cria → quem consome
- [ ] IAM Lambda: `ssm:GetParameter` escopo por ARN/path
- [ ] Documentar setup manual pré-primeiro-deploy
- [ ] Alinhar com task [10-iam-security.md](10-iam-security.md)

## Notas / rascunho

<!-- Edite aqui -->

## Quando concluir

- [ ] Atualizar `outputs.md` e `overview.md`
- [ ] Marcar **Status** como `concluída`
