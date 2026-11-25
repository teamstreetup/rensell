import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
export const BACKEND_ORIGIN = (
  import.meta.env.VITE_BACKEND_URL ||
  API_BASE_URL.replace(/\/api$/, '')
).replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function extractApiError(error, fallback = 'Something went wrong') {
  return (
    error?.response?.data?.details ||
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export const authAPI = {
  signup: (payload) => api.post('/auth/signup', payload).then((r) => r.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
};

export const productAPI = {
  getAll: (params = {}) => api.get('/products', { params }).then((r) => r.data),
  getMine: () => api.get('/products/me').then((r) => r.data),
  getById: (id) => api.get(`/products/${id}`).then((r) => r.data),
  getForManage: (id) => api.get(`/products/${id}/manage`).then((r) => r.data),
  create: (payload) => api.post('/products', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/products/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/products/${id}`).then((r) => r.data),
};

export const orderAPI = {
  getAll: (params = {}) => api.get('/orders', { params }).then((r) => r.data),
  getById: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  create: (payload) => api.post('/orders', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/orders/${id}`, payload).then((r) => r.data),
};

export const paymentAPI = {
  createOrder: (payload) => api.post('/payment/create-order', payload).then((r) => r.data),
  verify: (payload) => api.post('/payment/verify', payload).then((r) => r.data),
  reconcile: (payload) => api.post('/payment/reconcile', payload).then((r) => r.data),
};

export const reviewAPI = {
  getByProduct: (productId) => api.get('/reviews', { params: { productId } }).then((r) => r.data),
  create: (payload) => api.post('/reviews', payload).then((r) => r.data),
};

export const userAPI = {
  getMe: () => api.get('/users/me').then((r) => r.data),
  updateMe: (payload) => api.patch('/users/me', payload).then((r) => r.data),
  getPublicProfile: (id) => api.get(`/users/${id}`).then((r) => r.data),
};

export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats').then((r) => r.data),
  getOrders: () => api.get('/admin/orders').then((r) => r.data),
  updateOrder: (payload) => api.patch('/admin/orders', payload).then((r) => r.data),
  getUsers: () => api.get('/admin/users').then((r) => r.data),
  updateUser: (payload) => api.patch('/admin/users', payload).then((r) => r.data),
  deleteUser: (userId) => api.delete('/admin/users', { params: { userId } }).then((r) => r.data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`).then((r) => r.data),
};

export default api;
