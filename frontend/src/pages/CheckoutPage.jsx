import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { orderAPI } from '../utils/api'

export default function CheckoutPage() {
  const { cart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [address, setAddress] = useState({ fullName: '', street: '', city: '', state: '', zip: '', country: 'India' })
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [errors, setErrors] = useState({})
  const [orderError, setOrderError] = useState('')

  const shipping = cart.totalAmount > 100 ? 0 : 9.99
  const tax = parseFloat((cart.totalAmount * 0.1).toFixed(2))
  const total = parseFloat((cart.totalAmount + shipping + tax).toFixed(2))

  const validateAddress = () => {
    const e = {}
    if (!address.fullName) e.fullName = 'Required'
    if (!address.street) e.street = 'Required'
    if (!address.city) e.city = 'Required'
    if (!address.state) e.state = 'Required'
    if (!address.zip) e.zip = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    setOrderError('')
    try {
      const { data } = await orderAPI.create({ shippingAddress: address, paymentMethod: 'Card (Demo)' })
      navigate('/order-success', { state: { orderId: data._id, total: data.totalPrice } })
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Order failed. Please try again.')
    } finally { setLoading(false) }
  }

  if (cart.items.length === 0) { navigate('/cart'); return null }

  const inputStyle = { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px', color: '#1e293b' }}>Checkout</h1>

        <div style={{ display: 'flex', marginBottom: '32px', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {[['1', 'Shipping'], ['2', 'Payment'], ['3', 'Review']].map(([n, label]) => (
            <div key={n} style={{ flex: 1, padding: '16px', textAlign: 'center', background: step >= Number(n) ? '#dc2626' : '#fff', color: step >= Number(n) ? '#fff' : '#94a3b8', fontWeight: '600', fontSize: '14px' }}>
              {n}. {label}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

            {step === 1 && (
              <>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>📦 Shipping Address</h2>
                {[['fullName','Full Name'],['street','Street Address'],['city','City'],['state','State'],['zip','ZIP / Postal Code'],['country','Country']].map(([field, label]) => (
                  <div key={field} style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#374151' }}>{label}</label>
                    <input value={address[field]} onChange={e => setAddress({ ...address, [field]: e.target.value })} style={{ ...inputStyle, borderColor: errors[field] ? '#dc2626' : '#e2e8f0' }} />
                    {errors[field] && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors[field]}</span>}
                  </div>
                ))}
                <button onClick={() => { if (validateAddress()) setStep(2) }}
                  style={{ padding: '14px 32px', background: '#dc2626', color: '#fff', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', border: 'none' }}>
                  Continue to Payment →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>💳 Payment (Demo)</h2>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px', padding: '12px', background: '#fef9c3', borderRadius: '8px', border: '1px solid #fde047' }}>
                  ⚠️ This is a demo checkout. No real payment is processed.
                </p>
                {[['number','Card Number','1234 5678 9012 3456'],['name','Name on Card','John Doe']].map(([f,l,ph]) => (
                  <div key={f} style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>{l}</label>
                    <input value={card[f]} onChange={e => setCard({ ...card, [f]: e.target.value })} placeholder={ph} style={inputStyle} />
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  {[['expiry','Expiry','MM/YY'],['cvv','CVV','123']].map(([f,l,ph]) => (
                    <div key={f}>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>{l}</label>
                      <input value={card[f]} onChange={e => setCard({ ...card, [f]: e.target.value })} placeholder={ph} style={inputStyle} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setStep(1)} style={{ padding: '14px 20px', background: '#f1f5f9', color: '#374151', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', border: 'none' }}>← Back</button>
                  <button onClick={() => setStep(3)} style={{ flex: 1, padding: '14px', background: '#dc2626', color: '#fff', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', border: 'none' }}>Review Order →</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>✅ Review Order</h2>
                {orderError && (
                  <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '14px', fontWeight: '600' }}>
                    {orderError}
                  </div>
                )}
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: '#64748b', textTransform: 'uppercase' }}>Shipping To</h3>
                  <p style={{ fontSize: '15px', lineHeight: '1.6' }}>{address.fullName}<br />{address.street}, {address.city}<br />{address.state} {address.zip}, {address.country}</p>
                </div>
                {cart.items.map(item => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                    <span>{item.product?.name} × {item.quantity}</span>
                    <span style={{ fontWeight: '700' }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button onClick={() => setStep(2)} style={{ padding: '14px 20px', background: '#f1f5f9', color: '#374151', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', border: 'none' }}>← Back</button>
                  <button onClick={handlePlaceOrder} disabled={loading}
                    style={{ flex: 1, padding: '14px', background: '#dc2626', color: '#fff', borderRadius: '10px', fontWeight: '700', fontSize: '16px', cursor: loading ? 'wait' : 'pointer', border: 'none' }}>
                    {loading ? 'Placing Order...' : `🔒 Place Order – $${total.toFixed(2)}`}
                  </button>
                </div>
              </>
            )}
          </div>

          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>Order Summary</h3>
            {cart.items.map(item => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>{(item.product?.name || '').substring(0, 22)}... ×{item.quantity}</span>
                <span style={{ fontWeight: '600' }}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '8px' }}>
              {[['Subtotal', `$${cart.totalAmount.toFixed(2)}`], ['Shipping', shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`], ['Tax', `$${tax.toFixed(2)}`]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#64748b' }}>
                  <span>{l}</span><span style={{ color: '#1e293b', fontWeight: '600' }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: '800' }}>Total</span>
                <span style={{ fontWeight: '800', color: '#dc2626', fontSize: '18px' }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
