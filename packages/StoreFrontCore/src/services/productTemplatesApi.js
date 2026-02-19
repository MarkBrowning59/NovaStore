// src/services/productTemplatesApi.js
import api from './api';

export async function listProductTemplates() {
  const res = await api.get('/product-templates');
  return res.data;
}

export async function getProductTemplateByKey(key) {
  const res = await api.get(`/product-templates/${encodeURIComponent(key)}`);
  return res.data;
}
