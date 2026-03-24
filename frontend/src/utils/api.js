import axios from 'axios'

const resolvedApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')

const API = axios.create({ baseURL: resolvedApiBaseUrl })

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('lifeshieldUser') || 'null')
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`
  return config
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const message = (error?.response?.data?.message || '').toLowerCase()
    if (status === 401 && (message.includes('token') || message.includes('authorized'))) {
      localStorage.removeItem('lifeshieldUser')
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  googleLogin: (idToken) => API.post('/auth/google', { idToken }),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
}

export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getFeatured: () => API.get('/products/featured'),
  getById: (id) => API.get(`/products/${id}`),
  getScmTransparency: () => API.get('/products/scm-transparency'),
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

export const paymentAPI = {
  createRazorpayOrder: (amount) => API.post('/payment/create-order', { amount }),
  verifyPayment: (data) => API.post('/payment/verify', data),
}

export const subscriptionAPI = {
  activate: (plan) => API.post('/subscription/activate', { plan }),
}

export const createRazorpayOrder = (amount) => paymentAPI.createRazorpayOrder(amount)
export const verifyPayment = (data) => paymentAPI.verifyPayment(data)

export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  createProduct: (data) => API.post('/admin/products', data),
  updateProduct: (id, data) => API.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => API.delete(`/admin/products/${id}`),
  getLowStockProducts: () => API.get('/admin/low-stock'),
  getAllOrders: () => API.get('/admin/orders'),
  updateOrderStatus: (id, status) => API.put(`/admin/orders/${id}/status`, { status }),
  getUsers: () => API.get('/admin/users'),
  getAlerts: () => API.get('/admin/alerts'),
  markAlertRead: (id) => API.put(`/admin/alerts/${id}/read`),
  createTier: (data) => API.post('/admin/crm/tiers', data),
  updateTier: (id, data) => API.put(`/admin/crm/tiers/${id}`, data),
  deleteTier: (id) => API.delete(`/admin/crm/tiers/${id}`),
  createReward: (data) => API.post('/admin/crm/rewards', data),
  updateReward: (id, data) => API.put(`/admin/crm/rewards/${id}`, data),
  deleteReward: (id) => API.delete(`/admin/crm/rewards/${id}`),
}

export const loyaltyAPI = {
  getDashboard: () => API.get('/loyalty/dashboard'),
  redeemReward: (rewardName) => API.post('/loyalty/redeem', { rewardName }),
  getTiers: () => API.get('/loyalty/tiers'),
  getRewards: () => API.get('/loyalty/rewards'),
}

export default API
