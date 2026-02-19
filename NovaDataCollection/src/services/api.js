import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sync.novabpc.com:443/',
    // baseURL: 'http://localhost:3000/api',
  timeout: 5000,
});

export default api;


