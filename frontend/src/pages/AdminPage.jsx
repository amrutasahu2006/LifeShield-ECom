import React, { useState, useEffect } from 'react'
import { productAPI, adminAPI } from '../utils/api'

const CATS = ['First Aid Kits', 'Fire Safety Equipment', 'Disaster Preparedness Kits', 'Personal Safety Devices']
const emptyForm = { name: '', description: '', price: '', category: CATS[0], stock: '', image: '', brand: '', sku: '', featured: false }

export default function AdminPage() {
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [msg, setMsg] = useState('')

  const loadProducts = () => productAPI.getAll({ limit: 100 }).then(r => setProducts(r.data.products))
  const loadOrders = () => adminAPI.getAllOrders().then(r => setOrders(r.data))

  useEffect(() => { if (tab === 'products') loadProducts(); else loadOrders() }, [tab])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) await adminAPI.updateProduct(editId, form)
      else await adminAPI.createProduct(form)
      setMsg(editId ? '✅ Product updated!' : '✅ Product created!')
      setShowForm(false); setForm(emptyForm); setEditId(null)
      loadProducts()
    } catch (err) { setMsg('❌ ' + (err.response?.data?.message || 'Failed')) }
    setTimeout(() => setMsg(''), 3000)
  }

  const handleEdit = (p) => { setForm({ ...p, price: p.price.toString(), stock: p.stock.toString() }); setEditId(p._id); setShowForm(true) }
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await adminAPI.deleteProduct(id)
    setProducts(products.filter(p => p._id !== id))
  }

  const tabStyle = (t) => ({ padding: '10px 20px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', border: 'none', borderBottom: tab === t ? '2px solid #dc2626' : '2px solid transparent', background: 'none', color: tab === t ? '#dc2626' : '#64748b', fontFamily: 'inherit' })
  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px', fontFamily: 'inherit' }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>⚙️ Admin Dashboard</h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>Manage products, orders, and users</p>
          </div>
          {tab === 'products' && (
            <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true) }}
              style={{ padding: '12px 24px', background: '#dc2626', color: '#fff', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', border: 'none' }}>
              + Add Product
            </button>
          )}
        </div>

        {msg && <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', background: msg.includes('✅') ? '#dcfce7' : '#fee2e2', color: msg.includes('✅') ? '#16a34a' : '#dc2626', fontWeight: '600' }}>{msg}</div>}

        <div style={{ background: '#fff', borderRadius: '12px 12px 0 0', display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
          <button style={tabStyle('products')} onClick={() => setTab('products')}>📦 Products ({products.length})</button>
          <button style={tabStyle('orders')} onClick={() => setTab('orders')}>🛒 Orders ({orders.length})</button>
        </div>

        <div style={{ background: '#fff', borderRadius: '0 0 12px 12px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
          {tab === 'products' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Featured', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{p.name.substring(0, 35)}...</div>
                      <div style={{ color: '#94a3b8', fontSize: '11px' }}>{p.sku}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{p.category.split(' ').slice(0, 2).join(' ')}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#dc2626' }}>${p.price.toFixed(2)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: '600', color: p.stock > 10 ? '#16a34a' : p.stock > 0 ? '#d97706' : '#dc2626' }}>{p.stock}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>{p.featured ? '⭐' : '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEdit(p)} style={{ padding: '6px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(p._id)} style={{ padding: '6px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'orders' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Order ID', 'Customer', 'Total', 'Items', 'Status', 'Date', 'Payment'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>#{o._id.slice(-6).toUpperCase()}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{o.user?.name || 'N/A'}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#dc2626' }}>${o.totalPrice.toFixed(2)}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{o.items.length} items</td>
                    <td style={{ padding: '14px 16px' }}>
                      <select value={o.status} onChange={async (e) => {
                        await adminAPI.updateOrderStatus(o._id, e.target.value)
                        setOrders(orders.map(ord => ord._id === o._id ? { ...ord, status: e.target.value } : ord))
                      }} style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 16px', fontSize: '12px' }}>{o.isPaid ? '✅ Paid' : '⏳ Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '24px' }}>
            <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800' }}>{editId ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setShowForm(false)} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                {[['name','Product Name','text'],['description','Description','textarea'],['price','Price ($)','number'],['stock','Stock Quantity','number'],['image','Image URL','url'],['brand','Brand','text'],['sku','SKU Code','text']].map(([f,l,t]) => (
                  <div key={f}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#374151' }}>{l}</label>
                    {t === 'textarea'
                      ? <textarea value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} rows={3} style={{ ...inputStyle }} required />
                      : <input type={t} value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} style={{ ...inputStyle }} required={f !== 'image' && f !== 'brand'} />
                    }
                  </div>
                ))}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>Featured Product</span>
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#374151', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', border: 'none' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '12px', background: '#dc2626', color: '#fff', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', border: 'none' }}>{editId ? 'Update' : 'Create'} Product</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
