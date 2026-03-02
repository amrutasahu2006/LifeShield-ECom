import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiLogOut, FiSettings, FiActivity, FiBox, FiShoppingCart } from 'react-icons/fi'

export default function AdminNavbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout();
        navigate('/')
    }

    const location = useLocation()
    const currentPath = location.pathname

    const linkStyle = {
        color: '#cbd5e1',
        padding: '8px 14px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease'
    }

    return (
        <nav style={{ background: '#0f172a', padding: '0 24px', position: 'sticky', top: 0, zIndex: 1000, borderBottom: '1px solid #1e293b' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

                {/* Brand & Admin Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <span style={{ fontSize: '24px' }}>🛡️</span>
                        <div style={{ color: '#fff', fontWeight: '800', fontSize: '18px', letterSpacing: '-0.5px' }}>LIFESHIELD</div>
                    </Link>
                    <div style={{ height: '24px', width: '1px', background: '#334155' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.05em' }}>
                        <FiSettings size={14} /> ADMIN CONSOLE
                    </div>
                </div>

                {/* Admin Navigation & Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '100%' }}>

                    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <Link to="/admin" style={{ ...linkStyle, height: '100%', borderRadius: 0, borderBottom: currentPath === '/admin' ? '3px solid #60a5fa' : '3px solid transparent', color: currentPath === '/admin' ? '#fff' : '#cbd5e1' }}>
                            <FiActivity size={18} /> Dashboard
                        </Link>
                        <Link to="/admin/products" style={{ ...linkStyle, height: '100%', borderRadius: 0, borderBottom: currentPath === '/admin/products' ? '3px solid #60a5fa' : '3px solid transparent', color: currentPath === '/admin/products' ? '#fff' : '#cbd5e1', marginLeft: '8px' }}>
                            <FiBox size={18} /> Products
                        </Link>
                        <Link to="/admin/orders" style={{ ...linkStyle, height: '100%', borderRadius: 0, borderBottom: currentPath === '/admin/orders' ? '3px solid #60a5fa' : '3px solid transparent', color: currentPath === '/admin/orders' ? '#fff' : '#cbd5e1', marginLeft: '8px' }}>
                            <FiShoppingCart size={18} /> Orders
                        </Link>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            ...linkStyle,
                            color: '#ef4444',
                            background: 'transparent',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.border = '1px solid rgba(239, 68, 68, 0.4)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.border = '1px solid rgba(239, 68, 68, 0.2)' }}
                    >
                        <FiLogOut size={16} /> Logout
                    </button>

                </div>
            </div>
        </nav>
    )
}
