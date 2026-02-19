import axios from 'axios';

// Robust base URL resolution (Vite)
// Supports either:
//   VITE_API_BASE_URL=http://localhost:3000
// or
//   VITE_API_BASE_URL=http://localhost:3000/api
const raw = (import.meta?.env?.VITE_API_BASE_URL || '').trim();

// Normalize: remove trailing slash
const normalized = raw.replace(/\/$/, '');

// If env already ends with /api, don't append it again
const baseURL = normalized
  ? (normalized.endsWith('/api') ? normalized : `${normalized}/api`)
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
});

export default api;