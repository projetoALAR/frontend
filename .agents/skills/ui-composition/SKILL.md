---
name: ui-composition
description: Builds reusable UI with `components/ui/` primitives, `cn`, Radix, and shadcn patterns. Use when users say 'make a card', 'add a dialog', 'new select', 'build sidebar item', or touch `components/ui/*.tsx`, `components/dashboard/*.tsx`, `components/chat/*.tsx`, `components/tasks/*.tsx`, `components/clients/*.tsx`, `components/team/*.tsx`, or `components/calendar/*.tsx`. Do NOT use for pure data or route logic.
---
# UI Composition

## Critical

- Use the existing shadcn-style component patterns from `components/ui/*` before creating new UI primitives.
- Prefer composition over custom one-off markup: build screens from `components/ui/` primitives, Radix wrappers, and small local components in the feature directory.
- Always use `cn` for class merging instead of string concatenation.
- Keep client-only interactive UI in files that already use hooks, event handlers, or Radix components; do not add unnecessary logic to server-only files.
- Verify the component contract and existing prop patterns in nearby files before writing new UI. Do not invent new variants, slot APIs, or class names if an equivalent pattern already exists.

## Instructions

1. **Inspect the closest existing UI pattern first**
   - Check the nearest feature folder before writing anything:
     - `components/dashboard/*`
     - `components/chat/*`
     - `components/tasks/*`
     - `components/clients/*`
     - `components/team/*`
     - `components/calendar/*`
     - or `components/ui/*` for reusable primitives.
   - Mirror the structure already used there: import style, component naming, prop shape, and class composition.
   - Use the output from this step to decide whether the new UI should be a reusable primitive in `components/ui/` or a feature-specific component.
   - Verify the nearest existing component compiles and already expresses the same interaction before proceeding to the next step.

2. **Choose the correct file location and naming convention**
   - Put reusable primitives in `components/ui/<name>.tsx`.
   - Put feature UI in the matching feature folder, e.g.:
     - `components/dashboard/<name>.tsx`
     - `components/chat/<name>.tsx`
     - `components/tasks/<name>.tsx`
     - `components/clients/<name>.tsx`
     - `components/team/<name>.tsx`
     - `components/calendar/<name>.tsx`
   - Follow the existing kebab-to-Pascal component naming style used throughout the app: filename in lowercase, exported component in PascalCase.
   - This step uses the output from Step 1 to keep the component in the same layer as the surrounding code.
   - Verify the target file path matches the existing folder conventions before proceeding to the next step.

3. **Reuse shadcn/Radix primitives instead of rebuilding controls**
   - For dialogs, selects, tabs, toasts, dropdowns, checkboxes, toggles, tooltips, popovers, scroll areas, radio groups, and accordions, use the corresponding primitives already installed in the project:
     - `@radix-ui/react-dialog`
     - `@radix-ui/react-select`
     - `@radix-ui/react-tabs`
     - `@radix-ui/react-dropdown-menu`
     - `@radix-ui/react-tooltip`
     - `@radix-ui/react-popover`
     - `@radix-ui/react-checkbox`
     - `@radix-ui/react-switch`
     - `@radix-ui/react-toast`
     - and other Radix packages already listed in the project dependencies.
   - Wrap them in the same API style used by `components/ui/*` rather than exposing raw Radix props directly in feature code.
   - If the control already exists in `components/ui/`, import it from there instead of recreating it.
   - Verify the primitive already exists in `components/ui/` or is used consistently in nearby files before proceeding to the next step.

4. **Use `cn` for every class merge**
   - Import `cn` from the project’s shared utility location used by existing UI components.
   - Merge base styles, conditional styles, and passed `className` with `cn(...)`.
   - Do not use template strings for Tailwind class assembly when a component accepts `className`.
   - This step uses the output from Step 2 and Step 3 to keep the component styling consistent with the rest of the UI.
   - Verify every conditional class and `className` merge uses `cn` before proceeding to the next step.

5. **Follow the existing component API style**
   - Keep props minimal and predictable:
     - `className?: string`
     - `children?: React.ReactNode`
     - feature-specific props only when needed
   - When the component wraps Radix, forward refs and preserve the same signature style used in `components/ui/*`.
   - Match existing export style in the file you copied from: default export only if that is already the pattern in the feature folder; otherwise use named exports.
   - This step uses the output from Step 1 and Step 4 to preserve the same public interface as the rest of the project.
   - Verify the prop names and exports match the local pattern before proceeding to the next step.

6. **Build layouts with Tailwind utilities already used in the project**
   - Compose with utility classes rather than custom CSS unless the feature already depends on a file in `styles/`.
   - Keep spacing, border, radius, background, and text utilities aligned with nearby components.
   - Use existing layout patterns for cards, panels, sidebars, and list items in `components/dashboard/*` and related folders.
   - This step uses the output from Step 2 and Step 5 to make the component look native to the app.
   - Verify the new component visually matches the surrounding components before proceeding to the next step.

7. **Wire interactivity the same way existing feature components do**
   - If the UI needs state, use the same React hook style already present in nearby components.
   - Keep state local to the component unless a nearby pattern lifts it higher.
   - For dismissible UI, forms, or overlays, use the same event handler names and prop callbacks already seen in the local folder.
   - This step uses the output from Step 5 and Step 6 to connect behavior without changing the component shape.
   - Verify the interaction pattern matches the nearest sibling component before proceeding to the next step.

8. **Validate by checking the exact file and import boundaries**
   - Ensure imports come from the same kinds of sources used elsewhere in the repo:
     - shared UI from `components/ui/*`
     - feature-local UI from the same feature folder
     - helpers from `lib/` or the shared utility path used by the project
   - Confirm no route logic, fetch logic, or unrelated data transformation leaked into the UI component.
   - Run the project’s existing typecheck or build command used in the workspace after adding the component.
   - Verify the file typechecks and the component stays focused on presentation before finishing.

## Examples

### Example 1: Add a dialog action panel
- **User says**: “Add a dialog for creating a task.”
- **Actions taken**:
  1. Inspect `components/tasks/*` for an existing form/dialog pattern.
  2. Reuse `components/ui/dialog.tsx`, `components/ui/button.tsx`, `components/ui/input.tsx`, and `components/ui/label.tsx` if present.
  3. Create `components/tasks/create-task-dialog.tsx` with a compact wrapper around the dialog primitive.
  4. Merge conditional classes with `cn`.
  5. Keep the dialog state local and expose a small `open/onOpenChange` API if the nearby code uses that shape.
- **Result**: A feature-local dialog component that matches the app’s existing shadcn/Radix style and can be reused in the tasks page.

### Example 2: Add a sidebar item
- **User says**: “Make a reusable sidebar item for the team panel.”
- **Actions taken**:
  1. Check `components/team/*` and `components/dashboard/*` for list-item or nav-item patterns.
  2. Create `components/team/sidebar-item.tsx` instead of adding custom CSS.
  3. Use `cn` to merge selected/hover states.
  4. Keep the component presentational and pass the click behavior through props.
- **Result**: A reusable sidebar item that fits the existing feature-folder pattern and can be dropped into the team UI.

## Common Issues

- **If you see `Cannot find module '@/components/ui/...':`**
  1. Confirm the primitive exists in `components/ui/`.
  2. If it does, copy the import path pattern from a neighboring file in the same folder.
  3. If it does not, create the primitive in `components/ui/` first, then import it from the feature component.

- **If you see `cn is not defined` or `Cannot find name 'cn'`:**
  1. Check a nearby component in `components/ui/*` for the correct import path.
  2. Add the same `cn` import used by the project’s existing UI files.
  3. Replace string concatenation with `cn(...)` for all conditional classes.

- **If you see `React Hook ... is called in a function that is neither a React function component nor a custom React Hook function`:**
  1. Move hook usage into a component file in `components/*`.
  2. Do not call hooks from helper functions or static config files.
  3. Verify the file is structured like the closest interactive component before continuing.

- **If a Radix component renders but styles look broken or unstyled:**
  1. Check whether the project’s wrapper in `components/ui/*` was imported instead of the raw Radix package.
  2. Confirm the wrapper includes the expected Tailwind classes and `cn` usage.
  3. Replace raw usage with the existing shadcn-style wrapper.

- **If you see `Property 'className' does not exist on type ...`:**
  1. Add `className?: string` to the component props if the local pattern allows it.
  2. Merge it through `cn` on the root element.
  3. Verify sibling components expose the same override pattern before changing the API.

- **If a component compiles but the UI looks unlike the rest of the app:**
  1. Compare spacing, border radius, and typography against the nearest file in `components/dashboard/*`, `components/tasks/*`, or `components/ui/*`.
  2. Replace custom values with the same Tailwind tokens already used nearby.
  3. Re-run the relevant typecheck/build step and inspect the rendered result.