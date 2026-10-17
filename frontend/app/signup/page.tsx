'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '../../lib/api'
import './auth.css'

export default function SignUpPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (!username || !email || !password || !confirmPassword) {
      return setMessage('Please fill all fields')
    }
    if (password !== confirmPassword) {
      return setMessage('Passwords do not match')
    }
    if (password.length < 8) {
      return setMessage('Password must be at least 8 characters')
    }
    setLoading(true)
    const res = await signUp(username, email, password)
    setLoading(false)
    if (res.message && !res.access_token && !res.token) {
      setMessage(res.message)
      setTimeout(() => router.push('/signin'), 1200)
    } else {
      setMessage(res.message || 'Sign up failed')
    }
  }

  return (
    <div className="auth-page signup-page">
      <div className="auth-container">
        <div className="auth-brand">
          <h1>CYP</h1>
          <p>Coastal Youth Parliament</p>
        </div>
        
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Join the Coastal Youth Parliament community</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nassib Kibwana"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="emmanueldulla@gmail.com"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrap">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
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

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-wrap">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showConfirmPassword}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            {message && <div className={`auth-message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link href="/signin">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
