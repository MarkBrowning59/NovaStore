import axios from 'axios';

const api = axios.create({
  //baseURL: import.meta.env.VITE_BASE_URL,
  baseURL: 'https://sync.novabpc.com:443/',
  timeout: 5000,
});

export default api;


