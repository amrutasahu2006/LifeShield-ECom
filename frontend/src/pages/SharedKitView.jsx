import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { cartAPI, productAPI, sharedKitAPI } from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const FIXED_KIT_CONTENTS = [
  'Emergency Water Pouches (12-pk)',
  'LifeStraw Personal Filter',
  'Burn Gel & Dressings',
  'Multi-Tool Survival Knife'
]

export default function SharedKitView() {
  const { shortId } = useParams()
  const navigate = useNavigate()
  const { fetchCart, addGuestCustomKit } = useCart()
  const { user } = useAuth()

  const [sharedKit, setSharedKit] = useState(null)
  const [customKitProduct, setCustomKitProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const kitDetails = useMemo(() => {
    const backendKit = sharedKit?.kitDetails || []
    return backendKit.length > 0 ? backendKit : FIXED_KIT_CONTENTS
  }, [sharedKit])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [{ data: sharedData }, { data: productsData }] = await Promise.all([
          sharedKitAPI.getByShortId(shortId),
          productAPI.getAll({ limit: 100 })
        ])

        setSharedKit(sharedData)

        const customKit = productsData?.products?.find((p) => p.sku === 'PULL-SCM-CUSTOM')
        setCustomKitProduct(customKit || null)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load shared custom kit')
      } finally {
        setLoading(false)
      }
    }

    if (shortId) {
      load()
    }
  }, [shortId])

  const handleAddToCart = async () => {
    if (!sharedKit?.referrerId && !sharedKit?._id) {
      alert('Invalid referral data for this shared kit.')
      return
    }

    setSubmitting(true)
    try {
      if (sharedKit?.referrerId) {
        localStorage.setItem('lifeshieldReferrerId', String(sharedKit.referrerId))
      }

      if (user) {
        if (!customKitProduct?._id) {
          throw new Error('Custom kit product is unavailable right now. Please try again later.')
        }

        await cartAPI.add({
          productId: customKitProduct._id,
          quantity: 1,
          customComponents: kitDetails
        })
      } else {
        addGuestCustomKit({
          name: 'Custom Emergency Kit (Shared)',
          category: 'Disaster Preparedness Kits',
          customComponents: kitDetails,
          price: 999,
          image: 'https://images.unsplash.com/photo-1612831455740-a2f6cb179db4?w=900&auto=format&fit=crop'
        })
      }

      await fetchCart()
      navigate('/cart')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add shared custom kit to cart')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          Loading shared kit...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-900/60 bg-slate-900/80 p-6">
          <h1 className="mb-2 text-xl font-bold">Kit not available</h1>
          <p className="text-sm text-slate-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-sm">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-red-400">LifeShield Shared Kit</p>
          <h1 className="mb-3 text-3xl font-extrabold text-white">Survival Kit Shared With You</h1>
          <p className="text-sm leading-6 text-slate-300">
            A friend shared this custom emergency setup from LifeShield. Review the curated essentials below and add the same kit to your cart instantly.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1612831455740-a2f6cb179db4?w=1200&auto=format&fit=crop"
              alt="LifeShield survival kit"
              className="h-72 w-full object-cover"
            />
            <div className="border-t border-slate-700 p-4 text-xs text-slate-400">
              Visual preview of a compact emergency survival kit setup.
            </div>
          </div>

          <div className="rounded-2xl border border-blue-900/40 bg-slate-900/70 p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-blue-300">Kit Contents</h2>
            <ul className="space-y-3 text-sm text-slate-100">
              {kitDetails.map((component, idx) => (
                <li key={`${component}-${idx}`} className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2">
                  {component}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={submitting}
              className="mt-6 w-full rounded-xl bg-red-600 px-6 py-4 text-base font-extrabold tracking-wide text-white shadow-lg shadow-red-950/40 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Adding...' : 'Add to Cart'}
            </button>

            <p className="mt-3 text-xs text-slate-400">
              Referral tracking is saved securely in this browser session for reward attribution.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
