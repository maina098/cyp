'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { verifyEmail } from '@/lib/api'
import '../signin/auth.css'

export default function VerifyEmailPage() {
  const router = useRouter()
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token')
    if (!token) {
      setMessage('This verification link is invalid or expired.')
      return
    }
    verifyEmail(token).then((result) => {
      const resultMessage = result?.message || 'Unable to verify email.'
      setMessage(resultMessage)
      if (resultMessage.includes('successfully')) setTimeout(() => router.replace('/signin'), 1200)
    })
  }, [router])

  return <div className="auth-page"><div className="auth-container"><div className="auth-brand"><h1>CYP</h1><p>Coastal Youth Parliament</p></div><div className="auth-card"><div className="auth-header"><h2>Email verification</h2><p>{message}</p></div><div className="auth-footer"><Link href="/signin">Back to sign in</Link></div></div></div></div>
}
