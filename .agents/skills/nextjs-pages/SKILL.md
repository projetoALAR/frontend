---
name: nextjs-pages
description: Creates new `app/` routes and page shells following the project's `Sidebar` + `Header` layout. Use when users say 'add page', 'create route', 'new dashboard screen', or edit `app/page.tsx`, `app/tasks/page.tsx`, `app/analytics/page.tsx`, `app/calendar/page.tsx`, `app/chat/page.tsx`, `app/clients/page.tsx`, `app/team/page.tsx`, `app/settings/page.tsx`, `app/help/page.tsx`, or `app/logout/page.tsx`. Do NOT use for small component-only tweaks.
---
# nextjs-pages

## Critical

- Always build new routes as App Router pages under `app/<route>/page.tsx` and match the existing dashboard shell pattern used across the project.
- Do not invent a new layout system. Reuse the same `Sidebar` + `Header` page structure already present in the app routes.
- Before writing a new page, inspect the nearest existing route page and mirror its imports, wrapper order, and section spacing exactly.
- If the page is only a component change inside an existing route, do not create a new route file.
- Verify the route already exists or that the new folder name matches the intended URL segment before proceeding.

## Instructions

1. **Find the closest route pattern**
   - Open one of these existing pages that matches the target screen:
     - `app/page.tsx`
     - `app/tasks/page.tsx`
     - `app/analytics/page.tsx`
     - `app/calendar/page.tsx`
     - `app/chat/page.tsx`
     - `app/clients/page.tsx`
     - `app/team/page.tsx`
     - `app/settings/page.tsx`
     - `app/help/page.tsx`
     - `app/logout/page.tsx`
   - Copy the route’s shell structure, especially the order of the sidebar, header, and main content wrappers.
   - This step uses the output from the user request only.
   - **Verify the target route’s URL segment and page purpose before proceeding to the next step.**

2. **Create or update the route file in `app/`**
   - Add or edit `app/<route>/page.tsx`.
   - Use the same default export style as the existing route page.
   - Keep the component named as a page-level React function, consistent with the route file.
   - Match the existing import style from nearby pages; do not introduce alternate aliases or new path conventions.
   - This step uses the output from Step 1.
   - **Verify the file path is exactly `app/<route>/page.tsx` before proceeding to the next step.**

3. **Wrap the page with the existing app shell**
   - Reuse the existing `Sidebar` + `Header` composition from other route pages.
   - Preserve the same outer container structure, spacing, and page background conventions used in the dashboard routes.
   - Put the route-specific content inside the same main content area used by sibling pages.
   - Do not move the sidebar into the page body if the existing routes keep it at the page shell level.
   - This step uses the output from Step 2.
   - **Verify the sidebar and header appear in the same order as the reference route before proceeding to the next step.**

4. **Add route-specific content using the project’s UI patterns**
   - Place page content inside the main section using the same component patterns already present in `components/` and `components/ui/`.
   - Prefer shadcn/ui primitives already used elsewhere in the app for cards, buttons, dialogs, tabs, and forms.
   - Use Lucide React icons the same way the existing pages do.
   - Keep headings, subheadings, and CTA placement consistent with sibling routes.
   - This step uses the output from Step 3.
   - **Verify the page content matches the app’s existing visual hierarchy before proceeding to the next step.**

5. **Handle route-specific loading, empty, and logout states the same way as existing pages**
   - If the page needs a special empty state, follow the structure already used in the relevant `components/<area>/` folder.
   - For logout or redirect-style pages, mirror the existing `app/logout/page.tsx` behavior exactly.
   - Do not add unrelated data fetching unless the route already uses it.
   - This step uses the output from Step 4.
   - **Verify any route state or navigation behavior matches the existing page family before proceeding to the next step.**

6. **Check imports and file organization**
   - Keep route-only logic inside `app/<route>/page.tsx` unless the code clearly belongs in `components/<area>/`.
   - If you extract pieces, place reusable pieces in the matching feature folder under `components/` rather than inside `app/`.
   - Use the same relative import style and ordering as the surrounding code.
   - This step uses the output from Step 5.
   - **Verify there are no unused imports and no new path conventions before proceeding to the next step.**

7. **Validate the route**
   - Run the app and confirm the page renders at the intended route.
   - Check for layout regressions in the sidebar/header shell and spacing.
   - If the project has a local build or lint step for route changes, run it before finishing.
   - This step uses the output from Step 6.
   - **Verify the page loads without runtime errors before marking the task complete.**

## Examples

- **User says:** “Add a new team dashboard page”
  - **Actions taken:** Create `app/team/page.tsx`, mirror the shell from `app/tasks/page.tsx`, keep the `Sidebar` + `Header` wrapper, then add team-specific cards inside the main content area using existing UI components.
  - **Result:** A new route that looks and behaves like the rest of the dashboard pages.

- **User says:** “Create a new help route”
  - **Actions taken:** Update `app/help/page.tsx`, preserve the current page shell, and place help content in the same layout structure as other app pages.
  - **Result:** The help screen matches the established dashboard UI without changing shared layout behavior.

## Common Issues

- **If you see `Module not found` for a UI component:**
  1. Check whether the component already exists in `components/ui/`.
  2. Match the import path used by neighboring pages.
  3. If the component is feature-specific, create it in `components/<area>/` instead of `app/`.

- **If you see `Hydration failed because the initial UI does not match what was rendered on the server`:**
  1. Compare the new page shell to a working route page.
  2. Remove client-only branching from the top-level page shell.
  3. Keep browser-only logic inside a child component if the existing routes do the same.

- **If the route renders but the sidebar/header layout looks wrong:**
  1. Reopen `app/tasks/page.tsx` or the closest sibling route.
  2. Restore the same wrapper order and container classes.
  3. Ensure the main content section is nested in the same place as the reference page.

- **If the page shows blank content after a route change:**
  1. Confirm the file is named `page.tsx` inside the correct `app/<route>/` directory.
  2. Verify the folder name matches the intended URL segment exactly.
  3. Restart the dev server if the route was newly added and not picked up immediately.

- **If you see `Cannot update a component while rendering a different component`:**
  1. Check for navigation or state updates happening directly in the page render body.
  2. Move side effects into `useEffect` in a child client component if needed.
  3. Keep the route page itself focused on layout and composition.