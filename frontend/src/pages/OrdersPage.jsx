import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderAPI } from '../utils/api'

const statusColors = {
  pending: '#64748b',
  processing: '#2563eb',
  shipped: '#ea580c',
  delivered: '#16a34a'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const formatINR = (value) => `Rs. ${Number(value).toFixed(2)}`

  const loadOrders = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    if (silent) setRefreshing(true)
    try {
      const r = await orderAPI.getMyOrders()
      setOrders(r.data)
    } finally {
      if (!silent) setLoading(false)
      if (silent) setRefreshing(false)
    }
  }

  useEffect(() => {
    loadOrders()
    const intervalId = setInterval(() => loadOrders({ silent: true }), 15000)
    return () => clearInterval(intervalId)
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>Loading orders...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '30px', fontWeight: '800', margin: 0, color: '#1e293b' }}>📦 My Orders</h1>
          <button onClick={() => loadOrders({ silent: true })} disabled={refreshing} style={{ padding: '10px 14px', border: '1px solid #e2e8f0', background: '#fff', borderRadius: '10px', fontWeight: '600', cursor: refreshing ? 'wait' : 'pointer', color: '#334155' }}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
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
                  <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', background: (statusColors[order.status] || '#64748b') + '20', color: statusColors[order.status] || '#64748b', textTransform: 'capitalize' }}>{order.status || 'pending'}</span>
                  <span style={{ fontWeight: '800', fontSize: '18px', color: '#dc2626' }}>{formatINR(order.totalPrice)}</span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#475569' }}>{item.name} <span style={{ color: '#94a3b8' }}>×{item.quantity}</span></span>
                      {item.customComponents && item.customComponents.length > 0 && (
                        <div style={{ paddingLeft: '8px', marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
                          {item.customComponents.map((c, i) => <div key={i}>• {c}</div>)}
                        </div>
                      )}
                    </div>
                    <span style={{ fontWeight: '600' }}>{formatINR(item.price * item.quantity)}</span>
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
