import api from "./api";

export async function fetchStorefrontProductById(id) {
  const res = await api.get(`/storefront/products/${encodeURIComponent(id)}`);
  return res.data;
}
