import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function OrderSuccessPage() {
  const { state } = useLocation()
  const orderId = state?.orderId || 'N/A'
  const total = state?.total || 0

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#f8fafc' }}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '60px 48px', maxWidth: '520px', width: '100%', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '36px' }}>✅</div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>Order Confirmed!</h1>
        <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
          Thank you for your purchase. Your safety products are being prepared for shipment.
        </p>
        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
          {[['Order ID', `#${orderId.toString().slice(-8).toUpperCase()}`], ['Total Paid', `$${total.toFixed(2)}`], ['Status', 'Processing ✓']].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '14px' }}>{l}</span>
              <span style={{ fontWeight: '700', fontSize: l === 'Total Paid' ? '18px' : '14px', color: l === 'Total Paid' ? '#dc2626' : l === 'Status' ? '#16a34a' : '#1e293b' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '16px', marginBottom: '32px', border: '1px solid #fde68a' }}>
          <p style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.5' }}>
            🚨 <strong>Emergency Reminder:</strong> Keep your LIFESHIELD products accessible and familiarize yourself with their use. Preparedness saves lives!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/orders" style={{ padding: '12px 24px', background: '#1e293b', color: '#fff', borderRadius: '10px', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>View Orders</Link>
          <Link to="/products" style={{ padding: '12px 24px', background: '#dc2626', color: '#fff', borderRadius: '10px', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}
