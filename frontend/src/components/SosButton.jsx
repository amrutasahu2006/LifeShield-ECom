import React, { useState } from 'react'
import axios from 'axios'

export default function SosButton({ emergencyPhone }) {
  const [isLocating, setIsLocating] = useState(false)

  const handleSosClick = () => {
    if (isLocating) return

    if (!emergencyPhone) {
      alert('Emergency contact phone is missing')
      return
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported in this browser')
      return
    }

    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          await axios.post('/api/sos', {
            latitude,
            longitude,
            emergencyPhone
          })

          alert('SOS alert sent successfully')
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to send SOS alert'
          alert(message)
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          alert('Location access is required for SOS')
        } else {
          alert('Unable to retrieve your location. Please try again.')
        }
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return (
    <button
      type="button"
      onClick={handleSosClick}
      disabled={isLocating}
      className="flex h-32 w-32 items-center justify-center rounded-full bg-red-600 text-lg font-extrabold text-white shadow-2xl ring-4 ring-red-300/40 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70 animate-pulse"
      aria-label="Send SOS alert"
    >
      {isLocating ? 'Locating...' : 'SOS'}
    </button>
  )
}
