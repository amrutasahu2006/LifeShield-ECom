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
  const formatINR = (value) => `Rs. ${Number(value).toFixed(2)}`
  const stock = Number.isFinite(Number(product.stock)) ? Math.floor(Number(product.stock)) : 0
  const lowStockThreshold = Number.isFinite(Number(product.lowStockThreshold)) ? Math.floor(Number(product.lowStockThreshold)) : 5
  const isOutOfStock = stock <= 0
  const isLowStock = !isOutOfStock && stock <= lowStockThreshold

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Link to="/products" style={{ color: '#dc2626', textDecoration: 'none', fontWeight: '600', fontSize: '14px', display: 'inline-block', marginBottom: '20px' }}>← Back to Products</Link>

        <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <div style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px', position: 'relative', overflow: 'hidden' }}>
            {product.image
              ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '20px', position: 'absolute', inset: 0 }} onError={e => e.target.style.display = 'none'} />
              : <div style={{ fontSize: '80px' }}>🛡️</div>
            }
          </div>

          <div style={{ padding: '32px' }}>
            <span style={{ background: color + '18', color, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{product.category}</span>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '12px 0 10px', lineHeight: '1.2' }}>{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ color: '#f59e0b', fontSize: '14px' }}>⭐ {product.rating}</span>
              <span style={{ color: '#64748b', fontSize: '13px' }}>({product.numReviews} reviews)</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#dc2626', marginBottom: '12px' }}>{formatINR(product.price)}</div>
            <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '20px', fontSize: '14px' }}>{product.description}</p>

            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
              {[['Brand', product.brand || 'LIFESHIELD'], ['SKU', product.sku], ['Stock', stock > 0 ? `${stock} in stock` : 'Out of Stock']].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>{l}</span>
                  <span style={{ fontWeight: '700', color: l === 'Stock' ? (stock > 0 ? '#16a34a' : '#dc2626') : '#1e293b' }}>{v}</span>
                </div>
              ))}
              {isLowStock && (
                <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: '700', color: '#d97706' }}>
                  Low Stock: only {stock} left
                </div>
              )}
            </div>

            {!isOutOfStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <label style={{ fontWeight: '600', fontSize: '14px' }}>Qty:</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: '6px 12px', background: '#f1f5f9', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' }}>-</button>
                  <span style={{ padding: '6px 14px', fontWeight: '600', fontSize: '14px' }}>{qty}</span>
                  <button onClick={() => setQty(Math.min(stock, qty + 1))} style={{ padding: '6px 12px', background: '#f1f5f9', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' }}>+</button>
                </div>
              </div>
            )}

            {msg && <div style={{ padding: '10px', borderRadius: '8px', marginBottom: '12px', background: msg.includes('✅') ? '#dcfce7' : '#fee2e2', color: msg.includes('✅') ? '#16a34a' : '#dc2626', fontWeight: '600', fontSize: '13px' }}>{msg}</div>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleAddToCart} disabled={loading || isOutOfStock}
                style={{ flex: 1, padding: '12px', background: isOutOfStock ? '#94a3b8' : '#dc2626', color: '#fff', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: isOutOfStock ? 'not-allowed' : 'pointer', border: 'none' }}>
                {isOutOfStock ? 'Out of Stock' : '🛒 Add to Cart'}
              </button>
              {!isOutOfStock && (
                <button onClick={async () => { await handleAddToCart(); navigate('/cart') }}
                  style={{ padding: '12px 20px', background: '#1e293b', color: '#fff', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none' }}>
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
