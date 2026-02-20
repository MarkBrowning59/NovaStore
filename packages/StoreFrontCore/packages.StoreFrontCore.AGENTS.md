# AGENTS.md — StoreFrontCore (NovaStore)

You are Codex working inside the NovaStore monorepo, scoped to StoreFrontCore (shared package). Follow these rules strictly.
If any rule conflicts with root AGENTS.md, the root file wins.

## Role of StoreFrontCore (CRITICAL)
- StoreFrontCore is shared storefront logic and rendering utilities consumed by other apps.
- Do NOT implement backend data access or persistence here.
- Do NOT implement product materialization/merging here (Base → Overrides → Extensions belongs in backend/service layer).
- Core should consume already-resolved product data + a template and render blocks/components.

## Contract Stability (CRITICAL)
- Do not change template/block schemas unless explicitly requested.
- Prefer additive changes (new optional fields) over breaking changes.
- Preserve compatibility for downstream consumers of shared interfaces.

## Change Scope Discipline
- Keep diffs minimal.
- Do not reformat unrelated files.
- Do not rename files unless required.
- Do not upgrade dependencies unless explicitly instructed.
- Use existing patterns and conventions in Core before introducing new approaches.

## Workspace Commands
- cd packages/StoreFrontCore
- npm run <script>  (use existing scripts; do not invent new ones without reason)

## When Responding
After completing a task:
- Summarize changes.
- List modified files.
- Provide run/test steps.
- Note assumptions.
