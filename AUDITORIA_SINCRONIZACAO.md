# AUDITORIA — sincronização front ↔ API

> **Status:** arquivado em 01/09/2026. O conteúdo abaixo era de uma auditoria inicial (mock / `shared-data.ts`).
> O MVP atual usa API real em clientes, casos, documentos, agenda, equipe, chat, inbox, relatórios e configurações.
> Para pendências atuais, use [`ROADMAP.md`](../../ROADMAP.md) e [`RUNBOOK.md`](../../RUNBOOK.md).

## Resumo do que mudou desde a auditoria original

| Área | Antes | Agora |
|------|-------|-------|
| Casos (CRUD) | Mock | `processos-api` + paginação server-side |
| Clientes | Mock | `clientes-api` + paginação server-side |
| Upload documentos | Não | Supabase + signed URLs |
| Chat IA | Sem backend | `chat-api` com citações, quota, feedback |
| Dashboard | Hardcoded | `useDashboardResumo` (API) |
| Relatórios export | Botão vazio | CSV/PDF em `/relatorios` |
| Settings | Alerts | `preferencias-api` (perfil, foto, notificações) |
| Equipe / inbox | Mock | API integrada |

## Pendências operacionais (não são bugs de sync)

- Staging Supabase separado de produção
- `seed:demo` protegido contra banco remoto (ver `DEMO.md`)
- Domínio verificado no Resend (e-mail a qualquer destinatário)
- Provedor comercial de andamentos (antes de cobrança)
- Billing / Asaas — decisão com Luiz (fora deste ciclo)

---

*Documento mantido só como histórico. Não use a checklist numerada abaixo — está desatualizada.*

<details>
<summary>Checklist original (desatualizada)</summary>

A auditoria original listava 32 itens com ~44% de integração. A maior parte foi resolvida nas branches `feat/integracao-api` e `master`.

</details>
