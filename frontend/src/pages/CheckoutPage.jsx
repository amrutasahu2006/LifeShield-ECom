import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { createRazorpayOrder, orderAPI, verifyPayment } from '../utils/api'

export default function CheckoutPage() {
  const { cart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [address, setAddress] = useState({ fullName: '', street: '', city: '', state: '', zip: '', country: 'India' })
  const [errors, setErrors] = useState({})
  const [orderError, setOrderError] = useState('')

  const shipping = cart.totalAmount > 3000 ? 0 : 99
  const tax = parseFloat((cart.totalAmount * 0.1).toFixed(2))
  const total = parseFloat((cart.totalAmount + shipping + tax).toFixed(2))
  const formatINR = (value) => `Rs. ${Number(value).toFixed(2)}`

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
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please refresh and try again.')
      }

      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID
      if (!keyId) {
        throw new Error('Razorpay key is missing. Set VITE_RAZORPAY_KEY_ID in frontend environment.')
      }

      const { data: razorpayOrder } = await createRazorpayOrder(total)
      const user = JSON.parse(localStorage.getItem('lifeshieldUser') || 'null')

      await new Promise((resolve, reject) => {
        const paymentObject = new window.Razorpay({
          key: keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'LIFESHIELD',
          description: 'Secure payment for your order',
          order_id: razorpayOrder.id,
          prefill: {
            name: address.fullName || user?.name || '',
            email: user?.email || ''
          },
          notes: {
            city: address.city
          },
          theme: {
            color: '#dc2626'
          },
          handler: async (response) => {
            try {
              const { data: verificationData } = await verifyPayment(response)
              if (!verificationData?.success || !verificationData?.verifiedPayment) {
                return reject(new Error('Payment verification failed'))
              }

              const { data: orderData } = await orderAPI.create({
                shippingAddress: address,
                paymentMethod: 'Razorpay',
                verifiedPayment: verificationData.verifiedPayment
              })

              navigate('/order-success', {
                state: { orderId: orderData._id, total: orderData.totalPrice }
              })
              resolve()
            } catch (err) {
              reject(err)
            }
          }
        })

        paymentObject.on('payment.failed', (response) => {
          reject(new Error(response?.error?.description || 'Payment failed. Please try again.'))
        })

        paymentObject.open()
      })
    } catch (err) {
      setOrderError(err.response?.data?.message || err.message || 'Order failed. Please try again.')
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
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>💳 Payment Method</h2>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px', padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  You will complete payment securely in Razorpay popup on the next step.
                </p>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Razorpay</p>
                  <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b' }}>UPI, cards, netbanking, and wallets</p>
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
                    <span style={{ fontWeight: '700' }}>{formatINR(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button onClick={() => setStep(2)} style={{ padding: '14px 20px', background: '#f1f5f9', color: '#374151', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', border: 'none' }}>← Back</button>
                  <button onClick={handlePlaceOrder} disabled={loading}
                    style={{ flex: 1, padding: '14px', background: '#dc2626', color: '#fff', borderRadius: '10px', fontWeight: '700', fontSize: '16px', cursor: loading ? 'wait' : 'pointer', border: 'none' }}>
                    {loading ? 'Placing Order...' : `🔒 Place Order – ${formatINR(total)}`}
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
                <span style={{ fontWeight: '600' }}>{formatINR(item.price * item.quantity)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '8px' }}>
              {[['Subtotal', formatINR(cart.totalAmount)], ['Shipping', shipping === 0 ? 'FREE' : formatINR(shipping)], ['Tax', formatINR(tax)]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#64748b' }}>
                  <span>{l}</span><span style={{ color: '#1e293b', fontWeight: '600' }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: '800' }}>Total</span>
                <span style={{ fontWeight: '800', color: '#dc2626', fontSize: '18px' }}>{formatINR(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
