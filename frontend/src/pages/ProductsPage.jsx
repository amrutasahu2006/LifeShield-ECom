import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productAPI } from '../utils/api'
import ProductCard from '../components/ProductCard'

const categories = ['All', 'First Aid Kits', 'Fire Safety Equipment', 'Disaster Preparedness Kits', 'Personal Safety Devices']

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const activeCategory = searchParams.get('category') || ''

  const fetchProducts = async (searchTerm = search) => {
    setLoading(true)
    try {
      const params = {}
      if (activeCategory) params.category = activeCategory
      if (searchTerm) params.search = searchTerm
      const { data } = await productAPI.getAll(params)
      setProducts(data.products)
      setTotal(data.total)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [activeCategory])

  const handleSearch = (e) => { e.preventDefault(); fetchProducts() }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '40px 24px', color: '#fff', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>🛡️ Safety Products</h1>
        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>{total} products to keep you prepared</p>
        <form onSubmit={handleSearch} style={{ display: 'flex', maxWidth: '500px', margin: '0 auto', gap: '8px' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: 'none', fontSize: '14px', background: 'rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
          <button type="submit" style={{ padding: '12px 24px', background: '#dc2626', color: '#fff', borderRadius: '10px', fontWeight: '600', fontSize: '14px', border: 'none', cursor: 'pointer' }}>Search</button>
        </form>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', alignItems: 'start' }}>
        <aside>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>Categories</h3>
            {categories.map(cat => (
              <button key={cat}
                onClick={() => setSearchParams(cat === 'All' ? {} : { category: cat })}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', marginBottom: '4px', borderRadius: '10px', fontSize: '14px', fontWeight: (cat === 'All' && !activeCategory) || cat === activeCategory ? '700' : '500', background: (cat === 'All' && !activeCategory) || cat === activeCategory ? '#dc2626' : 'transparent', color: (cat === 'All' && !activeCategory) || cat === activeCategory ? '#fff' : '#64748b', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                {cat}
              </button>
            ))}
          </div>
        </aside>

        <div>
          {loading
            ? <div style={{ textAlign: 'center', padding: '80px', color: '#64748b', fontSize: '18px' }}>⏳ Loading products...</div>
            : products.length === 0
              ? <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
                  <h3>No products found</h3>
                  <p>Try a different category or search term</p>
                </div>
              : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
          }
        </div>
      </div>
    </div>
  )
}
