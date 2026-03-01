import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function CartPage() {
  const { cart, updateItem, removeItem, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Please log in to view your cart</h2>
      <Link to="/login" style={{ background: '#dc2626', color: '#fff', padding: '12px 32px', borderRadius: '10px', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
    </div>
  )

  if (cart.items.length === 0) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Your cart is empty</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>Add some safety products to get started</p>
      <Link to="/products" style={{ background: '#dc2626', color: '#fff', padding: '12px 32px', borderRadius: '10px', fontWeight: '600', textDecoration: 'none' }}>Shop Now</Link>
    </div>
  )

  const shipping = cart.totalAmount > 100 ? 0 : 9.99
  const tax = parseFloat((cart.totalAmount * 0.1).toFixed(2))
  const total = parseFloat((cart.totalAmount + shipping + tax).toFixed(2))

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '32px', color: '#1e293b' }}>🛒 Shopping Cart</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
          <div>
            {cart.items.map(item => (
              <div key={item._id} style={{ background: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                  {item.product?.image
                    ? <img src={item.product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '32px' }}>🛡️</div>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px', color: '#1e293b' }}>{item.product?.name}</h3>
                  <p style={{ color: '#64748b', fontSize: '13px' }}>{item.product?.category}</p>
                  <p style={{ color: '#dc2626', fontWeight: '700', fontSize: '16px', marginTop: '4px' }}>${item.price?.toFixed(2)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <button onClick={() => updateItem(item._id, item.quantity - 1)} style={{ padding: '6px 12px', background: '#f1f5f9', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer' }}>-</button>
                  <span style={{ padding: '6px 14px', fontWeight: '600' }}>{item.quantity}</span>
                  <button onClick={() => updateItem(item._id, item.quantity + 1)} style={{ padding: '6px 12px', background: '#f1f5f9', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer' }}>+</button>
                </div>
                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  <p style={{ fontWeight: '700', fontSize: '16px' }}>${(item.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeItem(item._id)} style={{ color: '#dc2626', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px' }}>Remove</button>
                </div>
              </div>
            ))}
            <button onClick={clearCart} style={{ color: '#64748b', fontSize: '13px', background: 'none', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Clear Cart</button>
          </div>

          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'sticky', top: '90px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', color: '#1e293b' }}>Order Summary</h2>
            {[['Subtotal', `$${cart.totalAmount.toFixed(2)}`], ['Shipping', shipping === 0 ? 'FREE 🎉' : `$${shipping.toFixed(2)}`], ['Tax (10%)', `$${tax.toFixed(2)}`]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
                <span>{l}</span><span style={{ color: '#1e293b', fontWeight: '600' }}>{v}</span>
              </div>
            ))}
            {shipping === 0 && <p style={{ fontSize: '12px', color: '#16a34a', marginBottom: '12px' }}>✓ Free shipping on orders over $100</p>}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '800', fontSize: '18px' }}>Total</span>
              <span style={{ fontWeight: '800', fontSize: '22px', color: '#dc2626' }}>${total.toFixed(2)}</span>
            </div>
            <button onClick={() => navigate('/checkout')}
              style={{ width: '100%', padding: '16px', background: '#dc2626', color: '#fff', borderRadius: '12px', fontWeight: '700', fontSize: '16px', marginTop: '20px', cursor: 'pointer', border: 'none' }}>
              Proceed to Checkout →
            </button>
            <Link to="/products" style={{ display: 'block', textAlign: 'center', marginTop: '12px', color: '#64748b', fontSize: '14px', textDecoration: 'none' }}>← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
