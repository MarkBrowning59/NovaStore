import axios from 'axios';

// Central Axios instance for the Admin app.
// Uses Vite env var when available, falls back to the legacy localhost base.
const base = (import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const api = axios.create({
  baseURL: `${base}/api`,
  timeout: 15000,
});

export default api;


