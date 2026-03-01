import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '48px 24px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px' }}>🛡️</span>
              <div>
                <div style={{ color: '#fff', fontWeight: '800', fontSize: '18px' }}>LIFESHIELD</div>
                <div style={{ color: '#dc2626', fontSize: '11px' }}>Preparedness Made Simple</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.6' }}>Your trusted partner for emergency preparedness and personal safety products.</p>
          </div>

          <div>
            <h4 style={{ color: '#fff', marginBottom: '16px', fontWeight: '700', fontSize: '14px' }}>Shop Categories</h4>
            {['First Aid Kits', 'Fire Safety Equipment', 'Disaster Preparedness Kits', 'Personal Safety Devices'].map(cat => (
              <div key={cat} style={{ marginBottom: '8px' }}>
                <Link to={`/products?category=${encodeURIComponent(cat)}`} style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>{cat}</Link>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ color: '#fff', marginBottom: '16px', fontWeight: '700', fontSize: '14px' }}>Our Strategies</h4>
            <div style={{ marginBottom: '8px' }}><Link to="/loyalty" style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>🏆 ShieldPoints™ Loyalty (CRM 1)</Link></div>
            <div style={{ marginBottom: '8px' }}><Link to="/safety-profile" style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>🧠 SafetyProfile™ (CRM 2)</Link></div>
            <div style={{ marginBottom: '8px' }}><Link to="/scm-dashboard" style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>📦 Demand SCM Dashboard</Link></div>
            <div style={{ marginBottom: '8px' }}><Link to="/why-us" style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>🏅 Why LIFESHIELD?</Link></div>
          </div>

          <div>
            <h4 style={{ color: '#fff', marginBottom: '16px', fontWeight: '700', fontSize: '14px' }}>Quick Links</h4>
            {[['/','Home'],['/products','All Products'],['/orders','My Orders'],['/login','Login'],['/register','Register']].map(([to, label]) => (
              <div key={to} style={{ marginBottom: '8px' }}>
                <Link to={to} style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>{label}</Link>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ color: '#fff', marginBottom: '16px', fontWeight: '700', fontSize: '14px' }}>Emergency Numbers</h4>
            <p style={{ fontSize: '13px', lineHeight: '2.2' }}>🚨 Emergency: 911<br />🔥 Fire: 101<br />🏥 Ambulance: 108<br />👮 Police: 100</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '24px', textAlign: 'center', fontSize: '12px' }}>
          © 2024 LIFESHIELD – Preparedness Made Simple | Academic Project
        </div>
      </div>
    </footer>
  )
}
