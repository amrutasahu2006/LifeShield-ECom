import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productAPI } from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const categoryColors = { 'First Aid Kits': '#ef4444', 'Fire Safety Equipment': '#f97316', 'Disaster Preparedness Kits': '#8b5cf6', 'Personal Safety Devices': '#06b6d4' }

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [msg, setMsg] = useState('')
  const { addToCart, loading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    productAPI.getById(id).then(r => setProduct(r.data)).catch(() => navigate('/products'))
  }, [id])

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return }
    const result = await addToCart(product._id, qty)
    setMsg(result.success ? '✅ Added to cart!' : `❌ ${result.message}`)
    setTimeout(() => setMsg(''), 3000)
  }

  if (!product) return <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>Loading...</div>

  const color = categoryColors[product.category] || '#dc2626'

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <Link to="/products" style={{ color: '#dc2626', textDecoration: 'none', fontWeight: '500', display: 'inline-block', marginBottom: '24px' }}>← Back to Products</Link>

        <div style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', position: 'relative', overflow: 'hidden' }}>
            {product.image
              ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} onError={e => e.target.style.display = 'none'} />
              : <div style={{ fontSize: '100px' }}>🛡️</div>
            }
          </div>

          <div style={{ padding: '48px' }}>
            <span style={{ background: color + '18', color, padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{product.category}</span>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e293b', margin: '16px 0 12px', lineHeight: '1.3' }}>{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ color: '#f59e0b' }}>⭐ {product.rating}</span>
              <span style={{ color: '#64748b', fontSize: '14px' }}>({product.numReviews} reviews)</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#dc2626', marginBottom: '16px' }}>${product.price.toFixed(2)}</div>
            <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '24px', fontSize: '15px' }}>{product.description}</p>

            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
              {[['Brand', product.brand || 'LIFESHIELD'], ['SKU', product.sku], ['Stock', product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock']].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#64748b' }}>{l}</span>
                  <span style={{ fontWeight: '700', color: l === 'Stock' ? (product.stock > 0 ? '#16a34a' : '#dc2626') : '#1e293b' }}>{v}</span>
                </div>
              ))}
            </div>

            {product.stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <label style={{ fontWeight: '600' }}>Qty:</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: '8px 14px', background: '#f1f5f9', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer' }}>-</button>
                  <span style={{ padding: '8px 16px', fontWeight: '600' }}>{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} style={{ padding: '8px 14px', background: '#f1f5f9', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer' }}>+</button>
                </div>
              </div>
            )}

            {msg && <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '12px', background: msg.includes('✅') ? '#dcfce7' : '#fee2e2', color: msg.includes('✅') ? '#16a34a' : '#dc2626', fontWeight: '600', fontSize: '14px' }}>{msg}</div>}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleAddToCart} disabled={loading || product.stock === 0}
                style={{ flex: 1, padding: '14px', background: product.stock === 0 ? '#94a3b8' : '#dc2626', color: '#fff', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', border: 'none' }}>
                {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
              </button>
              {product.stock > 0 && (
                <button onClick={async () => { await handleAddToCart(); navigate('/cart') }}
                  style={{ padding: '14px 20px', background: '#1e293b', color: '#fff', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none' }}>
                  Buy Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
