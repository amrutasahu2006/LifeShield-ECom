import React, { useMemo, useState } from 'react'
import { createRazorpayOrder, subscriptionAPI, verifyPayment } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const PLANS = {
  monthly: {
    label: 'Monthly',
    price: 199,
    subtitle: 'Perfect for short-term protection and savings'
  },
  yearly: {
    label: 'Yearly',
    price: 999,
    subtitle: 'Best value for uninterrupted premium benefits'
  }
}

export default function SubscriptionPage() {
  const { user, updateUser } = useAuth()
  const [loadingPlan, setLoadingPlan] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const activeSubscription = useMemo(() => {
    const expiryDate = user?.subscription?.expiryDate ? new Date(user.subscription.expiryDate) : null
    const isValidDate = expiryDate && !Number.isNaN(expiryDate.getTime())

    return {
      isActive: Boolean(user?.subscription?.isActive && isValidDate && expiryDate > new Date()),
      plan: user?.subscription?.plan || null,
      expiryDate: isValidDate ? expiryDate : null
    }
  }, [user])

  const formatINR = (value) => `Rs. ${Number(value).toFixed(2)}`

  const activatePlan = async (planKey) => {
    setError('')
    setMessage('')
    setLoadingPlan(planKey)

    try {
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please refresh and try again.')
      }

      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID
      if (!keyId) {
        throw new Error('Razorpay key is missing. Set VITE_RAZORPAY_KEY_ID in frontend environment.')
      }

      const selectedPlan = PLANS[planKey]
      const { data: razorpayOrder } = await createRazorpayOrder(selectedPlan.price)

      await new Promise((resolve, reject) => {
        const paymentObject = new window.Razorpay({
          key: keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'LIFESHIELD Premium',
          description: `${selectedPlan.label} Plan Subscription`,
          order_id: razorpayOrder.id,
          prefill: {
            name: user?.name || '',
            email: user?.email || ''
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

              const { data: activatedUser } = await subscriptionAPI.activate(planKey)
              updateUser({ subscription: activatedUser.subscription })
              setMessage(`Subscription activated! ${selectedPlan.label} plan is now active.`)
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
      setError(err.response?.data?.message || err.message || 'Unable to activate subscription right now.')
    } finally {
      setLoadingPlan('')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <div style={{ background: '#0f172a', color: '#fff', borderRadius: '24px', padding: '32px', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800' }}>LIFESHIELD Premium</h1>
          <p style={{ margin: '10px 0 0', color: '#cbd5e1', fontSize: '15px' }}>
            Unlock premium benefits with subscription billing powered by Razorpay.
          </p>
          {activeSubscription.isActive && (
            <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#16a34a', padding: '8px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: '700' }}>
              Premium User
            </div>
          )}
        </div>

        {message && (
          <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', fontSize: '14px', fontWeight: '600' }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '14px', fontWeight: '600' }}>
            {error}
          </div>
        )}

        {activeSubscription.isActive && activeSubscription.expiryDate && (
          <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a', fontSize: '14px', fontWeight: '600' }}>
            Active plan: {activeSubscription.plan} | Expires on {activeSubscription.expiryDate.toLocaleDateString()}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {Object.entries(PLANS).map(([planKey, plan]) => {
            const isCurrentPlan = activeSubscription.isActive && activeSubscription.plan === planKey

            return (
              <div key={planKey} style={{ background: '#fff', borderRadius: '18px', padding: '24px', border: isCurrentPlan ? '2px solid #16a34a' : '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h2 style={{ marginTop: 0, marginBottom: '6px', color: '#0f172a', fontSize: '24px' }}>{plan.label}</h2>
                <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '14px' }}>{plan.subtitle}</p>

                <div style={{ fontSize: '34px', fontWeight: '800', color: '#dc2626', marginBottom: '16px' }}>{formatINR(plan.price)}</div>

                <ul style={{ margin: '0 0 22px', paddingLeft: '20px', color: '#334155', lineHeight: '1.8', fontSize: '14px' }}>
                  <li>10% discount on all checkout orders</li>
                  <li>Premium badge in account navigation</li>
                  <li>Priority seasonal offers and updates</li>
                </ul>

                <button
                  onClick={() => activatePlan(planKey)}
                  disabled={activeSubscription.isActive || loadingPlan === planKey}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeSubscription.isActive ? '#94a3b8' : '#dc2626',
                    color: '#fff',
                    fontWeight: '700',
                    cursor: activeSubscription.isActive ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loadingPlan === planKey ? 'Processing...' : activeSubscription.isActive ? 'Already Subscribed' : `Subscribe ${plan.label}`}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
