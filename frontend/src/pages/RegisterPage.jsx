import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import GoogleIcon from '../components/GoogleIcon'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const syncFirebaseUser = async (firebaseUser, fallbackName) => {
    const payload = {
      name: firebaseUser.displayName || fallbackName || '',
      email: firebaseUser.email || '',
      uid: firebaseUser.uid,
      googleId: firebaseUser.uid
    }

    const { data } = await axios.post('/api/auth/google', payload)
    login(data)
    navigate('/dashboard')
  }

  const handleEmailRegister = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await updateProfile(userCredential.user, { displayName: form.name })
      await syncFirebaseUser({ ...userCredential.user, displayName: form.name }, form.name)
    } catch (err) {
      setError(err?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const handleGoogleRegister = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const credential = await signInWithPopup(auth, googleProvider)
      await syncFirebaseUser(credential.user, credential.user.displayName)
    } catch (err) {
      setError(err?.message || 'Google signup failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #1e293b)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '48px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛡️</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>Create Account</h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Join LIFESHIELD today</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleEmailRegister}>
          {[['name','Full Name','text','John Doe'],['email','Email Address','email','john@example.com'],['password','Password','password','Min 6 characters'],['confirmPassword','Confirm Password','password','Repeat your password']].map(([field, label, type, ph]) => (
            <div key={field} style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151', fontSize: '14px' }}>{label}</label>
              <input type={type} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} placeholder={ph} required
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
          ))}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#dc2626', color: '#fff', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, border: 'none' }}>
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={googleLoading}
          style={{ width: '100%', padding: '12px 14px', background: '#fff', color: '#1e293b', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: googleLoading ? 'not-allowed' : 'pointer', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '14px' }}
        >
          <GoogleIcon size={18} />
          {googleLoading ? 'Signing up with Google...' : 'Continue with Google'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0', gap: '12px' }}>
          <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }} />
          <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>OR</span>
          <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }} />
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#64748b', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#dc2626', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
