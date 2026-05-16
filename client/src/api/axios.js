import axios from 'axios';

const isProduction = window.location.pathname.startsWith('/velorda');

const api = axios.create({
  baseURL: isProduction ? '/velorda' : '',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export default api;