# AGENTS.md

## project context
- next.js 16 app router in `app/` with shared chrome in `components/dashboard/`.
- ui primitives live in `components/ui/` and wrap `radix`, `shadcn/ui`, `class-variance-authority`, and `cn` from `lib/utils.ts`.
- shared dashboard data comes from `lib/shared-data.ts` and dashboard API helpers in `lib/dashboard-api.ts`; prefer updating them over duplicating mock arrays.
- global styles and tokens live in `app/globals.css`; legacy copy in `styles/globals.css` should stay untouched unless the app imports it.
- package metadata and scripts live in `package.json`; workspace and build settings live in `pnpm-workspace.yaml`, `next.config.mjs`, `postcss.config.mjs`, and `tsconfig.json`.
- keep user-facing text in pt-br, matching the existing app copy and the project learning.

## common commands
```bash
pnpm dev
pnpm build
pnpm lint
```

## app structure
- pages use `Sidebar` from `components/dashboard/sidebar.tsx` plus `Header` from `components/dashboard/header.tsx` where applicable.
- dashboard cards and counts should read from `lib/shared-data.ts` helpers like `getTotalCases()` and `getCompletionPercentage()`.
- forms use local modal components such as `components/tasks/case-modal.tsx`, `components/clients/client-modal.tsx`, and `components/team/team-member-modal.tsx`.
- route-level exports stay in `app/page.tsx`, `app/tasks/page.tsx`, `app/analytics/page.tsx`, `app/calendar/page.tsx`, `app/chat/page.tsx`, `app/clients/page.tsx`, `app/team/page.tsx`, `app/settings/page.tsx`, `app/help/page.tsx`, and `app/logout/page.tsx`.

## ui conventions
- compose inputs with `components/ui/input.tsx`, `components/ui/label.tsx`, `components/ui/dialog.tsx`, `components/ui/sheet.tsx`, and `components/ui/button.tsx`.
- prefer `sonner` via `components/ui/sonner.tsx` and `useToast()` from `hooks/use-toast.ts` for transient feedback.
- use `next/navigation` for client-side routing in `app/page.tsx`, `app/tasks/page.tsx`, and `components/dashboard/header.tsx`.

## validation and state
- keep form validation local and explicit, as in `components/tasks/case-modal.tsx` and `components/clients/client-modal.tsx`.
- use `use client` only in interactive files that need hooks, browser APIs, or event handlers.
- prefer `type` aliases and `interface` props near the component they describe; avoid `any` in new code.

## integration points
- `@vercel/analytics` is already wired in `app/layout.tsx`; keep analytics-safe navigation and avoid breaking `Analytics` mount.
- `components.json` defines aliases for `@/components`, `@/lib`, and `@/hooks`; use them consistently.
- if changes touch shared learning sync, inspect `.claude/hooks/caliber-*.sh` and related Caliber flows referenced by `AUDITORIA_SINCRONIZACAO.md`.

## working rules
- run `pnpm lint` after edits to `app/`, `components/`, `hooks/`, or `lib/`.
- keep classnames consistent with `Tailwind CSS` tokens from `app/globals.css`.
- do not add duplicate mock datasets when `lib/shared-data.ts` can provide the values.

<!-- caliber:managed:pre-commit -->
## Before Committing

**IMPORTANT:** Before every git commit, you MUST ensure Caliber syncs agent configs with the latest code changes.

First, check if the pre-commit hook is already installed:
```bash
grep -q "caliber" .git/hooks/pre-commit 2>/dev/null && echo "hook-active" || echo "no-hook"
```

- If **hook-active**: the hook handles sync automatically — just commit normally. Tell the user: "Caliber will sync your agent configs automatically via the pre-commit hook."
- If **no-hook**: run Caliber manually before committing:
  1. Tell the user: "Caliber: Syncing agent configs with your latest changes..."
  2. Run: `caliber refresh && git add CALIBER_LEARNINGS.md .cursor/ .cursorrules AGENTS.md .agents/ 2>/dev/null`
  3. After it completes, briefly tell the user what Caliber updated. Then proceed with the commit.

**Valid `caliber refresh` options:** `--quiet` (suppress output) and `--dry-run` (preview without writing). Do not pass any other flags — options like `--auto-approve`, `--debug`, or `--force` do not exist and will cause errors.

**`caliber config`** takes no flags — it runs an interactive provider setup. Do not pass `--provider`, `--api-key`, or `--endpoint`.

If `caliber` is not found, read `.agents/skills/setup-caliber/SKILL.md` and follow its instructions to install Caliber.
<!-- /caliber:managed:pre-commit -->

<!-- caliber:managed:learnings -->
## Session Learnings

Read `CALIBER_LEARNINGS.md` for patterns and anti-patterns learned from previous sessions.
These are auto-extracted from real tool usage — treat them as project-specific rules.
<!-- /caliber:managed:learnings -->

<!-- caliber:managed:model-config -->
## Model Configuration

Recommended default: `claude-sonnet-4-6` with high effort (stronger reasoning; higher cost and latency than smaller models).
Smaller/faster models trade quality for speed and cost — pick what fits the task.
Pin your choice (`/model` in Claude Code, or `CALIBER_MODEL` when using Caliber with an API provider) so upstream default changes do not silently change behavior.

<!-- /caliber:managed:model-config -->

<!-- caliber:managed:sync -->
## Context Sync

This project uses [Caliber](https://github.com/caliber-ai-org/ai-setup) to keep AI agent configs in sync across Claude Code, Cursor, Copilot, and Codex.
Configs update automatically before each commit via `caliber refresh`.
If the pre-commit hook is not set up, read `.agents/skills/setup-caliber/SKILL.md` and follow the setup instructions.
<!-- /caliber:managed:sync -->
