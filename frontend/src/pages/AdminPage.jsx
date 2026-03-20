import React, { useState, useEffect } from 'react'
import { productAPI, adminAPI } from '../utils/api'
import { FiBox, FiShoppingCart, FiPlus, FiEdit2, FiTrash2, FiX, FiCheckCircle, FiPackage, FiTruck, FiClock, FiStar, FiSearch, FiActivity, FiDollarSign, FiAlertCircle, FiClipboard } from 'react-icons/fi'

import { useNavigate } from 'react-router-dom'

const CATS = ['First Aid Kits', 'Fire Safety Equipment', 'Disaster Preparedness Kits', 'Personal Safety Devices']
const emptyForm = { name: '', description: '', price: '', category: CATS[0], stock: '', lowStockThreshold: '5', image: '', brand: '', sku: '', featured: false }

export default function AdminPage({ activeTab = 'dashboard' }) {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [dashboardStats, setDashboardStats] = useState({ totalOrders: 0, totalRevenue: 0, monthlyRevenue: [], topSellingProducts: [] })
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState('')
  const [alerts, setAlerts] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dashboardRefreshing, setDashboardRefreshing] = useState(false)

  const loadProducts = () => productAPI.getAll({ limit: 100 }).then(r => setProducts(r.data.products))
  const loadOrders = () => adminAPI.getAllOrders().then(r => setOrders(r.data))
  const loadStats = () => {
    setStatsLoading(true)
    setStatsError('')
    return adminAPI.getStats()
      .then((r) => setDashboardStats(r.data))
      .catch((err) => {
        setStatsError(err.response?.data?.message || 'Unable to load analytics data')
        setDashboardStats({ totalOrders: 0, totalRevenue: 0, monthlyRevenue: [], topSellingProducts: [] })
      })
      .finally(() => setStatsLoading(false))
  }
  const loadAlerts = () => adminAPI.getAlerts().then(r => setAlerts(r.data)).catch(() => setAlerts([]))
  const loadLowStock = () => adminAPI.getLowStockProducts().then(r => setLowStockProducts(r.data)).catch(() => setLowStockProducts([]))

  const refreshDashboardData = async () => {
    setDashboardRefreshing(true)
    try {
      await Promise.all([loadOrders(), loadStats(), loadLowStock(), loadAlerts()])
    } finally {
      setDashboardRefreshing(false)
    }
  }

  useEffect(() => { loadProducts(); loadOrders(); loadStats(); loadAlerts(); loadLowStock() }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshDashboardData()
    }, 15000)

    return () => clearInterval(intervalId)
  }, [])

  const showMessage = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: '' }), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) await adminAPI.updateProduct(editId, form)
      else await adminAPI.createProduct(form)
      showMessage(editId ? 'Product updated successfully!' : 'Product created successfully!')
      setShowForm(false); setForm(emptyForm); setEditId(null)
      loadProducts(); loadLowStock()
    } catch (err) { showMessage(err.response?.data?.message || 'Action failed', 'error') }
  }

  const handleEdit = (p) => { setForm({ ...p, price: p.price.toString(), stock: p.stock.toString(), lowStockThreshold: (p.lowStockThreshold ?? 5).toString() }); setEditId(p._id); setShowForm(true) }
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await adminAPI.deleteProduct(id)
      setProducts(products.filter(p => p._id !== id))
      loadLowStock()
      showMessage('Product deleted successfully')
    } catch (err) { showMessage('Failed to delete product', 'error') }
  }

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o._id.toLowerCase().includes(searchQuery.toLowerCase()) || (o.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || o.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const getOrderStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered': return { bg: '#dcfce7', text: '#16a34a' }
      case 'shipped': return { bg: '#ffedd5', text: '#ea580c' }
      case 'processing': return { bg: '#dbeafe', text: '#2563eb' }
      case 'pending': return { bg: '#f1f5f9', text: '#64748b' }
      default: return { bg: '#f1f5f9', text: '#475569' }
    }
  }

  // Dashboard Metrics Calculations
  const totalRevenue = Number(dashboardStats.totalRevenue || 0)
  const totalOrders = Number(dashboardStats.totalOrders || 0)
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing')
  const unreadAlerts = alerts.filter(a => !a.isRead)
  const monthlyRevenue = dashboardStats.monthlyRevenue || []
  const topSellingProducts = dashboardStats.topSellingProducts || []
  const chartMaxRevenue = Math.max(...monthlyRevenue.map((m) => Number(m.totalRevenue || 0)), 1)
  const formatINR = (value) => `Rs. ${Number(value || 0).toFixed(2)}`

  const getStockStatus = (stock) => {
    if (stock > 20) return { label: 'In Stock', color: '#10b981', bg: '#d1fae5' }
    if (stock > 0) return { label: 'Low Stock', color: '#f59e0b', bg: '#fef3c7' }
    return { label: 'Out of Stock', color: '#ef4444', bg: '#fee2e2' }
  }

  // Common UI Styles
  const cardStyle = {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9',
    overflow: 'hidden'
  }

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"

  return (
    <div className="admin-dashboard glassmorphism-bg">
      <style>{`
        .admin-dashboard { min-height: 100vh; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 2rem; font-family: 'Inter', system-ui, sans-serif; }
        .dashboard-container { max-width: 1200px; margin: 0 auto; }
        
        /* Typography */
        h1, h2, h3, h4 { color: #0f172a; tracking: -0.025em; }
        .text-gradient { background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        /* Tabs */
        .tab-btn { display: flex; align-items: center; gap: 0.5rem; padding: 1rem 1.5rem; font-weight: 600; font-size: 0.95rem; color: #64748b; background: transparent; border: none; border-bottom: 3px solid transparent; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; }
        .tab-btn:hover { color: #334155; background: rgba(241, 245, 249, 0.5); }
        .tab-btn.active { color: #4f46e5; border-bottom-color: #4f46e5; }
        .tab-btn.active::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 24px; height: 3px; background: #4f46e5; border-radius: 3px 3px 0 0; }
        
        /* Buttons */
        .btn-primary { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: white; padding: 0.6rem 1.25rem; border-radius: 9999px; font-weight: 600; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -2px rgba(79, 70, 229, 0.2); border: none; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -4px rgba(79, 70, 229, 0.3); }
        .btn-primary:active { transform: translateY(0); }
        
        .btn-action { width: 32px; height: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; border: none; background: transparent; }
        .btn-action-edit { color: #3b82f6; }
        .btn-action-edit:hover { background: #eff6ff; }
        .btn-action-delete { color: #ef4444; }
        .btn-action-delete:hover { background: #fef2f2; }

        /* Tables */
        .premium-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .premium-table th { background: #f8fafc; padding: 1rem 1.5rem; text-align: left; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 1px solid #e2e8f0; }
        .premium-table td { padding: 1.25rem 1.5rem; vertical-align: middle; border-bottom: 1px solid #f1f5f9; transition: background 0.2s; }
        .premium-table tr:hover td { background: #f8fafc; }
        .premium-table tr:last-child td { border-bottom: none; }

        /* Badges */
        .status-badge { display: inline-flex; align-items: center; justify-content: center; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; white-space: nowrap; }
        
        /* Modal */
        .modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem; animation: fadeIn 0.3s ease-out; }
        .modal-content { background: #fff; border-radius: 20px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: #fff; z-index: 10; border-radius: 20px 20px 0 0; }
        .modal-body { padding: 2rem; }
        
        /* Form Inputs inline styling used to avoid Tailwind conflicts if missing */
        .form-group { margin-bottom: 1.25rem; }
        .form-label { display: block; font-size: 0.875rem; font-weight: 600; color: #334155; margin-bottom: 0.5rem; }
        .form-input { width: 100%; padding: 0.625rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem; color: #1e293b; font-size: 0.875rem; transition: all 0.2s; box-sizing: border-box; }
        .form-input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); background: #fff; }
        
        /* Animations */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Toast Notification */
        .toast { position: fixed; top: 5rem; right: 1.5rem; padding: 1rem 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 0.75rem; z-index: 9999; animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); font-weight: 500; }
        .toast.success { background: #10b981; color: white; }
        .toast.error { background: #ef4444; color: white; }
        
        /* Utility */
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .flex-between { display: flex; justify-content: space-between; align-items: center; }
        .search-wrapper { position: relative; width: 300px; }
        .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .search-input { width: 100%; padding: 0.625rem 1rem 0.625rem 2.5rem; border-radius: 9999px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 0.875rem; transition: all 0.2s; }
        .search-input:focus { outline: none; border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
        
        /* Dashboard Specifics */
        .metric-card { background: #fff; border-radius: 16px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 1rem; transition: transform 0.2s; }
        .metric-card:hover { transform: translateY(-2px); }
        .metric-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
      `}</style>

      {/* Toast Notification */}
      {msg.text && (
        <div className={`toast ${msg.type}`}>
          {msg.type === 'success' ? <FiCheckCircle size={20} /> : <FiX size={20} />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="dashboard-container">
        {/* Header Section */}
        <div className="flex-between" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>Workspace Overview</h1>
            <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.95rem' }}>Manage your store catalog and customer orders.</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {activeTab === 'dashboard' && (
              <button
                onClick={refreshDashboardData}
                disabled={dashboardRefreshing}
                className="form-input"
                style={{ width: 'auto', padding: '0.625rem 1rem', borderRadius: '9999px', cursor: dashboardRefreshing ? 'wait' : 'pointer', fontWeight: '600', background: '#fff' }}
              >
                {dashboardRefreshing ? 'Refreshing...' : 'Refresh Dashboard'}
              </button>
            )}

            {activeTab !== 'dashboard' && (
              <div className="search-wrapper">
                <FiSearch className="search-icon" size={16} />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            )}

            {activeTab === 'orders' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input"
                style={{ width: 'auto', padding: '0.625rem 2.5rem 0.625rem 1rem', borderRadius: '9999px', cursor: 'pointer', fontWeight: '500' }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            )}

            {activeTab === 'products' && (
              <button
                onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true) }}
                className="btn-primary"
              >
                <FiPlus size={18} /> Add Product
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div style={cardStyle}>
          {/* Content Body */}
          <div style={{ overflowX: 'auto', minHeight: '400px', backgroundColor: activeTab === 'dashboard' ? '#f8fafc' : '#fff' }}>
            {activeTab === 'dashboard' && (
              <div style={{ padding: '2rem' }}>
                <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '16px', padding: '2.5rem', color: '#ffffff', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: '-5%', top: '-20%', fontSize: '200px', opacity: '0.05' }}>🛡️</div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ffffff' }}>Welcome to Command Center</h2>
                  <p style={{ color: '#cbd5e1', fontSize: '1rem', maxWidth: '600px', lineHeight: '1.6' }}>Here is what's happening with your store today. Review incoming orders and manage your robust safety catalog.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div className="metric-card">
                    <div className="metric-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><FiDollarSign /></div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>{formatINR(totalRevenue)}</div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}><FiShoppingCart /></div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>{totalOrders}</div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon" style={{ background: '#fef3c7', color: '#d97706' }}><FiAlertCircle /></div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Low Stock Items</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>{lowStockProducts.length}</div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}><FiBox /></div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Products</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>{products.length}</div>
                    </div>
                  </div>
                </div>

                {statsLoading && <div style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem' }}>Loading analytics...</div>}
                {statsError && <div style={{ marginBottom: '1rem', color: '#dc2626', fontSize: '0.9rem' }}>{statsError}</div>}

                {!statsLoading && !statsError && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem', color: '#0f172a' }}>Monthly Revenue Trend</h3>
                      {monthlyRevenue.length === 0 ? (
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>No revenue data available yet.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(monthlyRevenue.length, 8)}, minmax(0, 1fr))`, alignItems: 'end', gap: '8px', minHeight: '130px' }}>
                          {monthlyRevenue.slice(-8).map((item) => {
                            const height = Math.max((Number(item.totalRevenue || 0) / chartMaxRevenue) * 100, 8)
                            const label = `${String(item.month).padStart(2, '0')}/${item.year}`
                            return (
                              <div key={label} style={{ textAlign: 'center' }}>
                                <div title={`${label}: ${formatINR(item.totalRevenue)}`} style={{ height: `${height}px`, borderRadius: '8px 8px 0 0', background: 'linear-gradient(180deg, #2563eb 0%, #60a5fa 100%)' }} />
                                <div style={{ marginTop: '6px', color: '#64748b', fontSize: '0.72rem' }}>{label}</div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem', color: '#0f172a' }}>Top Selling Products</h3>
                      {topSellingProducts.length === 0 ? (
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>No product sales data available yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {topSellingProducts.map((item, index) => (
                            <div key={`${item.productId || item.name}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                              <div>
                                <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{item.name}</div>
                                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{item.quantitySold} units sold</div>
                              </div>
                              <div style={{ fontWeight: '700', color: '#0f172a' }}>{formatINR(item.revenue)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Pending Orders</h3>
                      <button onClick={() => navigate('/admin/orders')} style={{ color: '#4f46e5', background: 'transparent', border: 'none', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>View All →</button>
                    </div>
                    <div style={{ padding: '0 1.5rem' }}>
                      {pendingOrders.length === 0 ? (
                        <p style={{ color: '#64748b', padding: '2rem 0', textAlign: 'center' }}>No pending orders right now.</p>
                      ) : pendingOrders.slice(0, 4).map(o => (
                        <div key={o._id} style={{ padding: '1rem 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>#{o._id.slice(-6).toUpperCase()}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{o.items.length} items • Rs. {o.totalPrice.toFixed(2)}</div>
                          </div>
                          <span style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '999px', background: o.status === 'processing' ? '#fef3c7' : '#f1f5f9', color: o.status === 'processing' ? '#d97706' : '#475569', fontWeight: '600', textTransform: 'capitalize' }}>{o.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Low Stock Alerts</h3>
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {lowStockProducts.length === 0 ? (
                        <p style={{ color: '#64748b', margin: 0 }}>No low-stock products right now.</p>
                      ) : lowStockProducts.slice(0, 5).map(p => (
                        <div key={p._id} style={{ padding: '0.875rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px' }}>
                          <div style={{ fontWeight: '700', color: '#92400e', fontSize: '0.9rem' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#78350f', marginTop: '4px' }}>
                            Current stock: {p.stock} • Threshold: {p.lowStockThreshold ?? 5}
                          </div>
                        </div>
                      ))}
                      {unreadAlerts.length > 0 && unreadAlerts.slice(0, 3).map(a => (
                        <div key={a._id} style={{ padding: '0.875rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px' }}>
                          <div style={{ fontWeight: '700', color: '#92400e', fontSize: '0.9rem' }}>
                            {a.product?.name || 'Product'} low stock
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#78350f', marginTop: '4px' }}>
                            Current stock: {typeof a.currentStock === 'number' ? a.currentStock : a.product?.stock} • Threshold: {a.threshold}
                          </div>
                          <div style={{ marginTop: '8px' }}>
                            <button
                              onClick={async () => {
                                try {
                                  await adminAPI.markAlertRead(a._id)
                                  setAlerts(alerts.map(alert => alert._id === a._id ? { ...alert, isRead: true } : alert))
                                  loadLowStock()
                                } catch (err) {
                                  showMessage('Failed to update alert', 'error')
                                }
                              }}
                              style={{ background: 'transparent', border: 'none', color: '#92400e', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                            >
                              Mark as read
                            </button>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => navigate('/admin/products')} style={{ marginTop: '0.5rem', padding: '0.8rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', color: '#334155' }}>
                        Manage Inventory
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category & Brand</th>
                    <th>Price</th>
                    <th>Inventory</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No products found.</td></tr>
                  ) : filteredProducts.map(p => {
                    const status = getStockStatus(p.stock)
                    return (
                      <tr key={p._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#f8fafc', overflow: 'hidden', border: '1px solid #e2e8f0 flex-shrink-0' }}>
                              <img src={p.image || 'https://via.placeholder.com/48'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=Img' }} />
                            </div>
                            <div className="truncate" style={{ maxWidth: '200px' }}>
                              <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }} className="truncate" title={p.name}>{p.name}</div>
                              <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px', fontFamily: 'monospace' }}>{p.sku || 'NO-SKU'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '500' }}>{p.category}</div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.brand}</div>
                        </td>
                        <td style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>Rs. {p.price.toFixed(2)}</td>
                        <td>
                          <div className="status-badge" style={{ background: status.bg, color: status.color }}>
                            {status.label} ({p.stock})
                          </div>
                        </td>
                        <td>
                          {p.featured ? (
                            <div className="status-badge" style={{ background: '#fef3c7', color: '#b45309', display: 'inline-flex', gap: '4px' }}>
                              <FiStar size={12} fill="#b45309" /> Featured
                            </div>
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => handleEdit(p)} className="btn-action btn-action-edit" title="Edit Product"><FiEdit2 size={16} /></button>
                          <button onClick={() => handleDelete(p._id)} className="btn-action btn-action-delete" title="Delete Product" style={{ marginLeft: '4px' }}><FiTrash2 size={16} /></button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}

            {activeTab === 'orders' && (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Order Info</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Fulfillment</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No orders found.</td></tr>
                  ) : filteredOrders.map(o => {
                    const st = getOrderStatusColor(o.status)
                    return (
                      <tr key={o._id}>
                        <td>
                          <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem', fontFamily: 'monospace' }}>#{o._id.slice(-6).toUpperCase()}</div>
                          <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>{o.items.length} item(s)</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 'bold', fontSize: '14px' }}>
                              {(o.user?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: '500', color: '#334155', fontSize: '0.9rem' }}>{o.user?.name || 'Guest User'}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: '700', color: '#0f172a' }}>Rs. {o.totalPrice.toFixed(2)}</td>
                        <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiClock size={12} />
                            {new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </td>
                        <td>
                          <select
                            value={o.status || 'pending'}
                            onChange={async (e) => {
                              try {
                                const { data: updatedOrder } = await adminAPI.updateOrderStatus(o._id, e.target.value)
                                setOrders(orders.map(ord => ord._id === updatedOrder._id ? updatedOrder : ord))
                                loadOrders()
                                loadStats()
                                showMessage('Order status updated')
                              } catch (err) { showMessage('Failed to update order', 'error') }
                            }}
                            className="form-input"
                            style={{ padding: '0.35rem 2rem 0.35rem 0.75rem', width: 'auto', background: st.bg, color: st.text, borderColor: 'transparent', fontWeight: '600', borderRadius: '9999px', cursor: 'pointer' }}
                          >
                            {['pending', 'processing', 'shipped', 'delivered'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                          </select>
                        </td>
                        <td>
                          {o.isPaid ? (
                            <div className="status-badge" style={{ background: '#dcfce7', color: '#16a34a' }}>Paid</div>
                          ) : (
                            <div className="status-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>Unpaid</div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showForm && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="modal-header">
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
                  {editId ? 'Edit Product Configuration' : 'Create New Product'}
                </h2>
                <button onClick={() => setShowForm(false)} className="btn-action" style={{ background: '#f1f5f9' }}><FiX size={20} color="#64748b" /></button>
              </div>
              <form onSubmit={handleSubmit} className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Product Title</label>
                    <input type="text" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Premium First Aid Kit" />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Description</label>
                    <textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required placeholder="Detailed product description..."></textarea>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price (Rs.)</label>
                    <input type="number" step="0.01" className="form-input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required placeholder="0.00" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current Stock</label>
                    <input type="number" className="form-input" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required placeholder="0" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Low Stock Threshold</label>
                    <input type="number" className="form-input" value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} min="0" placeholder="5" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Brand Segment</label>
                    <input type="text" className="form-input" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Brand name" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product SKU</label>
                    <input type="text" className="form-input" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SKU-12345" />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Image Asset URL</label>
                    <input type="url" className="form-input" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://example.com/image.jpg" />
                    {form.image && (
                      <div style={{ marginTop: '0.5rem', width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <img src={form.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                      </div>
                    )}
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                      <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} style={{ width: '1.25rem', height: '1.25rem', accentColor: '#4f46e5' }} />
                      <div>
                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>Highlight on Storefront</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>This product will be featured on the main landing page</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowForm(false)} className="form-input" style={{ flex: 1, background: '#f8fafc', fontWeight: '600', cursor: 'pointer', textAlign: 'center' }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', borderRadius: '0.5rem' }}>{editId ? 'Save Changes' : 'Publish Product'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

