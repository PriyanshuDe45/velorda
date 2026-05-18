import axios from 'axios';

const isProd = window.location.pathname.startsWith('/velorda');
const BASE = isProd ? '/velorda' : '';

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

export default api;
export { BASE };