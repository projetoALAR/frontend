---
name: shared-data-sync
description: Keeps dashboard counts, cards, and lists synced through real APIs (`lib/dashboard-api.ts`, `hooks/use-dashboard-resumo.ts`). Use when users say "update metrics", "sync sidebar badge", "fix stats", "recent cases", or modify `components/dashboard/*` or `components/analytics/*`. Do NOT use for unrelated styling work.
---
# shared-data-sync

## Critical
- Dashboard/analytics data comes from the Nest API via `lib/dashboard-api.ts` and `hooks/use-dashboard-resumo.ts` (plus related `lib/*-api.ts`). Do **not** invent local mock datasets.
- Prefer updating the API contract / mapper over duplicating derived counts in components.
- Before editing a dashboard component, check whether the value already comes from `useDashboardResumo` or a `*-api` helper.

## Instructions
1. Identify the metric or list in the UI and find its source in `lib/dashboard-api.ts` / the corresponding hook.
2. Update the backend aggregation or the frontend mapper if the shape must change.
3. Wire the component to the shared hook/API export; remove any leftover hardcoded totals.
4. Run `pnpm lint` after edits under `app/`, `components/`, `hooks/`, or `lib/`.
