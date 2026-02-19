import api from './api';

export async function fetchProductTemplates() {
  const { data } = await api.get('/product-templates');
  return data;
}

export async function fetchProductTemplateByKey(key) {
  const { data } = await api.get(`/product-templates/${encodeURIComponent(key)}`);
  return data;
}

export async function createProductTemplate(payload) {
  const { data } = await api.post('/product-templates', payload);
  return data;
}

export async function updateProductTemplate(key, payload) {
  const { data } = await api.patch(`/product-templates/${encodeURIComponent(key)}`, payload);
  return data;
}

export async function deleteProductTemplate(key) {
  const { data } = await api.delete(`/product-templates/${encodeURIComponent(key)}`);
  return data;
}

// Optional convenience endpoint (if implemented in backend)
export async function cloneProductTemplate(key, payload) {
  const { data } = await api.post(`/product-templates/${encodeURIComponent(key)}/clone`, payload);
  return data;
}
