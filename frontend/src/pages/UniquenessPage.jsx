import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { productAPI } from '../utils/api'

const surveyStats = [
  { pct: '76%', color: '#dc2626', label: 'No Preparedness Score', desc: "Consumers don't know if they're actually prepared" },
  { pct: '68%', color: '#7c3aed', label: 'Want Personalized Recs', desc: 'Generic product lists feel irrelevant to their situation' },
  { pct: '82%', color: '#059669', label: 'Buy Reactively', desc: 'Purchase only AFTER a disaster, not before it' },
  { pct: '71%', color: '#f97316', label: 'Want Disaster Alerts', desc: 'Customers want proactive reminders before seasons' },
  { pct: '54%', color: '#3b82f6', label: 'No Loyalty Rewards', desc: 'Current platforms offer no incentive to return' },
  { pct: '89%', color: '#f59e0b', label: 'Trust Safety Experts', desc: 'Prefer brands with visible safety credentials & certifications' },
]

const surveyBars = [
  { q: '"I wish the site told me exactly what I\'m missing based on where I live"', pct: 84 },
  { q: '"I want reminders before hurricane/wildfire season to restock"', pct: 78 },
  { q: '"A loyalty program would make me shop here instead of Amazon"', pct: 71 },
  { q: '"I\'d pay more for a platform that educates me, not just sells me things"', pct: 67 },
  { q: '"I need confidence that products will be in stock during emergencies"', pct: 91 },
]

const compData = [
  { feature: '🛡️ Personalized Preparedness Score', ls: '✔', az: '✘', ra: '✘', sf: '✘', hd: '✘' },
  { feature: '🏆 Loyalty Rewards Program', ls: '✔', az: '〜', ra: '✘', sf: '✘', hd: '✔' },
  { feature: '🔔 Location-Based Seasonal Alerts', ls: '✔', az: '✘', ra: '✘', sf: '✘', hd: '✘' },
  { feature: '👨‍👩‍👧 Household Profile Engine', ls: '✔', az: '✘', ra: '〜', sf: '✘', hd: '✘' },
  { feature: '📦 Live Stock Availability (Transparent)', ls: '✔', az: '✔', ra: '〜', sf: '✔', hd: '✔' },
  { feature: '🎓 Built-in Safety Education Content', ls: '✔', az: '✘', ra: '〜', sf: '〜', hd: '✘' },
  { feature: '🩺 Emergency-Certified Product Lines', ls: '✔', az: '〜', ra: '✔', sf: '〜', hd: '〜' },
  { feature: '💬 Dedicated Safety Advisor (Premium)', ls: '✔', az: '✘', ra: '✘', sf: '✘', hd: '✘' },
  { feature: '📊 Demand-Transparent SCM', ls: '✔', az: '✘', ra: '✘', sf: '✘', hd: '✘' },
]

const totalRow = { feature: '✅ Total Unique Features', ls: '9/9', az: '2/9', ra: '3/9', sf: '2/9', hd: '3/9' }

const checkColor = (v) => v === '✔' ? '#16a34a' : v === '✘' ? '#dc2626' : '#d97706'

const usps = [
  { num: '1', color: '#dc2626', bg: '#fee2e2', icon: '🧠', title: 'SafetyProfile™ Intelligence', tag: 'PERSONALIZATION', desc: 'The only e-commerce platform that builds a custom preparedness profile based on your household, location, and risk factors — then prescribes exactly what you need. 76% of survey respondents said no competitor offered this.' },
  { num: '2', color: '#7c3aed', bg: '#f5f3ff', icon: '🏆', title: 'ShieldPoints™ Loyalty Ecosystem', tag: 'RETENTION', desc: 'Tiered loyalty program that rewards preparedness — not just purchases. From Bronze to Platinum, members get free shipping, safety webinars, and dedicated advisors. 54% of consumers reported no loyalty program on current platform.' },
  { num: '3', color: '#059669', bg: '#ecfdf5', icon: '🔔', title: 'Seasonal Disaster Alert System', tag: 'PROACTIVE SAFETY', desc: 'AI-driven alerts before hurricane, wildfire, and winter storm seasons — recommending restocking before disaster strikes, not after. 82% of survey respondents currently buy reactively. LIFESHIELD changes this behavior.' },
  { num: '4', color: '#f97316', bg: '#fff7ed', icon: '📊', title: 'Demand-Transparent SCM', tag: 'TRUST & SUPPLY', desc: 'Real-time stock availability, seasonal demand forecasting shown to customers, and certified supplier partnerships. 91% of survey respondents cited "knowing product will be in stock" as their top concern during emergencies.' },
]

export default function UniquenessPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeFeature, setActiveFeature] = useState(0)
  const [products, setProducts] = useState([])

  useEffect(() => {
    productAPI.getAll({ limit: 50 }).then(res => setProducts(res.data.products)).catch(console.error)
  }, [])

  // Safely extract user fields or default to generic persona
  const uRegion = user?.safetyProfile?.region || 'California (High Wildfire + Earthquake Risk)'
  const uSize = user?.safetyProfile?.householdSize || 'Family of 4'
  const uPoints = user?.loyaltyPoints || 0
  const uTier = uPoints >= 5000 ? 'Platinum' : uPoints >= 1000 ? 'Gold' : 'Bronze'
  const ptsNext = uTier === 'Platinum' ? 0 : uTier === 'Gold' ? 5000 - uPoints : 1000 - uPoints
  const nextTier = uTier === 'Platinum' ? 'Max Tier' : uTier === 'Gold' ? '💎 Platinum' : '🥇 Gold'

  // Extract products dynamically
  const getStock = (nameQuery, fallback) => {
    if (!products || products.length === 0) return fallback
    const p = products.find(prod => prod.name.toLowerCase().includes(nameQuery.toLowerCase()))
    return p ? p.stock : fallback
  }

  const kitStock = getStock('72-Hour', 6)
  const faStock = getStock('First Aid', 85)
  const waterStock = getStock('Water Filter', 28)
  const fireStock = getStock('Extinguisher', 60)

  const features = [
    { label: '🧠 Preparedness Score', title: 'Preparedness Score: 68/100', body: `Your household profile (${uSize}, ${uRegion}) has been analyzed. You are missing critical items: a 72-Hour Kit, Pet Evacuation supplies, and a Water Filter. Here is your personalized shopping list to reach 90+/100.`, gaps: [['🎒 Emergency Kits','40%','#dc2626'],['💧 Water Supply','45%','#dc2626'],['🩺 First Aid','85%','#16a34a'],['🔥 Fire Safety','60%','#f97316']] },
    { label: '🏆 ShieldPoints™', title: `ShieldPoints™ Active — ${uTier} Member`, body: `You have earned ${uPoints.toLocaleString()} points. You are ${ptsNext.toLocaleString()} points from ${nextTier.replace(/[^a-zA-Z]/g, '').trim()} status. Redeem points for free products, coupons, CPR courses, or a dedicated Safety Advisor session.`, gaps: [['Points Balance',`${uPoints.toLocaleString()} pts`,'#dc2626'],['Current Tier',`${uTier === 'Platinum' ? '💎 Platinum' : uTier === 'Gold' ? '🥇 Gold' : '🥉 Bronze'}`,'#f59e0b'],['Next Tier', nextTier,'#7c3aed'],['Points to Go',`${ptsNext.toLocaleString()} pts`,'#64748b']] },
    { label: '🔔 Seasonal Alerts', title: `Active Alerts for ${uRegion.split(' ')[0] || 'your area'}`, body: `Wildfire Season is approaching (June–September). Based on your location (${uRegion}) and household profile, we recommend stocking up on Fire Safety Equipment and refreshing your 72-Hour Kit before the season starts.`, gaps: [['Wildfire Risk','HIGH ⚠️','#dc2626'],['Hurricane Risk','Low','#16a34a'],['Winter Storm','Medium','#f97316'],['Alert Active','Jun–Sep 2025','#3b82f6']] },
    { label: '📦 Live SCM', title: 'Stock Dashboard — Live', body: `See real-time inventory levels before you order. ${kitStock < 10 ? `72-Hour Kits are critically low (${kitStock} units). A purchase order has been auto-triggered.` : `We have adequate stock ready for dispatch.`}`, gaps: [['72-Hr Kit',`${kitStock} units ${kitStock < 10 ? '⚠️' : '✓'}`,`${kitStock < 10 ? '#dc2626' : '#16a34a'}`],['First Aid Kit',`${faStock} units ${faStock < 20 ? '〜' : '✓'}`,`${faStock < 20 ? '#d97706' : '#16a34a'}`],['Water Filter',`${waterStock} units ${waterStock < 20 ? '〜' : '✓'}`,`${waterStock < 20 ? '#d97706' : '#16a34a'}`],['Fire Ext.',`${fireStock} units ${fireStock < 20 ? '〜' : '✓'}`,`${fireStock < 20 ? '#d97706' : '#16a34a'}`]] },
  ]
  const detailRoutes = ['/safety-profile', '/loyalty', '/safety-profile', '/scm-dashboard']
  const f = features[activeFeature]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', color: '#fff', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ background: '#7c3aed', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'inline-block', marginBottom: '20px', letterSpacing: '1px' }}>
          MARKET SURVEY — COMPETITIVE UNIQUENESS & DIFFERENTIATION
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: '800', marginBottom: '12px' }}>
          Why LIFESHIELD is <span style={{ color: '#dc2626' }}>Uniquely Different</span>
        </h1>
        <p style={{ color: '#94a3b8', maxWidth: '640px', margin: '0 auto 28px', fontSize: '16px', lineHeight: '1.6' }}>
          Based on our survey of 412 emergency preparedness consumers, LIFESHIELD addresses the critical unmet needs that generic safety product retailers completely ignore.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['✦ n=412 survey respondents', '✦ 6-week market research study', '✦ Competitive benchmarking vs 5 rivals'].map(t => (
            <div key={t} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', padding: '10px 20px', borderRadius: '10px', fontSize: '13px' }}>{t}</div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Strategy Box */}
        <div style={{ background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: '16px', padding: '24px', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#4c1d95', marginBottom: '8px' }}>📋 UNIQUENESS STRATEGY: Market Gap Identification via Consumer Survey</h3>
          <p style={{ fontSize: '13px', color: '#5b21b6', lineHeight: '1.7' }}>
            A 6-week market survey of <strong>412 emergency preparedness consumers</strong> across 8 US states revealed three major unmet needs in existing platforms: (1) no competitor offers a <em>personalized preparedness score</em> based on household profiling, (2) only 1 of 5 competitors offered a loyalty program, and (3) no platform provides proactive <em>location-based seasonal alerts</em>. LIFESHIELD's differentiation is built on these three gaps, making it the only e-commerce platform that combines product retail with emergency preparedness education, personalization, and gamified engagement.
          </p>
        </div>

        {/* Survey Stats */}
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>Market Survey Findings (n=412)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '18px', marginBottom: '40px' }}>
          {surveyStats.map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '16px', padding: '22px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,.08)' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', border: `5px solid ${s.color}`, color: s.color, background: s.color + '15' }}>{s.pct}</div>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>{s.label}</h4>
              <p style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Survey Bars */}
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>What Customers Wish Existed</h2>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,.08)', marginBottom: '40px' }}>
          {surveyBars.map(b => (
            <div key={b.q} style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>{b.q}</div>
              <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '14px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg,#7c3aed,#4f46e5)', width: `${b.pct}%` }} />
                <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', fontWeight: '700', color: '#1e293b' }}>{b.pct}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>Competitive Benchmarking</h2>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)', marginBottom: '40px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#1e293b' }}>
                {['Feature', '⭐ LIFESHIELD', 'Amazon', 'ReadyAmerica', 'Survival Frog', 'Home Depot'].map((h, i) => (
                  <th key={h} style={{ padding: '12px 14px', color: i === 1 ? '#fbbf24' : '#fff', fontWeight: '700', textAlign: i === 0 ? 'left' : 'center', border: '1px solid #334155', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compData.map((row, ri) => (
                <tr key={row.feature} style={{ background: ri % 2 === 0 ? '#fff7ed' : '#ffffff' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '500', border: '1px solid #e2e8f0', fontSize: '13px' }}>{row.feature}</td>
                  {[row.ls, row.az, row.ra, row.sf, row.hd].map((v, i) => (
                    <td key={i} style={{ padding: '10px 14px', textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: '700', fontSize: '16px', color: checkColor(v) }}>{v}</td>
                  ))}
                </tr>
              ))}
              <tr style={{ background: '#1e293b' }}>
                <td style={{ padding: '12px 14px', fontWeight: '700', color: '#fff', border: '1px solid #334155' }}>{totalRow.feature}</td>
                {[totalRow.ls, totalRow.az, totalRow.ra, totalRow.sf, totalRow.hd].map((v, i) => (
                  <td key={i} style={{ padding: '12px 14px', textAlign: 'center', border: '1px solid #334155', fontWeight: '800', fontSize: '16px', color: i === 0 ? '#fbbf24' : '#94a3b8' }}>{v}</td>
                ))}
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>Legend: ✔ Fully implemented &nbsp;|&nbsp; 〜 Partially available &nbsp;|&nbsp; ✘ Not available</p>
        </div>

        {/* 4 USPs */}
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>4 Core Unique Value Propositions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '22px', marginBottom: '40px' }}>
          {usps.map(u => (
            <div key={u.num} style={{ background: '#fff', borderRadius: '20px', padding: '26px', boxShadow: '0 4px 20px rgba(0,0,0,.08)', borderLeft: `4px solid ${u.color}` }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>{u.icon}</div>
              <div style={{ background: u.bg, color: u.color, padding: '3px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: '700', display: 'inline-block', marginBottom: '10px' }}>USP #{u.num} — {u.tag}</div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '10px' }}>{u.title}</h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>{u.desc}</p>
            </div>
          ))}
        </div>

        {/* Interactive Feature Showcase */}
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>Experience Our Unique Features</h2>
        <div style={{ background: '#1e293b', borderRadius: '20px', padding: '32px', color: '#fff' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>Four capabilities no other safety platform offers together</h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Click each tab to explore</p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {features.map((feat, i) => (
              <button key={i} onClick={() => setActiveFeature(i)}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: '1px solid', borderColor: activeFeature === i ? '#dc2626' : 'rgba(255,255,255,.1)', background: activeFeature === i ? '#dc2626' : 'rgba(255,255,255,.1)', color: '#fff' }}>
                {feat.label}
              </button>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '24px', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#f1f5f9' }}>{f.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.7', marginBottom: '16px' }}>{f.body}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => navigate(detailRoutes[activeFeature])}
                    style={{ background: '#dc2626', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                    View Details →
                  </button>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,.07)', borderRadius: '12px', padding: '20px' }}>
                {f.gaps.map(([label, val, col]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                    <span style={{ color: '#94a3b8' }}>{label}</span>
                    <span style={{ fontWeight: '700', color: col }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
