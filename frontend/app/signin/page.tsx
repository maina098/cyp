'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '../../lib/api'
import './auth.css'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (!email || !password) return setMessage('Please fill all fields')
    setLoading(true)
    const res = await signIn(email, password)
    setLoading(false)
    const token = res.access_token || res.token
    if (token) {
      localStorage.setItem('token', token)
      if (res.user) {
        localStorage.setItem('user', JSON.stringify(res.user))
      }
      setMessage('Signed in successfully!')
      const redirectPath = res.user?.role?.toUpperCase() === 'ADMIN' ? '/admin' : '/dashboard'
      router.replace(redirectPath)
    } else {
      setMessage('Internal server error. Please try again later.')
    }
  }

  return (
    <div className="auth-page signin-page">
      <div className="auth-container">
        <div className="auth-brand">
          <h1>CYP</h1>
          <p>Coastal Youth Parliament</p>
        </div>
        
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group password-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>
              <Link href="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {message && <div className={`auth-message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link href="/signup">Create one</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
