import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function ThreatIntelWidget() {
  const [locationState, setLocationState] = useState('loading')
  const [threatData, setThreatData] = useState(null)
  const [apiLoading, setApiLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const fetchThreatIntel = async (latitude, longitude) => {
      setApiLoading(true)
      try {
        const { data } = await axios.get('/api/threat-alerts', {
          params: { lat: latitude, lon: longitude }
        })

        if (cancelled) return

        setThreatData(data)
        setLocationState('success')
      } catch (error) {
        if (cancelled) return
        setLocationState('error')
      } finally {
        if (!cancelled) {
          setApiLoading(false)
        }
      }
    }

    if (!navigator.geolocation) {
      setLocationState('error')
      return () => {
        cancelled = true
      }
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        fetchThreatIntel(coords.latitude, coords.longitude)
      },
      () => {
        setLocationState('error')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )

    return () => {
      cancelled = true
    }
  }, [])

  const renderContent = () => {
    if (locationState === 'loading' || apiLoading) {
      return (
        <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <div className="h-3 w-3 animate-pulse rounded-full bg-sky-400" />
          <p className="text-sm text-slate-200">Acquiring local threat intel...</p>
        </div>
      )
    }

    if (locationState === 'error') {
      return (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-100">
          <p className="text-sm font-semibold">Location access needed</p>
          <p className="mt-1 text-sm text-amber-200/90">
            Please enable location permissions to get live threat alerts for your area.
          </p>
        </div>
      )
    }

    if (!threatData) {
      return null
    }

    if (!threatData.hasAlert) {
      return (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-emerald-400" />
            <p className="text-lg font-semibold text-emerald-300">All Clear</p>
          </div>
          <p className="mt-2 text-sm text-emerald-100/90">{threatData.weather} in {threatData.location}.</p>
        </div>
      )
    }

    const recommendedHref = `/products?search=${encodeURIComponent(threatData.recommendedKit || '')}`

    return (
      <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Active Local Alert</p>
        <h4 className="mt-2 text-lg font-bold text-red-400">{threatData.alertType}</h4>
        <p className="mt-2 text-sm text-slate-100">{threatData.description}</p>

        <a
          href={recommendedHref}
          className="mt-4 inline-flex items-center rounded-lg border border-red-400/50 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-500/30 hover:text-white"
        >
          View Recommended Gear {'->'}
        </a>
      </div>
    )
  }

  return (
    <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/30">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300">Live Threat Intel</h3>
        <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400">
          Geo-Aware
        </span>
      </div>

      {renderContent()}
    </section>
  )
}
