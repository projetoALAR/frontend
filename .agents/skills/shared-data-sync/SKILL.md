---
name: shared-data-sync
description: Keeps dashboard counts, cards, and lists synced through `lib/shared-data.ts`. Use when users say "update metrics", "sync sidebar badge", "fix stats", "recent cases", or modify `components/dashboard/sidebar.tsx`, `components/dashboard/stats-cards.tsx`, `components/dashboard/project-list.tsx`, `components/dashboard/project-progress.tsx`, `components/dashboard/reminders.tsx`, `components/dashboard/team-summary-card.tsx`, or `components/analytics/analytics-content.tsx`. Do NOT use for unrelated styling work.
---
# shared-data-sync

## Critical
- `lib/shared-data.ts` is the source of truth for shared dashboard/analytics data. If counts, labels, badges, lists, or progress values change in one dashboard component, update the shared data model first and then consume it everywhere else.
- Do not duplicate derived counts inside `components/dashboard/*` or `components/analytics/*`. Reuse the exported shared arrays/objects from `lib/shared-data.ts`.
- Before editing any dashboard component, verify whether the requested value already exists in `lib/shared-data.ts`. If it does, wire the component to that value instead of adding new local constants.

## Instructions
1. Open `lib/shared-data.ts` and identify the exact exported data structure used by the affected view.
   - Check for the existing exported arrays/objects that drive metrics, sidebar badges, recent items, progress, reminders, and summary cards.
   - Match the shape already used by the components under `components/dashboard/` and `components/analytics/`.
   - Verify the target value exists in `lib/shared-data.ts` before proceeding to the next step.
   - This step establishes the source data that Step 2 will read from.

2. Update the shared data in `lib/shared-data.ts` first, using the same naming and object shape already present in the file.
   - Keep field names consistent with the current export format; do not invent new keys when an existing key already represents the data.
   - If adding a new metric or list item, add it to the shared export rather than hardcoding it in a component.
   - Verify the exported data still matches the existing component expectations before proceeding to the next step.
   - This step uses the output from Step 1.

3. Update the dashboard component that renders the shared data so it imports from `lib/shared-data.ts` instead of defining local duplicates.
   - For `components/dashboard/sidebar.tsx`, ensure badge/count values come from the shared source.
   - For `components/dashboard/stats-cards.tsx`, ensure summary numbers, deltas, and labels come from the shared source.
   - For `components/dashboard/project-list.tsx` and `components/dashboard/project-progress.tsx`, ensure item counts and progress values are derived from the shared source.
   - For `components/dashboard/reminders.tsx` and `components/dashboard/team-summary-card.tsx`, ensure item lists and totals are mapped from shared data.
   - Verify the component renders without local fallback constants before proceeding to the next step.
   - This step uses the output from Step 2.

4. Update `components/analytics/analytics-content.tsx` if the change affects analytics totals, trend cards, or summary lists.
   - Keep the analytics content aligned with the same shared data used by the dashboard so counts cannot drift.
   - Prefer deriving totals and labels from the same shared export rather than repeating arithmetic in the component.
   - Verify the analytics values match the dashboard source before proceeding to the next step.
   - This step uses the output from Step 2.

5. Check any dependent dashboard components for cross-view consistency.
   - If the change affects sidebar badges, verify `components/dashboard/sidebar.tsx` and the related count source show the same number.
   - If the change affects recent items or project totals, verify `components/dashboard/project-list.tsx`, `components/dashboard/project-progress.tsx`, and any summary card using the same data all reflect the update.
   - Verify every affected component reads the same shared value before proceeding to validation.
   - This step uses the output from Steps 2–4.

6. Validate the sync end-to-end by running the project checks used for UI changes in this repository.
   - At minimum, run the app and inspect the affected dashboard/analytics route in the browser.
   - If the repo has a lint or typecheck script, run it after the code change and fix any import or type errors caused by the shared-data update.
   - Verify the UI shows the same counts and labels across all affected cards, lists, and badges before finishing.
   - This step uses the output from Steps 3–5.

## Examples
- User says: "sync sidebar badge and fix stats counts"
  - Actions taken: Update the badge/count source in `lib/shared-data.ts`, then wire `components/dashboard/sidebar.tsx` and `components/dashboard/stats-cards.tsx` to that shared export.
  - Result: The sidebar badge and stats cards show the same count everywhere, with no duplicated constants.

- User says: "update recent cases"
  - Actions taken: Change the cases array in `lib/shared-data.ts`, then update `components/dashboard/project-list.tsx` and any related progress/reminder cards to read from the same list.
  - Result: The recent cases list, project progress, and summary counts stay in sync.

## Common Issues
- If you see mismatched numbers between the sidebar and stats cards: 1. Check whether one component still uses a local constant 2. Move that value into `lib/shared-data.ts` 3. Re-import the shared export in `components/dashboard/sidebar.tsx` and `components/dashboard/stats-cards.tsx`.
- If you see `Cannot find module '../lib/shared-data'` or similar import errors: 1. Verify the import path from the component file to `lib/shared-data.ts` 2. Match the existing relative import style used elsewhere in the repo 3. Re-run typecheck.
- If a list renders empty after a sync change: 1. Confirm the object shape in `lib/shared-data.ts` still matches the `.map()` access pattern in `components/dashboard/project-list.tsx`, `components/dashboard/reminders.tsx`, or `components/dashboard/team-summary-card.tsx` 2. Restore the expected keys 3. Verify the component is reading the shared export, not a renamed field.
- If analytics totals disagree with dashboard counts: 1. Check `components/analytics/analytics-content.tsx` for hardcoded totals 2. Replace them with values derived from `lib/shared-data.ts` 3. Confirm both views read the same shared source.
- If you see a stale badge after editing shared data: 1. Search `components/dashboard/*` for the old value 2. Remove duplicate constants 3. Restart the dev server if the UI cache is holding old data.