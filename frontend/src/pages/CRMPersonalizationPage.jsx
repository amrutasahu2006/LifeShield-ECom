import React, { useState } from 'react'

const riskColors = { Fire: '#ef4444', Flooding: '#3b82f6', Tornado: '#8b5cf6', Earthquake: '#f97316' }

const recommendations = [
  { icon: '🎒', reason: '⚠️ Critical Gap: Emergency Kits', tag: '#dc2626', reasonBg: '#fee2e2', name: '72-Hour Emergency Kit – Family of 4', desc: 'Essential for California wildfire evacuation. Covers 4 people + pets for 72 hours.', price: '$149.99' },
  { icon: '💧', reason: '📍 California Wildfire Season', tag: '#dc2626', reasonBg: '#fee2e2', name: 'Emergency Water Filtration System', desc: 'Filters up to 100K gallons. Critical during wildfire-related water contamination events.', price: '$34.99' },
  { icon: '🐕', reason: '🐾 Pet Safety – Profile Match', tag: '#059669', reasonBg: '#dcfce7', name: 'Pet Emergency Evacuation Kit', desc: '72-hour pet food, foldable carrier, meds organizer and ID tag. For 1–2 pets.', price: '$64.99' },
  { icon: '👶', reason: '👶 Child Safety – Profile Match', tag: '#f97316', reasonBg: '#fff7ed', name: 'Child Safety First Aid Kit (0–12 yrs)', desc: 'Pediatric-specific supplies: child doses, smaller bandages, child CPR mask.', price: '$39.99' },
]

const scores = [
  { label: '🩺 First Aid', pct: 85, color: '#16a34a' },
  { label: '🔥 Fire Safety', pct: 60, color: '#f97316' },
  { label: '🎒 Emergency Kits', pct: 40, color: '#dc2626' },
  { label: '🛡️ Personal Safety', pct: 70, color: '#f97316' },
  { label: '💧 Water & Food Supply', pct: 45, color: '#dc2626' },
]

const alerts = [
  { icon: '🔥', title: 'Wildfire Season Reminders', desc: 'Jun–Nov alerts for CA residents', on: true },
  { icon: '🌊', title: 'Flood Risk Notifications', desc: 'Seasonal flood risk by zip code', on: true },
  { icon: '📦', title: 'Product Expiry Reminders', desc: 'Replace food rations & batteries', on: true },
  { icon: '🎓', title: 'Safety Webinars & Tips', desc: 'Monthly preparedness education', on: false },
  { icon: '🛒', title: 'Stock-Up Sale Alerts', desc: 'Pre-season discounts on kits', on: true },
]

export default function CRMPersonalizationPage() {
  const [alertStates, setAlertStates] = useState(alerts.map(a => a.on))
  const [added, setAdded] = useState({})
  const [activeRisks, setActiveRisks] = useState(['Fire', 'Flooding'])
  const [activeNeeds, setActiveNeeds] = useState(['👶 Young Children', '🐕 Pets'])

  const toggleAlert = (i) => setAlertStates(prev => prev.map((v, idx) => idx === i ? !v : v))
  const toggleChip = (val, list, setList) => setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val])
  const handleAdd = (name) => { setAdded(p => ({ ...p, [name]: true })); setTimeout(() => setAdded(p => ({ ...p, [name]: false })), 2000) }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#0f172a,#312e81,#1e3a5f)', color: '#fff', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ background: '#4f46e5', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'inline-block', marginBottom: '20px', letterSpacing: '1px' }}>
          CRM COMPONENT 2 — PERSONALIZATION & CUSTOMER INTELLIGENCE
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: '800', marginBottom: '12px' }}>
          Your <span style={{ color: '#818cf8' }}>SafetyProfile™</span>
        </h1>
        <p style={{ color: '#c7d2fe', maxWidth: '600px', margin: '0 auto 28px', fontSize: '16px', lineHeight: '1.6' }}>
          LIFESHIELD learns your household needs, location risks, and preparedness gaps — then delivers hyper-personalized product recommendations and automated safety alerts.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['✦ AI-Powered Recommendations', '✦ Location-Based Risk Alerts', '✦ Annual Preparedness Score'].map(t => (
            <div key={t} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', padding: '10px 20px', borderRadius: '10px', fontSize: '13px' }}>{t}</div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Strategy Box */}
        <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '16px', padding: '24px', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#312e81', marginBottom: '8px' }}>📋 CRM STRATEGY: Personalization & Customer Intelligence (SafetyProfile™)</h3>
          <p style={{ fontSize: '13px', color: '#3730a3', lineHeight: '1.7' }}>
            LIFESHIELD's second CRM component uses <strong>behavioral data, household profiling, and geo-risk analysis</strong> to deliver personalized product recommendations and proactive safety alerts. The SafetyProfile™ collects household size, region, risk factors, and past purchases to build a preparedness score. The system then triggers targeted communications — e.g., hurricane season reminders to coastal users, or wildfire kit suggestions to West Coast customers — increasing average order value, cross-sell rate, and emotional engagement through curated, expert guidance.
          </p>
        </div>

        {/* Profile + Score */}
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>My SafetyProfile™ Setup</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '28px', marginBottom: '40px' }}>

          {/* Form */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>👤 Household Profile</h3>
            {[
              ['Region / State', <select key="r" style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}>
                <option>California (High Wildfire + Earthquake Risk)</option>
                <option>Florida (Hurricane Zone)</option>
                <option>Texas (Tornado Alley)</option>
              </select>],
              ['Household Size', <select key="h" style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}>
                <option>1 Person</option><option>2 People</option><option selected>Family of 4</option><option>Family of 5+</option>
              </select>],
              ['Home Type', <select key="ht" style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}>
                <option>Apartment</option><option selected>Single-Family Home</option><option>Multi-Story House</option>
              </select>],
            ].map(([label, input]) => (
              <div key={label} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>{label}</label>
                {input}
              </div>
            ))}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Special Needs / Vulnerability</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['👶 Young Children', '👴 Elderly', '🐕 Pets', '♿ Disability', '💊 Medical'].map(n => (
                  <button key={n} onClick={() => toggleChip(n, activeNeeds, setActiveNeeds)}
                    style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '2px solid', borderColor: activeNeeds.includes(n) ? '#dc2626' : '#e2e8f0', background: activeNeeds.includes(n) ? '#dc2626' : '#fff', color: activeNeeds.includes(n) ? '#fff' : '#64748b' }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Primary Risk Concern</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['🔥 Fire', '🌊 Flooding', '🌪️ Tornado', '🏔️ Earthquake'].map(r => (
                  <button key={r} onClick={() => toggleChip(r, activeRisks, setActiveRisks)}
                    style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '2px solid', borderColor: activeRisks.includes(r) ? '#dc2626' : '#e2e8f0', background: activeRisks.includes(r) ? '#dc2626' : '#fff', color: activeRisks.includes(r) ? '#fff' : '#64748b' }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <button style={{ background: '#dc2626', color: '#fff', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer', width: '100%' }}>
              💾 Save Profile & Get Recommendations →
            </button>
          </div>

          {/* Score */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>📊 Preparedness Score</h3>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '72px', fontWeight: '800', color: '#dc2626', lineHeight: '1' }}>68<span style={{ fontSize: '28px' }}>/100</span></div>
              <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Moderately Prepared</div>
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'inline-block', marginTop: '8px' }}>⚠️ 4 critical gaps identified</div>
            </div>
            {scores.map(s => (
              <div key={s.label} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: '600' }}>{s.label}</span>
                  <span style={{ fontWeight: '700', color: s.color }}>{s.pct}%</span>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '4px', background: s.color, width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
            <button style={{ width: '100%', marginTop: '16px', padding: '10px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Take Full Assessment →</button>
          </div>
        </div>

        {/* Recommendations */}
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>Recommended For You</h2>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)', marginBottom: '40px' }}>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Based on: Family of 4 · California · Fire + Flood Risk · Young Children + Pets</div>
          {recommendations.map(r => (
            <div key={r.name} style={{ display: 'flex', gap: '14px', padding: '16px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start' }}>
              <div style={{ width: '56px', height: '56px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ background: r.reasonBg, color: r.tag, padding: '2px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', display: 'inline-block', marginBottom: '6px' }}>{r.reason}</div>
                <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{r.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>{r.desc}</div>
                <div style={{ fontWeight: '800', color: '#dc2626' }}>{r.price}</div>
              </div>
              <button onClick={() => handleAdd(r.name)}
                style={{ background: added[r.name] ? '#16a34a' : '#1e293b', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {added[r.name] ? '✓ Added!' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>

        {/* Alerts + Analytics */}
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>Smart Safety Alerts</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '28px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>🔔 Alert Preferences</h3>
            {alerts.map((a, i) => (
              <div key={a.title} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < alerts.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ fontSize: '22px' }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{a.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{a.desc}</div>
                </div>
                <div onClick={() => toggleAlert(i)} style={{ width: '42px', height: '24px', background: alertStates[i] ? '#dc2626' : '#e2e8f0', borderRadius: '12px', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background .2s' }}>
                  <div style={{ position: 'absolute', top: '4px', left: alertStates[i] ? '22px' : '4px', width: '16px', height: '16px', background: '#fff', borderRadius: '50%', transition: 'left .2s' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>📈 CRM Analytics Impact</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              {[['3.4×','Higher CTR on recommendations'],['62%','Customers complete profile'],['$127','Avg order (profiled customers)'],['78%','2nd purchase rate (profiled)']].map(([v,l]) => (
                <div key={l} style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: '#dc2626' }}>{v}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
              <strong>CRM Insight:</strong> Profiled customers spend 42% more per order and have a 78% repeat purchase rate vs 34% for anonymous shoppers. SafetyProfile™ reduces acquisition cost and increases lifetime value through relevance-driven engagement.
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
