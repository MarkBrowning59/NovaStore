# AGENTS.md — StoreFrontAdmin (NovaStore)

You are Codex working inside the NovaStore monorepo, scoped to StoreFrontAdmin. Follow these rules strictly.
If any rule conflicts with root AGENTS.md, the root file wins.

## Scope
- Modify only files relevant to the requested admin UI task.
- Keep diffs minimal. Do not refactor unrelated code.
- Preserve existing UX flows unless explicitly instructed to change them.

## Catalog Rules (CRITICAL)
StatusID meanings:
- 1 = Active
- 0 = Inactive
- 3 = Archived

UI Behavior:
- Archived (3) catalogs hidden by default.
- Must support bulk archive (StatusID = 3).
- Admin modal should support Create + Edit modes in one component when applicable.

## Frontend Standards
- React functional components with hooks.
- Centralize API baseURL in one file.
- Use service layer for all API calls.
- Do not call axios directly inside components.
- Maintain consistent styling patterns.
- Reuse shared components from packages/ when possible.

## Workspace Commands
- cd apps/StoreFrontAdmin
- npm run dev  (use existing scripts; do not invent new ones without reason)

## When Responding
After completing a task:
- Summarize changes.
- List modified files.
- Provide run/test steps.
- Note assumptions.
