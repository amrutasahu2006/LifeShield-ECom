import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { sharedKitAPI } from '../utils/api'

export default function SharedKitPage() {
  const { shortId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sharedKit, setSharedKit] = useState(null)

  const products = useMemo(() => sharedKit?.products || [], [sharedKit])

  useEffect(() => {
    const fetchSharedKit = async () => {
      setLoading(true)
      setError('')

      try {
        const { data } = await sharedKitAPI.getByShortId(shortId)
        setSharedKit(data)

        if (data?.referrerId) {
          localStorage.setItem('lifeshieldReferrerId', String(data.referrerId))
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load this shared kit right now.')
      } finally {
        setLoading(false)
      }
    }

    if (shortId) {
      fetchSharedKit()
    }
  }, [shortId])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl">
          <p className="text-sm text-slate-300">Loading shared emergency kit...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
        <div className="mx-auto max-w-5xl rounded-2xl border border-red-900/50 bg-slate-900/70 p-6 shadow-2xl">
          <h1 className="mb-3 text-xl font-semibold">Shared Kit Unavailable</h1>
          <p className="mb-6 text-sm text-slate-300">{error}</p>
          <Link
            to="/products"
            className="inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-sm">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-red-400">LifeShield Shared Kit</p>
          <h1 className="mb-3 text-2xl font-bold md:text-3xl">Emergency Kit Recommended by a Friend</h1>
          <p className="text-sm text-slate-300 md:text-base">
            Add any of these essentials to your cart. The referral will be automatically remembered for checkout.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300">
            This shared kit has no products.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product._id}
                className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl transition hover:-translate-y-1 hover:border-slate-600"
              >
                <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-slate-800">
                  <img
                    src={product.image || '/shield.svg'}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-red-400">{product.category}</p>
                <h2 className="mb-2 text-lg font-semibold text-white">{product.name}</h2>
                <p className="mb-4 line-clamp-3 text-sm text-slate-300">{product.description}</p>
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="font-semibold text-emerald-400">Rs. {Number(product.price).toFixed(2)}</span>
                  <span className="text-slate-400">Stock: {product.stock}</span>
                </div>
                <Link
                  to={`/products/${product._id}`}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                  View Product
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
