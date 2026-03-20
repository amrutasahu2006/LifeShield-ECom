import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const categoryColors = {
  'First Aid Kits': '#ef4444',
  'Fire Safety Equipment': '#f97316',
  'Disaster Preparedness Kits': '#8b5cf6',
  'Personal Safety Devices': '#06b6d4',
}

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setAdding(true)
    setErrorMsg('')
    const result = await addToCart(product._id, 1)
    if (!result.success) {
      setErrorMsg(result.message)
      setAdding(false)
      return
    }
    setAdded(true)
    setAdding(false)
    setTimeout(() => setAdded(false), 1500)
  }

  const color = categoryColors[product.category] || '#dc2626'
  const formatINR = (value) => `Rs. ${Number(value).toFixed(2)}`

  return (
    <div
      style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)' }}
    >
      <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative', height: '200px', background: '#f1f5f9', overflow: 'hidden' }}>
          {product.image
            ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
            : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '60px' }}>🛡️</div>
          }
          {product.featured && (
            <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#dc2626', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>⭐ FEATURED</span>
          )}
          {product.stock === 0 && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>OUT OF STOCK</span>
            </div>
          )}
        </div>
        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <span style={{ background: color + '18', color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', alignSelf: 'flex-start', marginBottom: '8px' }}>{product.category}</span>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '8px', lineHeight: '1.4', flex: 1 }}>{product.name}</h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#dc2626' }}>{formatINR(product.price)}</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: product.stock > 10 ? '#16a34a' : product.stock > 0 ? '#d97706' : '#dc2626' }}>
              {product.stock > 10 ? '✓ In Stock' : product.stock > 0 ? `Only ${product.stock} left` : '✗ Out of Stock'}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>⭐ {product.rating} ({product.numReviews} reviews)</div>
        </div>
      </Link>
      <div style={{ padding: '0 16px 16px' }}>
        <button
          onClick={handleAddToCart}
          disabled={loading || adding || product.stock === 0}
          style={{ width: '100%', padding: '10px', background: product.stock === 0 ? '#94a3b8' : '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s' }}
        >
          {product.stock === 0 ? 'Out of Stock' : adding ? 'Adding...' : added ? '✅ Added' : '🛒 Add to Cart'}
        </button>
        {errorMsg && <div style={{ marginTop: '8px', fontSize: '12px', color: '#dc2626' }}>{errorMsg}</div>}
      </div>
    </div>
  )
}
