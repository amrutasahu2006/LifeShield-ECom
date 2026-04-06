import React from 'react'
import { useAuth } from '../context/AuthContext'

const ACTIVITY_LOG = [
  'Purchase Kit (+250 points)',
  'Shared Kit Purchase Reward (Order #12345) (+500 points)'
]

export default function ShareKitDashboardPage() {
  const { user } = useAuth()
  const currentPoints = 750
  const nextTier = 1000
  const progress = Math.min((currentPoints / nextTier) * 100, 100)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #dc2626 100%)', borderRadius: '20px', padding: '28px', color: '#fff', marginBottom: '24px', boxShadow: '0 12px 32px rgba(15,23,42,0.28)' }}>
          <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#fecaca', marginBottom: '10px', fontWeight: '700' }}>Affiliate Dashboard</p>
          <h1 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '10px' }}>My ShieldPoints™</h1>
          <p style={{ color: '#cbd5e1', fontSize: '14px' }}>
            {user ? `Welcome ${user.name || 'John'}.` : 'Welcome John.'} Track referral rewards and tier progress in one place.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Point Balance</h2>
            <p style={{ fontSize: '42px', color: '#dc2626', fontWeight: '900', marginBottom: '8px' }}>{currentPoints} points</p>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>250 points to reach the next tier</p>

            <div style={{ width: '100%', background: '#e2e8f0', borderRadius: '999px', height: '12px', overflow: 'hidden', marginBottom: '8px' }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #dc2626 0%, #2563eb 100%)'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
              <span>Current: 750</span>
              <span>Next Tier: 1000</span>
            </div>
          </section>

          <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>Recent Activities</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '10px' }}>
              {ACTIVITY_LOG.map((item) => (
                <li key={item} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
