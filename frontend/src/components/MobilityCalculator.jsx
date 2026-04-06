import React, { useMemo, useState } from 'react'

const SAFE_MAX_WEIGHT_KG = 15.0

const BASE_ITEMS = [
  { id: 'water-rations', name: 'Water Rations', weightKg: 2.5 },
  { id: 'trauma-kit', name: 'Trauma Kit', weightKg: 1.2 },
]

const HEAVY_GENERATOR = { id: 'heavy-generator', name: 'Heavy Generator', weightKg: 12.0 }

export default function MobilityCalculator() {
  const [includeHeavyItem, setIncludeHeavyItem] = useState(true)

  const selectedItems = useMemo(() => {
    return includeHeavyItem ? [...BASE_ITEMS, HEAVY_GENERATOR] : BASE_ITEMS
  }, [includeHeavyItem])

  const totalWeight = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.weightKg, 0)
  }, [selectedItems])

  const weightPercentage = Math.min((totalWeight / SAFE_MAX_WEIGHT_KG) * 100, 100)

  const getBarColorClass = () => {
    if (weightPercentage < 60) return 'bg-green-500'
    if (weightPercentage <= 90) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const hasCriticalOverload = totalWeight >= SAFE_MAX_WEIGHT_KG

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/30">
      <header className="mb-4 flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">🎒 Mobility &amp; Weight Capacity</h3>
        <p className="text-sm font-medium text-slate-300">
          {totalWeight.toFixed(1)} kg / {SAFE_MAX_WEIGHT_KG.toFixed(1)} kg
        </p>
      </header>

      <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full ${getBarColorClass()} transition-all duration-500`}
          style={{ width: `${weightPercentage}%` }}
          aria-hidden="true"
        />
      </div>

      <p className="mb-4 text-sm text-slate-400">Current load utilization: {weightPercentage.toFixed(0)}%</p>

      {hasCriticalOverload && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-red-400" aria-hidden="true" />
            Critical: This bag exceeds the recommended mobility weight for rapid evacuation.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIncludeHeavyItem((prev) => !prev)}
        className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-700"
      >
        Toggle Heavy Item (Test Limit)
      </button>
    </section>
  )
}
