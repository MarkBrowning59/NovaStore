// src/services/productProfilesApi.js
import api from './api';

/**
 * fetchProductProfiles({ page, pageSize })
 * RETURNS: { page, pageSize, total, profiles }
 */
export async function fetchProductProfiles({ page = 1, pageSize = 20 } = {}) {
  const params = { page, pageSize };
  const res = await api.get('/productprofiles', { params });
  return res.data;
}

/**
 * createProductProfile(profile)
 * POST /api/productprofiles
 */
export async function createProductProfile(profile) {
  const res = await api.post('/productprofiles', profile);
  return res.data;
}

/**
 * updateProductProfile(id, profile)
 * PATCH /api/productprofiles/:id
 */
export async function updateProductProfile(id, profile) {
  const res = await api.patch(`/productprofiles/${encodeURIComponent(id)}`, profile);
  return res.data;
}

/**
 * deleteProductProfile(id)
 * DELETE /api/productprofiles/:id
 */
export async function deleteProductProfile(id) {
  const res = await api.delete(`/productprofiles/${encodeURIComponent(id)}`);
  return res.data;
}
