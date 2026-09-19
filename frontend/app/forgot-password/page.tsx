'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/lib/api'
import '../signin/auth.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    const result = await requestPasswordReset(email)
    setMessage(result.message || 'If an account exists for that email, password reset instructions have been sent.')
    setLoading(false)
  }

  return <div className="auth-page"><div className="auth-container"><div className="auth-brand"><h1>CYP</h1><p>Coastal Youth Parliament</p></div><div className="auth-card"><div className="auth-header"><h2>Reset your password</h2><p>Enter your email and we will send reset instructions.</p></div><form onSubmit={submit} className="auth-form"><div className="form-group"><label htmlFor="email">Email Address</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div><button className="auth-button" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>{message && <div className="auth-message success">{message}</div>}</form><div className="auth-footer"><Link href="/signin">Back to sign in</Link></div></div></div></div>
}
