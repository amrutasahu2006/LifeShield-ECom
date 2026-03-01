import React, { useState } from 'react'

const tiers = [
  { name: 'Bronze', icon: '🥉', color: '#cd7f32', bg: '#cd7f3215', range: '0 – 499 Points', pct: '1%', label: 'Points per $1', perks: ['Birthday bonus points (50 pts)', 'Member-only email alerts', 'Early access to sales', 'Free shipping over $75'], goal: 'Onboard & Activate' },
  { name: 'Silver', icon: '🥈', color: '#9ca3af', bg: '#9ca3af15', range: '500 – 1,499 Points', pct: '2%', label: 'Points per $1', perks: ['All Bronze benefits', 'Free shipping over $50', 'Priority customer support', 'Quarterly safety newsletter'], goal: 'Increase Frequency' },
  { name: 'Gold', icon: '🥇', color: '#f59e0b', bg: '#f59e0b15', range: '1,500 – 4,999 Points', pct: '3%', label: 'Points per $1', perks: ['All Silver benefits', 'Always free shipping', 'Exclusive Gold-only products', 'Emergency prep webinars (free)'], goal: 'Maximize Spend', popular: true },
  { name: 'Platinum', icon: '💎', color: '#7c3aed', bg: '#7c3aed15', range: '5,000+ Points', pct: '5%', label: 'Points per $1', perks: ['All Gold benefits', 'Dedicated Safety Advisor', 'Priority 24hr shipping', 'Annual home safety audit'], goal: 'Lock In & Upsell' },
]

const activity = [
  { icon: '🛒', bg: '#dcfce7', title: 'Purchase – 72-Hour Emergency Kit', date: 'Dec 28, 2024 · Order #A3F2B9', pts: '+149 pts', earn: true },
  { icon: '🛒', bg: '#dcfce7', title: 'Purchase – First Aid Kit (326-Piece)', date: 'Dec 15, 2024 · Order #A1D8F5', pts: '+49 pts', earn: true },
  { icon: '🎁', bg: '#fee2e2', title: 'Redeemed – $5 Discount Coupon', date: 'Dec 10, 2024', pts: '−500 pts', earn: false },
  { icon: '🎂', bg: '#dbeafe', title: 'Birthday Bonus', date: 'Nov 5, 2024 · Annual Gift', pts: '+50 pts', earn: true },
  { icon: '🛒', bg: '#dcfce7', title: 'Purchase – Smoke & CO Detector', date: 'Oct 20, 2024 · Order #A9C1E4', pts: '+54 pts', earn: true },
]

const rewards = [
  { icon: '💰', name: '$5 Off Coupon', pts: '500 pts' },
  { icon: '🚚', name: 'Free Expedited Shipping', pts: '300 pts' },
  { icon: '🩺', name: 'Travel First Aid Kit (Free)', pts: '2,500 pts' },
  { icon: '📋', name: 'Home Safety Checklist PDF', pts: '100 pts' },
  { icon: '🎓', name: 'CPR Basics Online Course', pts: '1,000 pts' },
  { icon: '💎', name: 'Upgrade to Platinum (1 mo)', pts: '4,000 pts' },
]

export default function CRMLoyaltyPage() {
  const [redeeming, setRedeeming] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b,#7f1d1d)', color: '#fff', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ background: '#dc2626', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'inline-block', marginBottom: '20px', letterSpacing: '1px' }}>
          CRM COMPONENT 1 — CUSTOMER LOYALTY & RETENTION
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: '800', marginBottom: '12px' }}>
          ShieldPoints™ <span style={{ color: '#dc2626' }}>Loyalty Program</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '600px', margin: '0 auto 32px', lineHeight: '1.6' }}>
          Earn points on every purchase. Redeem for discounts, free products, and exclusive perks. The more prepared you are, the more you save.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['✦ 1 Point per $1 spent', '✦ Bonus points on safety kits', '✦ Points never expire while active'].map(t => (
            <div key={t} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', padding: '10px 20px', borderRadius: '10px', fontSize: '13px' }}>{t}</div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Strategy Box */}
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '16px', padding: '24px', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#92400e', marginBottom: '8px' }}>📋 CRM STRATEGY: Customer Retention via Tiered Loyalty Program</h3>
          <p style={{ fontSize: '13px', color: '#78350f', lineHeight: '1.7' }}>
            LIFESHIELD implements a <strong>tiered loyalty program (ShieldPoints™)</strong> as its primary customer retention CRM strategy. Customers earn points per purchase and unlock progressively richer benefits (Bronze → Silver → Gold → Platinum). This increases Customer Lifetime Value (CLV), reduces churn, and creates emotional brand attachment — critical in the safety products market where repeat preparedness purchases are seasonal. Platinum members receive priority shipping and a dedicated safety advisor, driving upsell of premium kits.
          </p>
        </div>

        {/* Tier Cards */}
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>Membership Tiers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '24px', marginBottom: '48px' }}>
          {tiers.map(tier => (
            <div key={tier.name} style={{ background: '#fff', borderRadius: '20px', padding: '28px 22px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,.08)', border: `2px solid ${tier.color}`, position: 'relative', transform: tier.popular ? 'scale(1.04)' : 'none' }}>
              {tier.popular && <div style={{ position: 'absolute', top: '12px', right: '-4px', background: '#dc2626', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '4px 14px', borderRadius: '2px' }}>MOST POPULAR</div>}
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', background: tier.bg }}>{tier.icon}</div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: tier.color, marginBottom: '4px' }}>{tier.name}</h3>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{tier.range}</div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#dc2626', marginBottom: '4px' }}>{tier.pct}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>{tier.label}</div>
              <ul style={{ listStyle: 'none', textAlign: 'left' }}>
                {tier.perks.map(p => (
                  <li key={p} style={{ fontSize: '13px', padding: '6px 0', borderBottom: '1px solid #f1f5f9', color: '#475569', display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#16a34a', fontWeight: '700', flexShrink: 0 }}>✓</span>{p}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '16px', background: tier.bg, borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: '600', color: tier.color }}>CRM Goal: {tier.goal}</div>
            </div>
          ))}
        </div>

        {/* Dashboard */}
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>My ShieldPoints Dashboard</h2>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,.08)', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Welcome back,</div>
              <div style={{ fontSize: '22px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                John Doe
                <span style={{ background: '#f59e0b20', color: '#f59e0b', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }}>🥇 Gold Member</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '40px', fontWeight: '800', color: '#dc2626' }}>2,340 pts</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Total balance</div>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Progress to Platinum: 2,340 / 5,000 points</div>
          <div style={{ background: '#f1f5f9', borderRadius: '12px', height: '16px', marginBottom: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '12px', background: 'linear-gradient(90deg,#dc2626,#f97316)', width: '46.8%' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '28px' }}>
            <span>Gold (1,500)</span><span>2,660 pts to Platinum 💎</span><span>Platinum (5,000)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '16px', marginBottom: '24px' }}>
            {[['2,340','Available Points'],['8','Orders Placed'],['$842','Total Spent'],['$47','Saved via Points'],['14','Months Active']].map(([v,l]) => (
              <div key={l} style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '26px', fontWeight: '800', color: '#dc2626' }}>{v}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button style={{ background: '#dc2626', color: '#fff', padding: '12px 28px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' }}>Redeem Points →</button>
            <span style={{ fontSize: '12px', color: '#64748b' }}>100 points = $1 discount</span>
          </div>
        </div>

        {/* Activity */}
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>Points Activity</h2>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Recent Activity</h3>
            <span style={{ fontSize: '13px', color: '#dc2626', cursor: 'pointer', fontWeight: '600' }}>View All →</span>
          </div>
          {activity.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', padding: '14px 0', borderBottom: i < activity.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{a.title}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{a.date}</div>
              </div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: a.earn ? '#16a34a' : '#dc2626' }}>{a.pts}</div>
            </div>
          ))}
        </div>

        {/* Rewards Store */}
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>Rewards Store</h2>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '20px' }}>
            {rewards.map(r => (
              <div key={r.name} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{r.icon}</div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>{r.name}</h4>
                <div style={{ color: '#dc2626', fontWeight: '800', fontSize: '16px', marginBottom: '12px' }}>{r.pts}</div>
                <button
                  onClick={() => setRedeeming(r.name)}
                  style={{ background: redeeming === r.name ? '#16a34a' : '#1e293b', color: '#fff', padding: '8px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                  {redeeming === r.name ? '✓ Redeemed!' : 'Redeem'}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
