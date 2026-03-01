import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { authAPI, productAPI } from '../utils/api'

const riskColors = { Fire: '#ef4444', Flooding: '#3b82f6', Tornado: '#8b5cf6', Earthquake: '#f97316' }

const recommendations = [
  { icon: '🎒', reason: '⚠️ Critical Gap: Emergency Kits', tag: '#dc2626', reasonBg: '#fee2e2', name: '72-Hour Emergency Survival Kit (4 Person)', desc: 'Essential for evacuation readiness and household 72-hour survival.', price: '$149.99', matchKeywords: ['72-hour emergency survival kit'] },
  { icon: '💧', reason: '📍 Water Resilience', tag: '#dc2626', reasonBg: '#fee2e2', name: 'Emergency Water Filtration System', desc: 'Filters up to 100K gallons for supply disruption scenarios.', price: '$34.99', matchKeywords: ['water filtration'] },
  { icon: '📻', reason: '🌪️ Multi-Risk Preparedness', tag: '#4f46e5', reasonBg: '#eef2ff', name: 'Hand Crank Emergency Weather Radio', desc: 'Critical for weather alerts, power outages, and emergency comms.', price: '$45.99', matchKeywords: ['weather radio', 'hand crank'] },
  { icon: '🩹', reason: '🧰 Household Safety Baseline', tag: '#f97316', reasonBg: '#fff7ed', name: 'Professional 326-Piece First Aid Kit', desc: 'Comprehensive first-aid coverage for everyday and emergency response.', price: '$49.99', matchKeywords: ['326-piece first aid kit', 'first aid kit'] },
]

const alerts = [
  { key: 'wildfire', icon: '🔥', title: 'Wildfire Season Reminders', desc: 'Jun–Nov alerts for CA residents', on: true },
  { key: 'flooding', icon: '🌊', title: 'Flood Risk Notifications', desc: 'Seasonal flood risk by zip code', on: true },
  { key: 'expiry', icon: '📦', title: 'Product Expiry Reminders', desc: 'Replace food rations & batteries', on: true },
  { key: 'webinars', icon: '🎓', title: 'Safety Webinars & Tips', desc: 'Monthly preparedness education', on: false },
  { key: 'sales', icon: '🛒', title: 'Stock-Up Sale Alerts', desc: 'Pre-season discounts on kits', on: true },
]

const defaultProfile = {
  region: 'California (High Wildfire + Earthquake Risk)',
  householdSize: 'Family of 4',
  homeType: 'Single-Family Home',
  needs: ['👶 Young Children', '🐕 Pets'],
  risks: ['🔥 Fire', '🌊 Flooding']
}

const defaultAlertStates = alerts.reduce((acc, alert) => ({ ...acc, [alert.key]: alert.on }), {})

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const buildScores = (profile, alertStates) => {
  const riskPenalty = profile.risks.length * 6
  const needsPenalty = profile.needs.length * 4
  const alertPenalty = Object.values(alertStates).filter(enabled => !enabled).length * 3
  const overall = clamp(92 - riskPenalty - needsPenalty - alertPenalty, 35, 98)

  const firstAid = clamp(78 + (profile.needs.includes('💊 Medical') ? -8 : 6) + (profile.needs.includes('👶 Young Children') ? -4 : 0), 40, 95)
  const fireSafety = clamp(75 + (profile.risks.includes('🔥 Fire') ? -18 : 6), 35, 95)
  const emergencyKits = clamp(72 + (profile.householdSize.includes('5+') ? -14 : profile.householdSize.includes('4') ? -8 : 5), 30, 95)
  const personalSafety = clamp(70 + (profile.needs.includes('♿ Disability') ? -12 : 6), 30, 95)
  const waterAndFood = clamp(70 + (profile.risks.includes('🌊 Flooding') ? -15 : 5), 30, 95)

  const detailed = [
    { label: '🩺 First Aid', pct: firstAid },
    { label: '🔥 Fire Safety', pct: fireSafety },
    { label: '🎒 Emergency Kits', pct: emergencyKits },
    { label: '🛡️ Personal Safety', pct: personalSafety },
    { label: '💧 Water & Food Supply', pct: waterAndFood },
  ].map(entry => ({
    ...entry,
    color: entry.pct >= 80 ? '#16a34a' : entry.pct >= 60 ? '#f97316' : '#dc2626'
  }))

  return {
    overall,
    detailed,
    criticalGaps: detailed.filter(item => item.pct < 60).length,
    status: overall >= 80 ? 'Well Prepared' : overall >= 60 ? 'Moderately Prepared' : 'At Risk'
  }
}

export default function CRMPersonalizationPage() {
  const { user, login } = useAuth()
  const { addToCart } = useCart()
  const [profile, setProfile] = useState(defaultProfile)
  const [alertStates, setAlertStates] = useState(defaultAlertStates)
  const [saving, setSaving] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileMsg, setProfileMsg] = useState('')
  const [assessmentMsg, setAssessmentMsg] = useState('')
  const [cartMsg, setCartMsg] = useState('')
  const [added, setAdded] = useState({})
  const [adding, setAdding] = useState({})
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [scores, setScores] = useState(() => buildScores(defaultProfile, defaultAlertStates))

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true)
        const { data } = await productAPI.getAll({ limit: 100 })
        setProducts(data.products || [])
      } catch {
        setProducts([])
      } finally {
        setProductsLoading(false)
      }
    }

    const fetchProfile = async () => {
      if (!user) {
        setLoadingProfile(false)
        return
      }

      try {
        const { data } = await authAPI.getProfile()
        if (data?.safetyProfile) {
          const loadedProfile = {
            region: data.safetyProfile.region || defaultProfile.region,
            householdSize: data.safetyProfile.householdSize || defaultProfile.householdSize,
            homeType: data.safetyProfile.homeType || defaultProfile.homeType,
            needs: data.safetyProfile.needs?.length ? data.safetyProfile.needs : defaultProfile.needs,
            risks: data.safetyProfile.risks?.length ? data.safetyProfile.risks : defaultProfile.risks
          }
          const loadedAlerts = { ...defaultAlertStates, ...(data.safetyProfile.alertPreferences || {}) }
          setProfile(loadedProfile)
          setAlertStates(loadedAlerts)
          setScores(buildScores(loadedProfile, loadedAlerts))
        }
      } catch {
        setProfileMsg('Could not load saved profile. Using defaults.')
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchProducts()
    fetchProfile()
  }, [user])

  const toggleAlert = (key) => {
    const updated = { ...alertStates, [key]: !alertStates[key] }
    setAlertStates(updated)
    setScores(buildScores(profile, updated))
  }

  const toggleChip = (value, field) => {
    const updatedList = profile[field].includes(value)
      ? profile[field].filter(item => item !== value)
      : [...profile[field], value]
    const updated = { ...profile, [field]: updatedList }
    setProfile(updated)
    setScores(buildScores(updated, alertStates))
  }

  const onProfileFieldChange = (field, value) => {
    const updated = { ...profile, [field]: value }
    setProfile(updated)
    setScores(buildScores(updated, alertStates))
  }

  const saveProfile = async () => {
    if (!user) {
      setProfileMsg('Please login to save your SafetyProfile.')
      return
    }

    try {
      setSaving(true)
      setProfileMsg('')
      const payload = {
        safetyProfile: {
          ...profile,
          alertPreferences: alertStates
        }
      }
      const { data } = await authAPI.updateProfile(payload)
      login({ ...user, ...data, token: user.token })
      setProfileMsg('✅ SafetyProfile saved successfully.')
    } catch (err) {
      setProfileMsg(`❌ ${err.response?.data?.message || 'Failed to save profile.'}`)
    } finally {
      setSaving(false)
    }
  }

  const runAssessment = () => {
    const updatedScores = buildScores(profile, alertStates)
    setScores(updatedScores)
    setAssessmentMsg(`Assessment complete: ${updatedScores.status} (${updatedScores.overall}/100)`)
  }

  const profileSummary = useMemo(() => {
    const riskText = profile.risks.map(risk => risk.replace(/^[^ ]+\s/, '')).join(' + ')
    const needsText = profile.needs.map(need => need.replace(/^[^ ]+\s/, '')).join(' + ')
    return `${profile.householdSize} · ${profile.region.split('(')[0].trim()} · ${riskText || 'General Risk'} · ${needsText || 'No special needs selected'}`
  }, [profile])

  const handleAdd = async (recommendation) => {
    if (!user) {
      setCartMsg('Please login to add recommended products to cart.')
      return
    }

    if (productsLoading) {
      setCartMsg('Product catalog is still loading. Please try again in a moment.')
      return
    }

    setAdding(prev => ({ ...prev, [recommendation.name]: true }))

    const product = products.find(item => recommendation.matchKeywords.some(keyword => item.name.toLowerCase().includes(keyword.toLowerCase())))
    if (!product) {
      setCartMsg(`No matching catalog product found for "${recommendation.name}".`)
      setAdding(prev => ({ ...prev, [recommendation.name]: false }))
      return
    }

    try {
      const result = await addToCart(product._id, 1)
      if (!result.success) {
        setCartMsg(`❌ ${result.message || 'Could not add item to cart.'}`)
        return
      }
      setAdded(prev => ({ ...prev, [recommendation.name]: true }))
      setCartMsg(`✅ ${recommendation.name} added to cart.`)
      setTimeout(() => setAdded(prev => ({ ...prev, [recommendation.name]: false })), 2000)
    } finally {
      setAdding(prev => ({ ...prev, [recommendation.name]: false }))
    }
  }

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
            {!user && (
              <div style={{ background: '#dbeafe', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '10px 12px', marginBottom: '16px', fontSize: '12px', color: '#1e40af' }}>
                Login required to persist your SafetyProfile. <Link to="/login" style={{ color: '#1d4ed8', fontWeight: '700', textDecoration: 'none' }}>Login →</Link>
              </div>
            )}
            {[
              ['Region / State', <select key="r" value={profile.region} onChange={(e) => onProfileFieldChange('region', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}>
                <option>California (High Wildfire + Earthquake Risk)</option>
                <option>Florida (Hurricane Zone)</option>
                <option>Texas (Tornado Alley)</option>
              </select>],
              ['Household Size', <select key="h" value={profile.householdSize} onChange={(e) => onProfileFieldChange('householdSize', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}>
                <option>1 Person</option><option>2 People</option><option>Family of 4</option><option>Family of 5+</option>
              </select>],
              ['Home Type', <select key="ht" value={profile.homeType} onChange={(e) => onProfileFieldChange('homeType', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}>
                <option>Apartment</option><option>Single-Family Home</option><option>Multi-Story House</option>
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
                  <button key={n} onClick={() => toggleChip(n, 'needs')}
                    style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '2px solid', borderColor: profile.needs.includes(n) ? '#dc2626' : '#e2e8f0', background: profile.needs.includes(n) ? '#dc2626' : '#fff', color: profile.needs.includes(n) ? '#fff' : '#64748b' }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Primary Risk Concern</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['🔥 Fire', '🌊 Flooding', '🌪️ Tornado', '🏔️ Earthquake'].map(r => (
                  <button key={r} onClick={() => toggleChip(r, 'risks')}
                    style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '2px solid', borderColor: profile.risks.includes(r) ? '#dc2626' : '#e2e8f0', background: profile.risks.includes(r) ? '#dc2626' : '#fff', color: profile.risks.includes(r) ? '#fff' : '#64748b' }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={saveProfile} disabled={saving || loadingProfile} style={{ background: '#dc2626', color: '#fff', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', width: '100%', opacity: saving ? 0.8 : 1 }}>
              💾 Save Profile & Get Recommendations →
            </button>
            {profileMsg && <div style={{ marginTop: '10px', fontSize: '12px', color: profileMsg.startsWith('✅') ? '#16a34a' : '#dc2626', fontWeight: '600' }}>{profileMsg}</div>}
          </div>

          {/* Score */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>📊 Preparedness Score</h3>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '72px', fontWeight: '800', color: '#dc2626', lineHeight: '1' }}>{scores.overall}<span style={{ fontSize: '28px' }}>/100</span></div>
              <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{scores.status}</div>
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'inline-block', marginTop: '8px' }}>⚠️ {scores.criticalGaps} critical gaps identified</div>
            </div>
            {scores.detailed.map(s => (
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
            <button onClick={runAssessment} style={{ width: '100%', marginTop: '16px', padding: '10px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Take Full Assessment →</button>
            {assessmentMsg && <div style={{ marginTop: '10px', fontSize: '12px', color: '#4f46e5', fontWeight: '600' }}>{assessmentMsg}</div>}
          </div>
        </div>

        {/* Recommendations */}
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>Recommended For You</h2>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)', marginBottom: '40px' }}>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Based on: {profileSummary}</div>
          {recommendations.map(r => (
            <div key={r.name} style={{ display: 'flex', gap: '14px', padding: '16px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start' }}>
              <div style={{ width: '56px', height: '56px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ background: r.reasonBg, color: r.tag, padding: '2px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', display: 'inline-block', marginBottom: '6px' }}>{r.reason}</div>
                <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{r.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>{r.desc}</div>
                <div style={{ fontWeight: '800', color: '#dc2626' }}>{r.price}</div>
              </div>
              <button onClick={() => handleAdd(r)} disabled={adding[r.name] || productsLoading || !user}
                style={{ background: added[r.name] ? '#16a34a' : '#1e293b', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: adding[r.name] || productsLoading || !user ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0, opacity: adding[r.name] || productsLoading || !user ? 0.8 : 1 }}>
                {adding[r.name] ? 'Adding...' : productsLoading ? 'Loading...' : !user ? 'Login to Add' : added[r.name] ? '✓ Added!' : 'Add to Cart'}
              </button>
            </div>
          ))}
          {cartMsg && <div style={{ marginTop: '12px', fontSize: '12px', color: cartMsg.startsWith('✅') ? '#16a34a' : '#dc2626', fontWeight: '600' }}>{cartMsg}</div>}
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
                <div onClick={() => toggleAlert(a.key)} style={{ width: '42px', height: '24px', background: alertStates[a.key] ? '#dc2626' : '#e2e8f0', borderRadius: '12px', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background .2s' }}>
                  <div style={{ position: 'absolute', top: '4px', left: alertStates[a.key] ? '22px' : '4px', width: '16px', height: '16px', background: '#fff', borderRadius: '50%', transition: 'left .2s' }} />
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
