# NovaStore Backend – Folder & Layer Guide

This backend uses a **layered architecture** so each concern has a clear home and can evolve independently.

High-level request flow:

> **Express → Route → Controller → Service → Repository → Database(s)**


---

## `/routes`

**Purpose:** Define **URL endpoints** and wire them to the appropriate controller functions.

**What lives here:**
- Route modules like:
  - `products.routes.js`
  - `catalogs.routes.js`
  - `api.js` (aggregates all feature routes)

**Responsibilities:**
- Declare **paths and HTTP verbs**.
- Attach route‑specific middleware if needed.
- Contain *no business or DB logic*.

---

## `/controllers`

**Purpose:** Handle **HTTP layer logic**: read requests, call services, return responses.

**What lives here:**
- `products.controller.js`
- `catalogs.controller.js`

**Responsibilities:**
- Extract data from `req.params`, `req.query`, `req.body`.
- Call service functions.
- Return proper **status codes + JSON**.
- Do not touch the database directly.

---

## `/services`

**Purpose:** Contain **business logic** and **multi-system orchestration**.

**What lives here:**
- `products.service.js`
- `catalogs.service.js`
- Shared utilities like `productMapper.js`

**Responsibilities:**
- Implement use cases.
- Merge multi-database data (Mongo + SQL + Business Central).
- Enforce business rules.
- Call repositories — never Express, never HTTP objects.

---

## `/repositories`

**Purpose:** Provide **low‑level data access**.

**What lives here:**
- `productMongoRepository.js`
- `catalogMongoRepository.js`
- `NovaMongoDBRepository.js` (connection)
- Stubs/integrations for SQL + Business Central

**Responsibilities:**
- Perform actual DB/API calls.
- Return raw data.
- Hide connection details.

**No business logic here.**

---

## `/models`

**Purpose:** Define **data schemas or shared types**.

**What may live here:**
- Mongoose schemas
- Shared JS/TS models
- Validation definitions

**Responsibilities:**
- Describe the shape of persisted data.
- Assist with validation or indexing.

---

## How Everything Works Together

Example: `GET /api/products/123`

1. **Route** matches the endpoint.
2. **Controller** extracts input and calls service.
3. **Service:**
   - Fetches Mongo product.
   - Looks for SQL + BC IDs.
   - Fetches additional data.
   - Merges everything into a single DTO.
4. **Repositories:** perform raw DB/API queries.
5. **Global error handler** formats errors.

---

This structure makes NovaStore maintainable, scalable, and cleanly separated across all systems (MongoDB, SQL Server, and Business Central).

