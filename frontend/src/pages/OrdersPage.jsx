import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderAPI } from '../utils/api'

const statusColors = { pending: '#f59e0b', confirmed: '#2563eb', processing: '#3b82f6', shipped: '#8b5cf6', delivered: '#16a34a', cancelled: '#dc2626' }

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderAPI.getMyOrders().then(r => { setOrders(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>Loading orders...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '32px', color: '#1e293b' }}>📦 My Orders</h1>
        {orders.length === 0
          ? <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>No orders yet</h3>
              <Link to="/products" style={{ color: '#dc2626', fontWeight: '600', textDecoration: 'none' }}>Start shopping →</Link>
            </div>
          : orders.map(order => (
            <div key={order._id} style={{ background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>Order #{order._id.slice(-8).toUpperCase()}</div>
                  <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', background: (statusColors[order.status] || '#gray') + '20', color: statusColors[order.status] || '#gray', textTransform: 'capitalize' }}>{order.status}</span>
                  <span style={{ fontWeight: '800', fontSize: '18px', color: '#dc2626' }}>${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span style={{ color: '#475569' }}>{item.name} <span style={{ color: '#94a3b8' }}>×{item.quantity}</span></span>
                    <span style={{ fontWeight: '600' }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
