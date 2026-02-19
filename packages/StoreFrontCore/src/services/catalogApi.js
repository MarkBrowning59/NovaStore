// src/services/catalogApi.js
import api from './api';

export const searchCatalogPaths = async (query) => {
  const res = await api.get('/catalogs/search', { params: { q: query } });
  return res.data;
};

export async function fetchCatalogs(page = 1, pageSize = 10, parentId = null) {
  const res = await api.get('/catalogs', {
    params: {
      page,
      pageSize,
      ...(parentId ? { parentId } : {}),
    },
  });
  return res.data;
}

export async function fetchCatalogById(id) {
  const res = await api.get(`/catalogs/${id}`);
  return res.data;
}

export async function createCatalog(catalog) {
  const res = await api.post('/catalogs', catalog);
  return res.data;
}

export async function updateCatalog(id, catalog) {
  const res = await api.patch(`/catalogs/${id}`, catalog);
  return res.data;
}

export async function bulkUpdateCatalogs(ids, StatusID) {
  const res = await api.patch('/catalogs/bulk-update', { ids, StatusID });
  return res.data;
}

// 🔹 Get products for a catalog (materialized ProductDefinition)
export async function fetchCatalogProducts(catalogId, { page = 1, pageSize = 24 } = {}) {
  const res = await api.get(`/catalogs/${encodeURIComponent(catalogId)}/products`, {
    params: { page, pageSize },
  });
  return res.data; // array: [{ _id, ProductDefinition, BaseProductID?, DisplayOrder? }]
}

// 🔹 Add a product to a catalog's ordered product list
export async function addProductToCatalog(catalogId, productId, DisplayOrder = null) {
  const res = await api.post(
    `/catalogs/${encodeURIComponent(catalogId)}/products`,
    {
      productId,
      ...(DisplayOrder != null ? { DisplayOrder } : {}),
    }
  );
  return res.data;
}
