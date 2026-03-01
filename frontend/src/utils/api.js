import axios from 'axios'

const API = axios.create({ baseURL: '/api' })

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('lifeshieldUser') || 'null')
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`
  return config
})

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
}

export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getFeatured: () => API.get('/products/featured'),
  getById: (id) => API.get(`/products/${id}`),
}

export const cartAPI = {
  get: () => API.get('/cart'),
  add: (data) => API.post('/cart/add', data),
  update: (itemId, data) => API.put(`/cart/item/${itemId}`, data),
  remove: (itemId) => API.delete(`/cart/item/${itemId}`),
  clear: () => API.delete('/cart/clear'),
}

export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getMyOrders: () => API.get('/orders/myorders'),
  getById: (id) => API.get(`/orders/${id}`),
}

export const adminAPI = {
  createProduct: (data) => API.post('/admin/products', data),
  updateProduct: (id, data) => API.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => API.delete(`/admin/products/${id}`),
  getAllOrders: () => API.get('/admin/orders'),
  updateOrderStatus: (id, status) => API.put(`/admin/orders/${id}/status`, { status }),
  getUsers: () => API.get('/admin/users'),
}

export const loyaltyAPI = {
  getDashboard: () => API.get('/loyalty/dashboard'),
  redeemReward: (rewardName) => API.post('/loyalty/redeem', { rewardName }),
}

export default API
