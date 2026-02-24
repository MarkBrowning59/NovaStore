import api from "./api";

export async function fetchStorefrontProduct(id) {
  const { data } = await api.get(`/storefront/products/${encodeURIComponent(id)}`);
  return data;
}

