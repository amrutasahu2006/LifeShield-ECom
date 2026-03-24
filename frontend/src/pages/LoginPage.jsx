import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import GoogleIcon from '../components/GoogleIcon'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login } = useAuth()
  const { fetchCart } = useCart()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
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
    } finally { setLoading(false) }
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

        <form onSubmit={handleSubmit}>
          {[['email', 'Email Address', 'email', 'john@example.com'], ['password', 'Password', 'password', '••••••••']].map(([field, label, type, ph]) => (
            <div key={field} style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151', fontSize: '14px' }}>{label}</label>
              <input type={type} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} placeholder={ph} required
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
          ))}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#dc2626', color: '#fff', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, border: 'none' }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

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
