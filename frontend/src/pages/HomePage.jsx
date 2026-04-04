import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productAPI } from '../utils/api'
import ProductCard from '../components/ProductCard'

const categories = [
  { name: 'First Aid Kits', icon: '🩺', color: '#ef4444', desc: 'Professional medical supplies' },
  { name: 'Fire Safety Equipment', icon: '🔥', color: '#f97316', desc: 'Extinguishers & detectors' },
  { name: 'Disaster Preparedness Kits', icon: '🎒', color: '#8b5cf6', desc: '72-hour survival essentials' },
  { name: 'Personal Safety Devices', icon: '🛡️', color: '#06b6d4', desc: 'Alarms & protection gear' },
]

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productAPI.getFeatured().then(r => { setFeatured(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Urgency Promo Banner (CRO) */}
      <Link to="/campaign/survival-kit" style={{ display: 'block', textDecoration: 'none', background: '#dc2626', color: '#fff', textAlign: 'center', padding: '12px 24px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.5px', cursor: 'pointer' }}>
        🔥 NATIONAL SAFETY MONTH: Free Expedited Shipping on our VIP 72-Hour Survival Kit! Click here to claim 50% Off ➔
      </Link>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #7f1d1d 100%)', color: '#fff', padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(220,38,38,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(220,38,38,0.1) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛡️</div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px' }}>
            Be Prepared.<br /><span style={{ color: '#dc2626' }}>Stay Protected.</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '40px', lineHeight: '1.6' }}>
            LIFESHIELD brings you professional-grade emergency and safety products. Because preparedness isn't optional — it's essential.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" style={{ background: '#dc2626', color: '#fff', padding: '14px 32px', borderRadius: '12px', fontWeight: '700', fontSize: '16px', textDecoration: 'none' }}>Shop Now →</Link>
            <Link to="/products?category=Disaster+Preparedness+Kits" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '14px 32px', borderRadius: '12px', fontWeight: '600', fontSize: '16px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>Emergency Kits</Link>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginTop: '60px', flexWrap: 'wrap' }}>
          {[['10K+', 'Customers Protected'], ['200+', 'Safety Products'], ['4.8★', 'Average Rating'], ['24/7', 'Support Ready']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#dc2626' }}>{num}</div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof / Trust Identifiers (CRO) */}
      <section style={{ padding: '24px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>As Featured In & Trusted By</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', opacity: 0.6, filter: 'grayscale(100%)' }}>
          {['Forbes', 'Wall Street Journal', 'National Red Cross Networks', 'Wired', 'Safety First Weekly'].map(brand => (
             <span key={brand} style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', fontFamily: 'serif' }}>{brand}</span>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '64px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Shop by Category</h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '48px' }}>Find exactly what you need to stay prepared</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {categories.map(cat => (
              <Link key={cat.name} to={`/products?category=${encodeURIComponent(cat.name)}`}
                style={{ textDecoration: 'none', background: '#f8fafc', borderRadius: '16px', padding: '32px 24px', textAlign: 'center', border: '2px solid transparent', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${cat.color}25` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{cat.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>{cat.name}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{cat.desc}</p>
                <span style={{ color: cat.color, fontWeight: '600', fontSize: '13px' }}>Browse →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '64px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>Featured Products</h2>
              <p style={{ color: '#64748b', marginTop: '4px' }}>Our most trusted safety essentials</p>
            </div>
            <Link to="/products" style={{ color: '#dc2626', fontWeight: '600', textDecoration: 'none' }}>View All →</Link>
          </div>
          {loading
            ? <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading products...</div>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '24px' }}>
                {featured.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
          }
        </div>
      </section>


      {/* Strategy Section */}
      <section style={{ padding: '64px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Our Business Strategies</h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '48px' }}>CRM, Supply Chain & Market Differentiation — built into every interaction</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              { to: '/loyalty', icon: '🏆', color: '#dc2626', bg: '#fee2e2', tag: 'CRM Strategy 1', title: 'ShieldPoints™ Loyalty', desc: 'Tiered rewards program for customer retention. Earn points, unlock perks, reach Platinum.' },
              { to: '/safety-profile', icon: '🧠', color: '#4f46e5', bg: '#eef2ff', tag: 'CRM Strategy 2', title: 'SafetyProfile™', desc: 'AI-powered personalization based on your household, location, and risk profile.' },
              { to: '/scm-dashboard', icon: '📦', color: '#059669', bg: '#ecfdf5', tag: 'SCM Strategy', title: 'Demand SCM Dashboard', desc: 'Seasonal forecasting, auto reorder triggers, and live supplier network management.' },
              { to: '/why-us', icon: '🏅', color: '#7c3aed', bg: '#f5f3ff', tag: 'Market Uniqueness', title: 'Why LIFESHIELD?', desc: 'Survey of 412 customers shows we lead on 9/9 features vs competitors.' },
            ].map(card => (
              <Link key={card.to} to={card.to}
                style={{ textDecoration: 'none', background: '#f8fafc', borderRadius: '16px', padding: '28px 22px', border: `2px solid ${card.color}20`, transition: 'all .2s', display: 'block' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = card.color; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${card.color}25` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${card.color}20`; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ background: card.bg, borderRadius: '12px', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '16px' }}>{card.icon}</div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: card.color, letterSpacing: '1px', marginBottom: '6px' }}>{card.tag.toUpperCase()}</div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1e293b', marginBottom: '10px' }}>{card.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>{card.desc}</p>
                <span style={{ color: card.color, fontWeight: '700', fontSize: '13px' }}>Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why LIFESHIELD */}
      <section style={{ padding: '64px 24px', background: '#1e293b', color: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '48px' }}>Why Choose <span style={{ color: '#dc2626' }}>LIFESHIELD</span>?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
            {[['🏆', 'Quality Certified', 'All products are OSHA, UL, and ANSI certified'],
              ['🚀', 'Fast Delivery', 'Emergency supplies delivered in 24-48 hours'],
              ['💰', 'Best Price', 'Competitive pricing on all safety products'],
              ['📞', 'Expert Support', '24/7 emergency preparedness guidance']].map(([icon, title, desc]) => (
              <div key={title} style={{ padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
