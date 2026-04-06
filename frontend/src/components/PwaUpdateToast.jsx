import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PwaUpdateToast() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  const closeToast = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) {
    return null
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9999] w-[calc(100%-2.5rem)] max-w-sm rounded-2xl border border-slate-700 bg-slate-900/95 p-4 text-slate-100 shadow-2xl backdrop-blur-sm">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-wide text-slate-100">
          {needRefresh ? 'Update available' : 'Offline ready'}
        </h3>
        <button
          type="button"
          onClick={closeToast}
          className="rounded-md border border-slate-600 px-2 py-0.5 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
          aria-label="Close PWA notification"
        >
          Close
        </button>
      </div>

      <p className="mb-4 text-sm leading-5 text-slate-300">
        {needRefresh
          ? 'A new LifeShield version is available. Reload now to apply the latest emergency guide updates.'
          : 'LifeShield can now be used offline. Emergency guides are available even without internet.'}
      </p>

      {needRefresh && (
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Reload and Update
        </button>
      )}
    </div>
  )
}
