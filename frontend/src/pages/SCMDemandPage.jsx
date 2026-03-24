import React, { useState, useEffect } from 'react'
import { productAPI } from '../utils/api'

const pipelineSteps = [
  { icon: '📊', title: 'Demand Signals', desc: 'Sales velocity, cart data, search trends, weather alerts' },
  { icon: '🧠', title: 'AI Forecast Engine', desc: 'Seasonal model + disaster calendar + CRM profile data', active: true },
  { icon: '⚙️', title: 'Auto Reorder Trigger', desc: 'ROP reached → Purchase Order generated automatically' },
  { icon: '🚛', title: 'Supplier Fulfillment', desc: 'Tier-1 suppliers notified; lead time tracked in real-time' },
  { icon: '🏬', title: 'Warehouse → Customer', desc: 'Stock arrives, listed live, shipped within 24 hrs' },
]

const chartData = [
  { month: 'Jan', actual: 45, forecast: 50 }, { month: 'Feb', actual: 40, forecast: 42 },
  { month: 'Mar', actual: 38, forecast: 40 }, { month: 'Apr', actual: 44, forecast: 43 },
  { month: 'May', actual: 52, forecast: 55 }, { month: 'Jun', actual: 80, forecast: 75 },
  { month: 'Jul', actual: 100, forecast: 98 }, { month: 'Aug', actual: 110, forecast: 105 },
  { month: 'Sep', actual: 90, forecast: 92 }, { month: 'Oct', actual: 65, forecast: 68 },
  { month: 'Nov', actual: 55, forecast: 55 }, { month: 'Dec', actual: 70, forecast: 72 },
]

const inventory = [
  { name: '72-Hour Kit (4-person)', units: 6, max: 100, color: '#dc2626', alert: '⚠️ Below ROP (20 units) — Auto PO triggered', alertColor: '#dc2626' },
  { name: 'First Aid Kit 326pc', units: 85, max: 100, color: '#16a34a', alert: null },
  { name: 'ABC Fire Extinguisher', units: 60, max: 100, color: '#16a34a', alert: null },
  { name: 'Personal Alarm (130dB)', units: 100, max: 100, color: '#16a34a', alert: null },
  { name: 'Water Filtration System', units: 28, max: 100, color: '#d97706', alert: '📋 Approaching ROP (25 units) — Review needed', alertColor: '#d97706' },
  { name: 'GPS Emergency Beacon', units: 20, max: 100, color: '#d97706', alert: null },
]

const matrix = [
  { cat: 'First Aid Kits', q: ['Medium', 'Medium', 'HIGH', 'Medium'], driver: 'Outdoor + disaster season' },
  { cat: 'Fire Safety Equipment', q: ['Low', 'Medium', 'HIGH', 'Medium'], driver: 'Wildfire season (CA/CO/OR)' },
  { cat: 'Disaster Prep Kits', q: ['Low', 'HIGH', 'HIGH', 'Medium'], driver: 'Pre-hurricane + wildfire prep' },
  { cat: 'Personal Safety Devices', q: ['Medium', 'Medium', 'Medium', 'HIGH'], driver: 'Holiday gifting + back-to-school' },
]

const levelStyle = { HIGH: { bg: '#fee2e2', color: '#dc2626', fw: '800' }, Medium: { bg: '#fef3c7', color: '#d97706', fw: '600' }, Low: { bg: '#dcfce7', color: '#16a34a', fw: '600' } }

const suppliers = [
  { flag: '🇮🇳', name: 'MediGuard Industries – Mumbai', rating: '⭐⭐⭐⭐⭐ 4.9', products: 'First Aid Kits', lead: '5 days', moq: '50 units', tier: 'Tier 1', tierColor: '#dcfce7', tierText: '#16a34a' },
  { flag: '🇺🇸', name: 'FireShield Corp – Texas, USA', rating: '⭐⭐⭐⭐⭐ 4.8', products: 'Fire Equipment', lead: '3 days', moq: '25 units', tier: 'Tier 1', tierColor: '#dcfce7', tierText: '#16a34a' },
  { flag: '🇨🇳', name: 'SafeGear Manufacturing – Shenzhen', rating: '⭐⭐⭐⭐ 4.3', products: 'All categories', lead: '14 days', moq: '100 units', tier: 'Tier 2', tierColor: '#dbeafe', tierText: '#3b82f6' },
]

export default function SCMDemandPage() {
  const [data, setData] = useState({ chartData, inventory, suppliers })
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    productAPI.getScmTransparency()
      .then(res => {
        const payload = res?.data || {}
        setData({
          chartData: Array.isArray(payload.chartData) && payload.chartData.length > 0 ? payload.chartData : chartData,
          inventory: Array.isArray(payload.inventory) && payload.inventory.length > 0 ? payload.inventory : inventory,
          suppliers: Array.isArray(payload.suppliers) && payload.suppliers.length > 0 ? payload.suppliers : suppliers
        })
        setApiError('')
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch live SCM data:', err)
        setApiError('Live SCM data is temporarily unavailable. Showing fallback snapshot.')
        setLoading(false)
      })
  }, [])

  const safeChartData = Array.isArray(data.chartData) ? data.chartData : chartData
  const safeInventory = Array.isArray(data.inventory) ? data.inventory : inventory
  const safeSuppliers = Array.isArray(data.suppliers) ? data.suppliers : suppliers

  const dynamicMaxVal = Math.max(
    120, // Minimum floor to prevent 0 division
    ...safeChartData.map(d => Math.max(d.forecast || 0, d.actual || 0))
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#0f172a,#064e3b,#1e3a5f)', color: '#fff', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ background: '#059669', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'inline-block', marginBottom: '20px', letterSpacing: '1px' }}>
          DEMAND ANALYSIS — SUPPLY CHAIN MANAGEMENT STRATEGY
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: '800', marginBottom: '12px' }}>
          Demand-Driven <span style={{ color: '#34d399' }}>SCM Dashboard</span>
        </h1>
        <p style={{ color: '#a7f3d0', maxWidth: '640px', margin: '0 auto 28px', fontSize: '16px', lineHeight: '1.6' }}>
          LIFESHIELD uses real-time demand signals, seasonal disaster patterns, and AI-powered forecasting to maintain optimal inventory levels and avoid the stockouts that cost lives during emergencies.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['✦ Seasonal Demand Forecasting', '✦ Auto Reorder Triggers', '✦ Multi-Tier Supplier Network'].map(t => (
            <div key={t} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', padding: '10px 20px', borderRadius: '10px', fontSize: '13px' }}>{t}</div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
        {apiError && (
          <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '10px', background: '#fff7ed', border: '1px solid #fdba74', color: '#9a3412', fontSize: '14px', fontWeight: '600' }}>
            {apiError}
          </div>
        )}
        {loading && (
          <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #93c5fd', color: '#1e40af', fontSize: '14px', fontWeight: '600' }}>
            Loading latest SCM data...
          </div>
        )}

        {/* Strategy Box */}
        <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '16px', padding: '24px', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#064e3b', marginBottom: '8px' }}>📋 SCM STRATEGY: Demand Analysis-Driven Supply Chain Management</h3>
          <p style={{ fontSize: '13px', color: '#065f46', lineHeight: '1.7' }}>
            LIFESHIELD employs a <strong>Demand Analysis-Driven SCM strategy</strong> that uses historical sales data, real-time order velocity, seasonal disaster calendars (hurricane season, wildfire season, winter storms), and geographic risk alerts to forecast demand and automate replenishment. Unlike traditional periodic reorder systems, LIFESHIELD's system continuously recalculates <em>Reorder Points (ROP)</em> and <em>Economic Order Quantities (EOQ)</em> based on live demand signals. This eliminates stockouts during peak disaster seasons — the single most damaging failure in emergency product retail — while reducing excess inventory holding costs by an estimated 28%.
          </p>
        </div>

        {/* Pipeline */}
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>SCM Pipeline Flow</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0', marginBottom: '40px', boxShadow: '0 4px 20px rgba(0,0,0,.08)', borderRadius: '16px', overflow: 'hidden' }}>
          {pipelineSteps.map((s, i) => (
            <div key={s.title} style={{ padding: '20px 14px', textAlign: 'center', background: s.active ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : '#fff', borderRight: i < 4 ? '1px solid #e2e8f0' : 'none' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: s.active ? '#fff' : '#374151', marginBottom: '4px' }}>{s.title}</h4>
              <p style={{ fontSize: '11px', color: s.active ? '#fca5a5' : '#64748b', lineHeight: '1.4' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Chart + Inventory */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '28px', marginBottom: '40px' }}>

          {/* Demand Chart */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '16px' }}>📈 Demand Forecast vs Actual (2024)</h3>
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '120px', marginBottom: '8px' }}>
                {safeChartData.map((d, i) => (
                  <div key={d.month + i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', width: '100%' }}>
                      <div style={{ flex: 1, background: '#3b82f6', borderRadius: '2px 2px 0 0', height: `${(d.actual / dynamicMaxVal) * 110}px` }} />
                      <div style={{ flex: 1, background: 'transparent', border: '2px dashed #dc2626', borderBottom: 'none', borderRadius: '2px 2px 0 0', height: `${(d.forecast / dynamicMaxVal) * 110}px` }} />
                    </div>
                    <div style={{ fontSize: '8px', color: '#94a3b8', fontWeight: '600' }}>{d.month}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#64748b', flexWrap: 'wrap' }}>
                <span><span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#3b82f6', marginRight: '4px', borderRadius: '2px' }}></span>Actual Sales</span>
                <span><span style={{ display: 'inline-block', width: '10px', height: '10px', border: '2px dashed #dc2626', marginRight: '4px', borderRadius: '2px' }}></span>Forecast</span>
                <span style={{ marginLeft: 'auto', color: '#16a34a', fontWeight: '600' }}>✓ Accuracy: 94.2%</span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>Peak demand Jun–Sep aligns with <strong>wildfire + hurricane seasons</strong>. Pre-purchased inventory in Apr/May enables zero stockouts during peak months.</p>
          </div>

          {/* Inventory */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>🏭 Live Inventory Status</h3>
            {safeInventory.map((item, i) => (
              <div key={item.name + i} style={{ marginBottom: item.alert ? '4px' : '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', minWidth: '160px', flex: 1 }}>{item.name}</div>
                  <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '4px', background: item.color, width: `${(item.units / item.max) * 100}%` }} />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: item.color, minWidth: '50px', textAlign: 'right' }}>{item.units} units</div>
                </div>
                {item.alert && <div style={{ fontSize: '11px', color: item.alertColor, marginTop: '2px', marginBottom: '10px', paddingLeft: '4px' }}>{item.alert}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Seasonal Matrix */}
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>Seasonal Demand Analysis Matrix</h2>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)', marginBottom: '40px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#1e293b' }}>
                {['Product Category', 'Q1 (Jan–Mar)', 'Q2 (Apr–Jun)', 'Q3 (Jul–Sep) 🔥🌀', 'Q4 (Oct–Dec)', 'Peak Season Driver'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', color: '#fff', fontWeight: '700', textAlign: h === 'Product Category' || h === 'Peak Season Driver' ? 'left' : 'center', border: '1px solid #334155', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map(row => (
                <tr key={row.cat}>
                  <td style={{ padding: '12px 14px', fontWeight: '700', border: '1px solid #e2e8f0' }}>{row.cat}</td>
                  {row.q.map((level, i) => (
                    <td key={i} style={{ padding: '12px 14px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                      <span style={{ background: levelStyle[level].bg, color: levelStyle[level].color, fontWeight: levelStyle[level].fw, padding: '3px 10px', borderRadius: '4px', fontSize: '12px' }}>{level}</span>
                    </td>
                  ))}
                  <td style={{ padding: '12px 14px', fontSize: '12px', color: '#64748b', border: '1px solid #e2e8f0' }}>{row.driver}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '14px' }}>SCM Action: Inventory buffers built up 6–8 weeks before each peak season. Suppliers placed on <em>Advance Purchase Orders (APO)</em> by April to secure Q3 stock.</p>
        </div>

        {/* Suppliers + Reorder Alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '28px' }}>

          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>🏭 Supplier Network</h3>
            {safeSuppliers.map((s, i) => (
              <div key={s.name + i} style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '28px' }}>{s.flag}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '2px' }}>{s.name}</div>
                  <div style={{ fontSize: '12px', color: '#f59e0b' }}>{s.rating}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{s.products} · Lead: {s.lead} · MOQ: {s.moq}</div>
                </div>
                <div style={{ background: s.tierColor, color: s.tierText, padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>{s.tier}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>🚨 Reorder Alerts (Live)</h3>
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', marginBottom: '14px' }}>
              <div style={{ fontSize: '20px' }}>⚠️</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#dc2626' }}>72-Hour Kit — CRITICAL REORDER</div>
                <div style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '4px', lineHeight: '1.6' }}>Current: 6 units · ROP: 20 · EOQ: 50 units<br />PO #LS2024-0482 auto-generated → MediGuard Mumbai<br />Expected arrival: Jan 8, 2025</div>
              </div>
            </div>
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', marginBottom: '14px' }}>
              <div style={{ fontSize: '20px' }}>📋</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#92400e' }}>Water Filtration — REVIEW NEEDED</div>
                <div style={{ fontSize: '12px', color: '#78350f', marginTop: '4px', lineHeight: '1.6' }}>Current: 28 units · ROP: 25 · Approaching threshold<br />Forecast: 15 units needed in next 30 days<br />Suggested PO: 60 units from SafeGear</div>
              </div>
            </div>
            <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '20px' }}>✅</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#166534' }}>First Aid Kit — STOCK HEALTHY</div>
                <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px', lineHeight: '1.6' }}>Current: 85 units · ROP: 30 · 18+ weeks of supply<br />Next review: February 2025</div>
              </div>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', fontSize: '12px', color: '#64748b', lineHeight: '1.7' }}>
              <strong>Auto-reorder formula:</strong><br />
              ROP = (Avg Daily Demand × Lead Time) + Safety Stock<br />
              Safety Stock = 1.5σ above mean demand (95% service level)
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
