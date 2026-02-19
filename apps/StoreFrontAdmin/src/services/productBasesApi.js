// src/services/productBasesApi.js
import api from "./api";

/**
 * GET /api/productBases?page=&pageSize=&q=
 * Returns { page, pageSize, total, items }
 */
export async function listProductBases({ page = 1, pageSize = 200, q = "" } = {}) {
  const res = await api.get("/productBases", { params: { page, pageSize, q } });
  return res.data;
}

/** GET /api/productBases/:id */
export async function getProductBase(id) {
  const res = await api.get(`/productBases/${encodeURIComponent(id)}`);
  return res.data;
}

/** POST /api/productBases */
export async function createProductBase(base) {
  const res = await api.post("/productBases", base);
  return res.data;
}

/** PATCH /api/productBases/:id */
export async function updateProductBase(id, patch) {
  const res = await api.patch(`/productBases/${encodeURIComponent(id)}`, patch);
  return res.data;
}

/** POST /api/productBases/:id/clone */
export async function cloneProductBase(id, body = {}) {
  const res = await api.post(`/productBases/${encodeURIComponent(id)}/clone`, body);
  return res.data;
}

/** DELETE /api/productBases/:id */
export async function deleteProductBase(id) {
  const res = await api.delete(`/productBases/${encodeURIComponent(id)}`);
  return res.data;
}
