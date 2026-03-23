import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [strategyOpen, setStrategyOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  const linkStyle = { color: '#94a3b8', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textDecoration: 'none', whiteSpace: 'nowrap' }

  return (
    <nav style={{ background: '#1e293b', padding: '0 24px', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px', gap: '8px' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontSize: '28px' }}>🛡️</span>
          <div>
            <div style={{ color: '#fff', fontWeight: '800', fontSize: '18px', letterSpacing: '-0.5px' }}>LIFESHIELD</div>
            <div style={{ color: '#dc2626', fontSize: '10px', fontWeight: '500' }}>Preparedness Made Simple</div>
          </div>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' }}>
          <Link to="/" style={linkStyle}>Home</Link>
          <Link to="/products" style={linkStyle}>Products</Link>
          <Link to="/build-kit" style={{ ...linkStyle, background: '#4338ca', color: '#fff', marginLeft: '6px' }}>Build Custom Kit</Link>

          {/* Strategy Dropdown */}
          <div style={{ position: 'relative' }} onMouseEnter={() => setStrategyOpen(true)} onMouseLeave={() => setStrategyOpen(false)}>
            <button style={{ ...linkStyle, background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              📊 Strategy ▾
            </button>
            {strategyOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '8px', minWidth: '240px', boxShadow: '0 8px 32px rgba(0,0,0,.4)', zIndex: 2000 }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', padding: '4px 10px 8px', letterSpacing: '1px' }}>CRM STRATEGIES</div>
                <Link to="/loyalty" onClick={() => setStrategyOpen(false)} style={{ display: 'flex', gap: '10px', padding: '10px', borderRadius: '8px', textDecoration: 'none', marginBottom: '2px' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#334155'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span>🏆</span>
                  <div><div style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>ShieldPoints™ Loyalty</div><div style={{ color: '#64748b', fontSize: '11px' }}>CRM Component 1 — Retention</div></div>
                </Link>
                <Link to="/safety-profile" onClick={() => setStrategyOpen(false)} style={{ display: 'flex', gap: '10px', padding: '10px', borderRadius: '8px', textDecoration: 'none', marginBottom: '8px' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#334155'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span>🧠</span>
                  <div><div style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>SafetyProfile™</div><div style={{ color: '#64748b', fontSize: '11px' }}>CRM Component 2 — Personalization</div></div>
                </Link>
                <div style={{ height: '1px', background: '#334155', margin: '4px 8px 8px' }} />
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', padding: '0 10px 8px', letterSpacing: '1px' }}>SCM STRATEGY</div>
                <Link to="/scm-dashboard" onClick={() => setStrategyOpen(false)} style={{ display: 'flex', gap: '10px', padding: '10px', borderRadius: '8px', textDecoration: 'none', marginBottom: '8px' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#334155'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span>📦</span>
                  <div><div style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>Demand SCM Dashboard</div><div style={{ color: '#64748b', fontSize: '11px' }}>Demand Analysis-Driven SCM</div></div>
                </Link>
                <div style={{ height: '1px', background: '#334155', margin: '4px 8px 8px' }} />
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', padding: '0 10px 8px', letterSpacing: '1px' }}>MARKET UNIQUENESS</div>
                <Link to="/why-us" onClick={() => setStrategyOpen(false)} style={{ display: 'flex', gap: '10px', padding: '10px', borderRadius: '8px', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#334155'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span>🏅</span>
                  <div><div style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>Why LIFESHIELD?</div><div style={{ color: '#64748b', fontSize: '11px' }}>Market Survey & Competitive Edge</div></div>
                </Link>
              </div>
            )}
          </div>

          {user && isAdmin && (
            <Link to="/admin" style={{ ...linkStyle, color: '#fbbf24' }}>⚙️ Admin</Link>
          )}
          {user ? (
            <>
              <Link to="/orders" style={linkStyle}>My Orders</Link>
              <button onClick={handleLogout} style={{ ...linkStyle, background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', cursor: 'pointer' }}>
                Logout ({user.name?.split(' ')[0]})
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={linkStyle}>Login</Link>
              <Link to="/register" style={{ ...linkStyle, background: '#334155', color: '#fff' }}>Register</Link>
            </>
          )}
          <Link to="/cart" style={{ position: 'relative', background: '#dc2626', color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px', flexShrink: 0 }}>
            🛒 Cart
            {cartCount > 0 && (
              <span style={{ background: '#fff', color: '#dc2626', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
