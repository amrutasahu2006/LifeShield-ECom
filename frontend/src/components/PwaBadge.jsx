import React, { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PwaBadge() {
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  const [showOfflineToast, setShowOfflineToast] = useState(false)

  useEffect(() => {
    if (!offlineReady || needRefresh) return

    setShowOfflineToast(true)
    const timer = setTimeout(() => setShowOfflineToast(false), 3000)
    return () => clearTimeout(timer)
  }, [offlineReady, needRefresh])

  if (!needRefresh && !showOfflineToast) {
    return null
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9999] w-[calc(100%-2.5rem)] max-w-sm rounded-2xl border border-slate-700/80 bg-slate-950/95 p-4 text-slate-100 shadow-2xl shadow-slate-950 backdrop-blur-lg">
      {needRefresh ? (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-sky-400" />
            <div>
              <p className="text-sm font-semibold text-sky-300">Update Available</p>
              <p className="mt-1 text-sm text-slate-200">
                New content available, click on reload button to update.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="w-full rounded-xl border border-sky-400/40 bg-sky-500/20 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/30"
          >
            Reload
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-300">Offline Ready</p>
            <p className="mt-1 text-sm text-slate-200">Ready to work offline.</p>
          </div>
        </div>
      )}
    </div>
  )
}
