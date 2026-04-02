import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import GoogleIcon from '../components/GoogleIcon'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loginMode, setLoginMode] = useState('email') // 'email' or 'phone'
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login } = useAuth()
  const { fetchCart } = useCart()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authAPI.login({
        email: form.email.trim(),
        password: form.password
      })
      login(data)
      await fetchCart()

      // Redirect based on role
      if (data.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally { 
      setLoading(false) 
    }
  }

  const requestOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!phoneNumber.trim()) {
        setError('Please enter a phone number')
        setLoading(false)
        return
      }

      // Initialize reCAPTCHA verifier if not already done
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (response) => {
            // reCAPTCHA solved
          }
        })
      }

      // Format phone number with country code if needed
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`

      const appVerifier = window.recaptchaVerifier
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier)
      
      // Save confirmation result for OTP verification
      window.confirmationResult = confirmationResult
      setOtpSent(true)
    } catch (err) {
      console.error('OTP request error:', err)
      setError(err.message || 'Failed to send OTP. Please try again.')
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
    } finally { 
      setLoading(false) 
    }
  }

  const verifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!otpCode.trim()) {
        setError('Please enter the OTP')
        setLoading(false)
        return
      }

      if (!window.confirmationResult) {
        setError('OTP session expired. Please request a new OTP.')
        setLoading(false)
        return
      }

      const result = await window.confirmationResult.confirm(otpCode)
      const idToken = await result.user.getIdToken()

      // Send phone login to backend
      const { data } = await authAPI.phoneLogin(idToken)
      login(data)
      await fetchCart()

      // Redirect based on role
      if (data.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      console.error('OTP verification error:', err)
      setError(err.message || 'Invalid OTP. Please try again.')
    } finally { 
      setLoading(false) 
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const credential = await signInWithPopup(auth, googleProvider)
      const idToken = await credential.user.getIdToken()
      const { data } = await authAPI.googleLogin(idToken)

      login(data)
      await fetchCart()

      if (data.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Google login failed. Please try again.'
      setError(message)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #1e293b)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '48px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛡️</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>Welcome Back</h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Sign in to your LIFESHIELD account</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>{error}</div>}

        <form onSubmit={loginMode === 'email' ? handleSubmit : (otpSent ? verifyOTP : requestOTP)}>
          {/* Email/Password Mode */}
          {loginMode === 'email' && (
            <>
              {[['email', 'Email Address', 'email', 'john@example.com'], ['password', 'Password', 'password', '••••••••']].map(([field, label, type, ph]) => (
                <div key={field} style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151', fontSize: '14px' }}>{label}</label>
                  <input type={type} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} placeholder={ph} required
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
              ))}
            </>
          )}

          {/* Phone Mode - Before OTP */}
          {loginMode === 'phone' && !otpSent && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151', fontSize: '14px' }}>Phone Number</label>
              <input 
                type="tel" 
                value={phoneNumber} 
                onChange={e => setPhoneNumber(e.target.value)} 
                placeholder="Enter phone number (e.g., 9876543210)"
                required
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }} 
              />
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Include country code (+91 for India)</p>
            </div>
          )}

          {/* Phone Mode - After OTP Sent */}
          {loginMode === 'phone' && otpSent && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151', fontSize: '14px' }}>Enter OTP</label>
              <input 
                type="text" 
                value={otpCode} 
                onChange={e => setOtpCode(e.target.value)} 
                placeholder="6-digit OTP"
                maxLength="6"
                required
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }} 
              />
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>OTP sent to {phoneNumber}</p>
            </div>
          )}

          {/* reCAPTCHA container for phone authentication */}
          {loginMode === 'phone' && <div id="recaptcha-container" style={{ marginBottom: '20px' }}></div>}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#dc2626', color: '#fff', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, border: 'none' }}>
            {loginMode === 'email' 
              ? (loading ? 'Signing in...' : 'Sign In →')
              : (otpSent 
                ? (loading ? 'Verifying...' : 'Verify & Login →')
                : (loading ? 'Sending OTP...' : 'Send OTP →')
              )
            }
          </button>
        </form>

        {/* Toggle between Email and Phone modes */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => {
              setLoginMode(loginMode === 'email' ? 'phone' : 'email')
              setError('')
              setOtpSent(false)
              setOtpCode('')
              setPhoneNumber('')
            }}
            style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {loginMode === 'email' ? 'Sign in with Phone instead' : 'Sign in with Email instead'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0', gap: '12px' }}>
          <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }} />
          <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>OR</span>
          <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }} />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          style={{ width: '100%', padding: '12px 14px', background: '#fff', color: '#1e293b', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: googleLoading ? 'not-allowed' : 'pointer', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <GoogleIcon size={18} />
          {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
        </button>

        <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '10px', fontSize: '13px', color: '#64748b' }}>
          <strong>Demo accounts:</strong><br />
          Admin: admin@lifeshield.com / admin123<br />
          User: john@example.com / password123
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#64748b', fontSize: '14px' }}>
          Don&apos;t have an account? <Link to="/register" style={{ color: '#dc2626', fontWeight: '600', textDecoration: 'none' }}>Register here</Link>
        </p>
      </div>
    </div>
  )
}
