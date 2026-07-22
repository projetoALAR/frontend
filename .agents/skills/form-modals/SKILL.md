---
name: form-modals
description: Creates and updates modal forms with local validation, controlled inputs, and success toasts. Use when users say 'add modal', 'create form', 'edit client', 'new case', 'add team member', or work in `components/tasks/case-modal.tsx`, `components/clients/client-modal.tsx`, `components/team/team-member-modal.tsx`, and `components/calendar/event-modal.tsx`. Do NOT use for read-only dialogs or non-form surfaces.
---
# form-modals

## Critical
- Use this skill only for modal **forms** that collect and submit data. Do **not** use it for read-only dialogs, confirmations without inputs, or non-modal pages.
- Before changing anything, inspect the matching existing modal file and mirror its structure exactly: controlled `open` state, local form state, `useEffect` sync from props, client-side validation, and `toast` on success.
- Always verify the component lives under the existing modal locations before proceeding:
  - `components/tasks/case-modal.tsx`
  - `components/clients/client-modal.tsx`
  - `components/team/team-member-modal.tsx`
  - `components/calendar/event-modal.tsx`
- If the modal uses shadcn/ui primitives, keep the same import style and component names used elsewhere in the repo (`Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `Input`, `Label`, `Textarea`, `Select`, `Button`, `toast`/`useToast`).
- Verify the form works in both create and edit flows before proceeding to the next step.

## Instructions
1. **Open the matching modal and copy its pattern exactly**
   - Inspect the nearest existing file first:
     - `components/tasks/case-modal.tsx`
     - `components/clients/client-modal.tsx`
     - `components/team/team-member-modal.tsx`
     - `components/calendar/event-modal.tsx`
   - Look for the exact prop shape, state names, and submit handler pattern.
   - Typical pattern to preserve:
     - `"use client"` at the top
     - Props like `open`, `onOpenChange`, `onSave`, and optional `initialData`
     - Local state created with `useState`
     - `useEffect` that resets state when `open` or `initialData` changes
   - Verify the existing modal’s props and imports before proceeding to the next step.

2. **Define the modal API to match the existing component family**
   - Use the same prop names already present in the relevant file.
   - Keep create/edit behavior in one component if the existing modal does so.
   - Reuse the same naming convention for the data object:
     - `case` forms usually use a case-shaped object
     - client forms usually use a client-shaped object
     - team member forms usually use a team-member-shaped object
     - event forms usually use an event-shaped object
   - This step uses the output from Step 1: copy the existing prop and data naming pattern exactly.
   - Verify the prop interface compiles against the current usage site before proceeding to the next step.

3. **Implement local controlled inputs with shadcn/ui components**
   - Use controlled inputs for every editable field.
   - Keep the same components already used in the repo for the same input type:
     - `Input` for text, email, phone, dates, and simple strings
     - `Textarea` for longer notes/descriptions
     - `Select` for predefined options
     - `Dialog`/`DialogContent` for the modal shell
     - `Button` for actions
   - Keep labels directly above each field with `Label`.
   - If the existing modal uses grouped fields, preserve the same grouping and spacing.
   - This step uses the output from Step 2: wire the fields to the exact local state shape from the modal API.
   - Verify every field updates local state before proceeding to the next step.

4. **Add local validation before submit**
   - Validate in the submit handler before calling the save callback or mutation.
   - Match the repo’s local validation style: simple inline checks and an error message if required fields are missing.
   - Block submission when required data is empty or invalid.
   - If the existing modal shows field errors inline, keep that same placement and message style.
   - This step uses the output from Step 3: validate the same state values that are bound to the inputs.
   - Verify invalid input does not trigger save before proceeding to the next step.

5. **Wire submit and close behavior to the existing save flow**
   - On submit, call the existing callback or action used by the surrounding feature.
   - Keep the same flow used in nearby modal files:
     - Prevent default form submission if the component uses a `<form>` wrapper
     - Save the current local state
     - Close the modal on success
     - Reset state when the modal closes if that is how the existing modal behaves
   - Do not introduce a new abstraction if the repo uses a direct callback.
   - This step uses the output from Step 4: submit only after validation passes.
   - Verify the modal closes only after a successful save before proceeding to the next step.

6. **Add success feedback with the project’s toast pattern**
   - Use the existing toast implementation already present in the codebase (`sonner`-style success toast if that is what the file uses).
   - Show a success toast after a successful create/update action.
   - Keep the message short and action-specific, matching the surrounding UI tone.
   - If the existing modal already has a toast call, copy its exact structure.
   - This step uses the output from Step 5: only toast after the save completes successfully.
   - Verify the toast fires once per successful submit before proceeding to the next step.

7. **Preserve form reset semantics between open/close cycles**
   - When the modal opens for a new record, initialize blank values.
   - When editing, preload values from `initialData` or the existing prop shape.
   - When closing, reset transient error state and any unsaved values if the current modal does so.
   - Keep this logic in `useEffect` and/or close handlers exactly where the existing modal places it.
   - This step uses the output from Step 6: reset only after the success path and close behavior are correct.
   - Verify reopening the modal shows the correct data for create vs edit before finishing.

8. **Check imports and formatting against the local file conventions**
   - Ensure imports follow the same order and package sources already used in the repo.
   - Prefer the same local component import paths used by the nearby modal files, such as `@/components/ui/*` if that is how the file already imports UI primitives.
   - Keep formatting consistent with the existing file and surrounding components.
   - Verify the final file matches adjacent modal style before considering the task done.

## Examples
**User says:** “Add a modal to create a new client.”

**Actions taken:**
1. Open `components/clients/client-modal.tsx` and mirror its `open`/`onOpenChange` props and local state.
2. Build controlled inputs with `Input`, `Label`, and `Select` for client fields.
3. Add inline validation in the submit handler.
4. Call the existing save callback, close the modal, and show a success toast.

**Result:**
- A client create/edit modal that behaves like the existing project modals and fits the same UI patterns.

## Common Issues
- **If you see `A component is changing an uncontrolled input to be controlled`**:
  1. Initialize every state field to a string, number, or empty value before render.
  2. In `useEffect`, coerce missing values from `initialData` to `""` instead of `undefined`.
  3. Verify the `value` prop on each `Input`/`Textarea` never receives `undefined`.

- **If you see `Cannot read properties of undefined (reading '...')` when opening edit mode**:
  1. Check the `useEffect` that copies `initialData` into local state.
  2. Guard against missing `initialData` before dereferencing nested fields.
  3. Verify the parent passes the same object shape used by the modal file.

- **If the modal closes but the form reopens with stale values**:
  1. Confirm the close handler resets local state.
  2. Check whether the file uses `useEffect` keyed on `open` and `initialData`.
  3. Verify the reset runs on both cancel and successful submit.

- **If you see `Toast does not appear after save`**:
  1. Confirm the success toast is called only after the save callback resolves.
  2. Check the file’s toast import matches the existing project pattern.
  3. Verify the handler is not returning early before the toast call.

- **If validation still allows empty submissions**:
  1. Inspect the submit handler for missing required-field checks.
  2. Make sure the handler returns immediately after setting the validation error.
  3. Verify the submit button is inside the form and uses the same handler as the form `onSubmit`.

- **If the dialog layout breaks after adding fields**:
  1. Compare the new structure to the nearest existing modal file.
  2. Keep field spacing and footer actions consistent with the repo’s current `DialogFooter` usage.
  3. Verify the modal still fits within the same `DialogContent` sizing pattern as the existing component.