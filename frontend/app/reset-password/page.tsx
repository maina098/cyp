'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { resetPassword } from '@/lib/api'
import '../signin/auth.css'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => setToken(new URLSearchParams(window.location.search).get('token') || ''), [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (password.length < 12) return setMessage('Password must be at least 12 characters.')
    if (password !== confirmPassword) return setMessage('Passwords do not match.')
    setLoading(true)
    const result = await resetPassword(token, password)
    const resultMessage = result?.message || 'Unable to reset password.'
    setMessage(resultMessage)
    setLoading(false)
    if (resultMessage.includes('successfully')) setTimeout(() => router.replace('/signin'), 1200)
  }

  return <div className="auth-page"><div className="auth-container"><div className="auth-brand"><h1>CYP</h1><p>Coastal Youth Parliament</p></div><div className="auth-card"><div className="auth-header"><h2>Choose a new password</h2><p>Use at least 12 characters.</p></div><form onSubmit={submit} className="auth-form"><div className="form-group"><label htmlFor="password">New password</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div><div className="form-group"><label htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div><button className="auth-button" disabled={loading}>{loading ? 'Updating...' : 'Update password'}</button>{message && <div className="auth-message">{message}</div>}</form><div className="auth-footer"><Link href="/signin">Back to sign in</Link></div></div></div></div>
}
