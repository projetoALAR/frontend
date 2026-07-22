---
name: nextjs-pages
description: Creates new `app/` routes and page shells using the project's `Sidebar` + `Header` layout, shared shell components, and page-level section patterns. Use when users say 'add page', 'create route', 'new dashboard screen', or edit `app/page.tsx`, `app/tasks/page.tsx`, `app/analytics/page.tsx`, `app/calendar/page.tsx`, `app/chat/page.tsx`, `app/clients/page.tsx`, `app/team/page.tsx`, `app/settings/page.tsx`, `app/help/page.tsx`, or `app/logout/page.tsx`. Do NOT use for small component-only tweaks or isolated UI changes inside `components/`.
---
# nextjs-pages

## Critical

- Always inspect the existing route you are extending before writing a new one. This project already uses page shells in `app/` that compose shared layout pieces from `components/` instead of building route-local wrappers.
- Keep route files thin: `app/**/page.tsx` should primarily assemble imported components, not contain large inline UI blocks.
- Preserve the project’s dashboard layout pattern: `Sidebar` + `Header` surrounding the page content area.
- Do not add a new route shell if the user only needs a component tweak. For component-only work, edit the matching file in `components/**` instead.
- Verify the route’s imports and path aliases match surrounding pages before proceeding to implementation.

## Instructions

1. **Identify the target route and mirror an existing page shell**  
   Open the nearest existing route in `app/` that matches the requested screen, such as:
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
   Reuse the same structure and the same import style from that file. 
   **Verify** the route you are copying uses the `Sidebar` + `Header` shell before proceeding to the next step.

2. **Reuse shared shell components from `components/`**  
   Build the page from existing shared pieces in `components/dashboard/`, `components/*/`, and `components/ui/` rather than inventing a new layout. The route should compose the page content beneath the shared shell. Typical route files in this project import UI primitives and domain components from sibling feature folders rather than embedding everything locally.  
   **This step uses the output from Step 1. Verify** the needed shell pieces already exist in `components/` before proceeding.

3. **Create or update the route file in `app/**/page.tsx`**  
   If creating a new screen, add the route at the correct `app/<segment>/page.tsx` path. Keep the file focused on page assembly and export the page component as the default export. Use the same module style as neighboring pages in `app/`. If the page needs reusable sections, place them in `components/<feature>/` and import them into the route.  
   **This step uses the output from Step 2. Verify** the page file compiles with the same import patterns and structure as adjacent routes before proceeding.

4. **Match the page section structure used by existing dashboard screens**  
   Compose the page content in the same order the app already uses: shell first, then the main content area, then any route-specific sections. Keep section naming consistent with the feature folder (for example, `components/tasks/` for task screens, `components/analytics/` for analytics screens). Avoid introducing a new naming convention inside the route.  
   **This step uses the output from Step 3. Verify** the rendered hierarchy matches the project’s existing route structure before proceeding.

5. **Use project UI dependencies exactly as the codebase expects**  
   When a route needs UI controls, import them from the existing packages already used in this project: `@radix-ui/react-*`, `lucide-react`, `sonner`, and the local `components/ui/*` wrappers. Do not swap in a different design system or custom CSS approach when a shared component already exists.  
   **This step uses the output from Step 4. Verify** the chosen UI pieces already exist and are used elsewhere in the repo before proceeding.

6. **Keep styling aligned with Tailwind + existing CSS conventions**  
   Use the same Tailwind utility patterns found in the surrounding files. If a route requires custom styling, place shared styles in `styles/` or use existing utility classes inside the route/component files. Avoid introducing route-specific CSS files unless the repo already does so for that feature.  
   **This step uses the output from Step 5. Verify** the style class patterns match neighboring pages before proceeding.

7. **Validate the route by checking the exact file and route path**  
   Confirm the file exists at the intended `app/<segment>/page.tsx` location and that the page content matches the shell/layout pattern used in the repo. If the route is part of an existing section, ensure its sibling routes still share the same header/sidebar structure.  
   **This step uses the output from Step 6. Verify** the new route follows the existing page shell pattern before finishing.

## Examples

**User says:** “Add a new analytics page”  
**Actions taken:**
1. Inspect `app/analytics/page.tsx` and neighboring dashboard pages.
2. Reuse the same `Sidebar` + `Header` shell from the existing route.
3. Create/update `app/analytics/page.tsx` so it composes analytics-specific sections from `components/analytics/`.
4. Keep UI controls imported from `components/ui/` and `lucide-react` only if the existing page does so.
**Result:** A new analytics route that looks and behaves like the rest of the app’s dashboard pages.

**User says:** “Create a settings screen”  
**Actions taken:**
1. Open `app/settings/page.tsx`.
2. Mirror the same page shell and import style used by sibling routes.
3. Move any reusable settings sections into `components/settings/` and import them into the route.
4. Verify the page is still wrapped by the shared layout.
**Result:** A settings page consistent with the project’s existing `app/` route structure.

## Common Issues

- **If you see a route file with too much inline JSX in `app/**/page.tsx`:** move repeated or complex sections into `components/<feature>/` and keep the route file as a thin assembler.
- **If you see import path errors like `Cannot find module '@/components/...':`** compare the failing import with the patterns in neighboring pages under `app/` and use the same alias/style already used there.
- **If the page renders without the sidebar/header shell:** check that the route is composing the same shell components used by the existing dashboard pages instead of rendering content directly.
- **If the new page looks visually different from sibling screens:** copy the same Tailwind class patterns and spacing structure from the closest existing route, not from a generic Next.js template.
- **If a component-only change was made inside `app/**/page.tsx` but the route did not need new structure:** move the edit into the relevant `components/` file and keep the page shell unchanged.