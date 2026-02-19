// src/services/productApi.js
import api from './api'; // your axios instance

// 🔹 Already used somewhere else
export const fetchProductsByIds = async (ids) => {
  const res = await api.post('/products/by-ids', { ids });
  return res.data;
};

// 🔹 List products
export async function fetchProducts(params = {}) {
  const res = await api.get('/products', { params });
  return res.data;
}

// 🔹 Get a single product by id (canonical helper)
export async function getProduct(id) {
  const res = await api.get(`/products/${encodeURIComponent(id)}`);
  return res.data;
}

// 🔹 If you want a named variant, keep this too (optional)
export async function fetchProductById(id) {
  const res = await api.get(`/products/${encodeURIComponent(id)}`);
  return res.data;
}

// 🔹 Create product
export async function createProduct(product) {
  const res = await api.post('/products', product);
  return res.data;
}

// 🔹 Update product
export async function updateProduct(id, product) {
  const res = await api.patch(`/products/${encodeURIComponent(id)}`, product);
  return res.data;
}

// 🔹 Delete product
export async function deleteProduct(id) {
  const res = await api.delete(`/products/${encodeURIComponent(id)}`);
  return res.data;
}
