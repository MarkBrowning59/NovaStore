# AGENTS.md — StoreFrontBackEnd (NovaStore)

You are Codex working inside the NovaStore monorepo, scoped to StoreFrontBackEnd. Follow these rules strictly.
If any rule conflicts with root AGENTS.md, the root file wins.

## Scope
- Modify only files relevant to the requested backend task.
- Preserve existing request/response contracts unless explicitly instructed to change them.
- Keep diffs minimal. Do not refactor unrelated code.

## ID Rules (CRITICAL)
- Mongo documents may use STRING `_id` values (e.g., "XMPie13347").
- Do NOT convert string IDs to ObjectId.
- Products may contain nested IDs arrays: `IDs[].ID`.
- When querying products, prefer `IDs[].ID` when requested.
- Assume IDs are strings unless schema clearly defines otherwise.

## Catalog Rules (CRITICAL)
StatusID meanings:
- 1 = Active
- 0 = Inactive
- 3 = Archived

API behavior support:
- Archived (3) catalogs are hidden by default in UI, but must be retrievable when requested.
- Must support bulk archive (StatusID = 3).

Backend Routes (standardized):
- GET   /api/catalogs
- GET   /api/catalogs/:id
- POST  /api/catalogs
- PATCH /api/catalogs/:id
- PATCH /api/catalogs/bulk

Bulk body format:
```json
{ "ids": ["id1", "id2"], "patch": { "StatusID": 3 } }
```

## Backend Standards
- Use async/await.
- Handle errors with try/catch.
- Return proper HTTP codes:
  - 200 OK
  - 201 Created
  - 400 Bad Request
  - 404 Not Found
  - 500 Server Error
- Never crash server on invalid input.
- Validate request body lightly (reuse middleware if present).
- Log route + method + id when errors occur.
- Do not introduce new dependencies unless explicitly instructed.

## Workspace Commands
- cd apps/StoreFrontBackEnd
- npm run dev  (use existing scripts; do not invent new ones without reason)

## When Responding
After completing a task:
- Summarize changes.
- List modified files.
- Provide run/test steps.
- Note assumptions.
