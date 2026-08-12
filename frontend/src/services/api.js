import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Endereço da nossa API Node.js
});

// Adiciona o Token JWT automaticamente em todas as requisições se ele estiver salvo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;