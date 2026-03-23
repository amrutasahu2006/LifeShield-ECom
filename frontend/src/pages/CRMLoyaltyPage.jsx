import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loyaltyAPI } from '../utils/api'

const activity = [
  { icon: '🛒', bg: '#dcfce7', title: 'Purchase – 72-Hour Emergency Kit', date: 'Dec 28, 2024 · Order #A3F2B9', pts: '+149 pts', earn: true },
  { icon: '🛒', bg: '#dcfce7', title: 'Purchase – First Aid Kit (326-Piece)', date: 'Dec 15, 2024 · Order #A1D8F5', pts: '+49 pts', earn: true },
  { icon: '🎁', bg: '#fee2e2', title: 'Redeemed – Rs. 5 Discount Coupon', date: 'Dec 10, 2024', pts: '−500 pts', earn: false },
  { icon: '🎂', bg: '#dbeafe', title: 'Birthday Bonus', date: 'Nov 5, 2024 · Annual Gift', pts: '+50 pts', earn: true },
  { icon: '🛒', bg: '#dcfce7', title: 'Purchase – Smoke & CO Detector', date: 'Oct 20, 2024 · Order #A9C1E4', pts: '+54 pts', earn: true },
]

export default function CRMLoyaltyPage() {
  const { user } = useAuth()
  const rewardsSectionRef = useRef(null)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [tiers, setTiers] = useState([])
  const [rewards, setRewards] = useState([])

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [t, r] = await Promise.all([ loyaltyAPI.getTiers(), loyaltyAPI.getRewards() ])
        setTiers(t.data)
        setRewards(r.data)
      } catch (err) {
        console.error('Failed to load CRM elements:', err)
      }
    }
    loadContent()
  }, [])

  const loadDashboard = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setError('')
      const { data } = await loyaltyAPI.getDashboard()
      setDashboard(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load loyalty dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [user])

  const handleRedeem = async (reward) => {
    if (!user) return
    try {
      setRedeeming(reward.name)
      setError('')
      setMessage('')
      const { data } = await loyaltyAPI.redeemReward(reward.name)
      setMessage(data.message)
      await loadDashboard()
    } catch (err) {
      setError(err.response?.data?.message || 'Redeem failed')
    } finally {
      setRedeeming(null)
    }
  }

  const points = dashboard?.points || 0
  const tier = dashboard?.tier || 'Bronze'
  const pointsToNextTier = dashboard?.pointsToNextTier || 0
  const progress = Math.min((points / 5000) * 100, 100)
  const activityData = user ? (dashboard?.activity || []) : activity
  const redeemedPoints = (dashboard?.activity || []).filter(a => a.type === 'redeem').reduce((sum, a) => sum + Math.abs(a.points), 0)
  const earnedEvents = (dashboard?.activity || []).filter(a => a.type === 'earn').length
  const memberSince = dashboard?.memberSince ? new Date(dashboard.memberSince) : null
  const activeMonths = memberSince ? Math.max(1, Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24 * 30))) : 1

  const activityMeta = (entry) => {
    if (entry.type === 'redeem') return { icon: '🎁', bg: '#fee2e2', earn: false }
    if (entry.type === 'bonus') return { icon: '🎂', bg: '#dbeafe', earn: true }
    return { icon: '🛒', bg: '#dcfce7', earn: true }
  }

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
          {['✦ 1 Point per Rs. 1 spent', '✦ Bonus points on safety kits', '✦ Points never expire while active'].map(t => (
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
          {!user && (
            <div style={{ background: '#dbeafe', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 16px', marginBottom: '18px', fontSize: '13px', color: '#1e40af' }}>
              Login required for live points and redemption actions. <Link to="/login" style={{ color: '#1d4ed8', fontWeight: '700', textDecoration: 'none' }}>Go to Login →</Link>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Welcome back,</div>
              <div style={{ fontSize: '22px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {dashboard?.userName || user?.name || 'Guest User'}
                <span style={{ background: tier === 'Platinum' ? '#7c3aed20' : tier === 'Gold' ? '#f59e0b20' : tier === 'Silver' ? '#9ca3af20' : '#cd7f3215', color: tier === 'Platinum' ? '#7c3aed' : tier === 'Gold' ? '#f59e0b' : tier === 'Silver' ? '#6b7280' : '#cd7f32', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }}>
                  {tier === 'Platinum' ? '💎' : tier === 'Gold' ? '🥇' : tier === 'Silver' ? '🥈' : '🥉'} {tier} Member
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '40px', fontWeight: '800', color: '#dc2626' }}>{loading ? '...' : `${points.toLocaleString()} pts`}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Total balance</div>
            </div>
          </div>
          {error && <div style={{ marginBottom: '12px', color: '#dc2626', fontSize: '13px', fontWeight: '600' }}>❌ {error}</div>}
          {message && <div style={{ marginBottom: '12px', color: '#16a34a', fontSize: '13px', fontWeight: '600' }}>✅ {message}</div>}
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Progress to Platinum: {points.toLocaleString()} / 5,000 points</div>
          <div style={{ background: '#f1f5f9', borderRadius: '12px', height: '16px', marginBottom: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '12px', background: 'linear-gradient(90deg,#dc2626,#f97316)', width: `${progress}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '28px' }}>
            <span>Gold (1,500)</span><span>{tier === 'Platinum' ? 'Highest tier unlocked 💎' : `${pointsToNextTier.toLocaleString()} pts to next tier`}</span><span>Platinum (5,000)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '16px', marginBottom: '24px' }}>
            {[[points.toLocaleString(),'Available Points'],[`${earnedEvents}`,'Point-Earning Events'],[`Rs. ${dashboard?.pointsValue || '0.00'}`,'Point Value'],[`Rs. ${(redeemedPoints / 100).toFixed(2)}`,'Saved via Points'],[`${activeMonths}`,'Months Active']].map(([v,l]) => (
              <div key={l} style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '26px', fontWeight: '800', color: '#dc2626' }}>{v}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => rewardsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              style={{ background: '#dc2626', color: '#fff', padding: '12px 28px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
              Redeem Points →
            </button>
            <span style={{ fontSize: '12px', color: '#64748b' }}>100 points = Rs. 1 discount</span>
          </div>
        </div>

        {/* Activity */}
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>Points Activity</h2>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Recent Activity</h3>
            <span style={{ fontSize: '13px', color: '#dc2626', cursor: 'pointer', fontWeight: '600' }}>View All →</span>
          </div>
          {activityData.map((a, i) => {
            const meta = a.type ? activityMeta(a) : { icon: a.icon, bg: a.bg, earn: a.earn }
            const pointLabel = typeof a.points === 'number' ? `${a.points > 0 ? '+' : ''}${a.points} pts` : a.pts
            const dateLabel = a.createdAt ? new Date(a.createdAt).toLocaleString() : a.date

            return (
            <div key={i} style={{ display: 'flex', gap: '16px', padding: '14px 0', borderBottom: i < activityData.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{meta.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{a.title}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{a.description || dateLabel}</div>
              </div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: meta.earn ? '#16a34a' : '#dc2626' }}>{pointLabel}</div>
            </div>
            )
          })}
        </div>

        {/* Rewards Store */}
        <h2 ref={rewardsSectionRef} style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>Rewards Store</h2>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '20px' }}>
            {rewards.map(r => (
              <div key={r.name} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{r.icon}</div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>{r.name}</h4>
                <div style={{ color: '#dc2626', fontWeight: '800', fontSize: '16px', marginBottom: '12px' }}>{r.points.toLocaleString()} pts</div>
                <button
                  onClick={() => handleRedeem(r)}
                  disabled={!user || loading || redeeming === r.name || points < r.points}
                  style={{ background: redeeming === r.name ? '#16a34a' : points >= r.points ? '#1e293b' : '#94a3b8', color: '#fff', padding: '8px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: !user || loading || points < r.points ? 'not-allowed' : 'pointer' }}>
                  {redeeming === r.name ? 'Redeeming...' : !user ? 'Login to Redeem' : points >= r.points ? 'Redeem' : 'Not enough points'}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
