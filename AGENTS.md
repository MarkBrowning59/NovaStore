# AGENTS.md — NovaStore Monorepo

You are Codex working inside the NovaStore monorepo.
Follow these rules strictly.

----------------------------------------------------
1. Monorepo Structure
----------------------------------------------------

Top-level folders:

- apps/StoreFrontAdmin/     → Admin frontend (React + Vite)
- apps/StoreFrontBackEnd/   → Backend API (Node/Express)
- packages/StoreFrontCore/  → Shared storefront core library
- NovaDataCollection/       → Data-related utilities or scripts
- storefront-test/          → Testing playground
- XMPieAdmin/               → Legacy/admin-related UI

When making changes:
- Modify only the relevant app/package.
- Reuse shared logic from packages/ instead of duplicating code.
- Do not move files across domains unless explicitly instructed.

----------------------------------------------------
2. ID Rules (CRITICAL)
----------------------------------------------------

- Mongo documents may use STRING _id values (e.g., "XMPie13347").
- Do NOT convert string IDs to ObjectId.
- Products may contain nested IDs arrays:
    IDs[].ID
- When querying products, prefer IDs[].ID when requested.
- Assume IDs are strings unless schema clearly defines otherwise.

----------------------------------------------------
3. Catalog Rules (CRITICAL)
----------------------------------------------------

StatusID meanings:
- 1 = Active
- 0 = Inactive
- 3 = Archived

UI Behavior:
- Archived (3) hidden by default.
- Must support bulk archive (StatusID = 3).
- Admin modal should support Create + Edit modes in one component.

Backend Routes (standardized):
GET     /api/catalogs
GET     /api/catalogs/:id
POST    /api/catalogs
PATCH   /api/catalogs/:id
PATCH   /api/catalogs/bulk

Bulk body format:
{
  "ids": ["id1", "id2"],
  "patch": { "StatusID": 3 }
}

----------------------------------------------------
4. Backend Standards (StoreFrontBackEnd)
----------------------------------------------------

- Use async/await.
- Handle errors with try/catch.
- Return proper HTTP codes:
    200 OK
    201 Created
    400 Bad Request
    404 Not Found
    500 Server Error
- Never crash server on invalid input.
- Validate request body lightly (reuse middleware if present).
- Log route + method + id when errors occur.
- Do not introduce new dependencies unless necessary.

----------------------------------------------------
5. Frontend Standards (StoreFrontAdmin)
----------------------------------------------------

- React functional components with hooks.
- Centralize API baseURL in one file.
- Use service layer for all API calls.
- Do not call axios directly inside components.
- Maintain consistent styling patterns.
- Reuse shared components from packages/ when possible.

----------------------------------------------------
6. Workspace Commands
----------------------------------------------------

Assume npm unless package.json specifies otherwise.

If modifying backend:
- cd apps/StoreFrontBackEnd
- npm run dev

If modifying admin frontend:
- cd apps/StoreFrontAdmin
- npm run dev

If modifying core package:
- cd packages/StoreFrontCore
- npm run <script>  (use existing scripts only; do not invent new ones)

Use existing scripts from package.json.
Do not invent new ones without reason.

----------------------------------------------------
7. Change Scope Discipline
----------------------------------------------------

- Keep diffs minimal.
- Do not reformat unrelated files.
- Do not rename files unless required.
- Do not upgrade dependencies unless explicitly instructed.
- Do not delete or simplify existing AGENTS.md rules unless explicitly instructed.

----------------------------------------------------
8. When Responding
----------------------------------------------------

After completing a task:
- Summarize changes.
- List modified files.
- Provide run/test steps.
- Note assumptions.
