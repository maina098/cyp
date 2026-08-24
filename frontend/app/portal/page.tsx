"use client"

import Link from 'next/link'
import './portal.css'

export default function PortalPage() {
  return (
    <div className="portal-wrap">
      <div className="portal-card">
        <div className="portal-header">
          <h1 className="portal-title">Coastal Youth Parliament</h1>
          <p className="portal-subtitle">Member Portal</p>
        </div>

        <div className="portal-options">
          <Link href="/signin" className="portal-option signin-option">
            <div className="option-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </div>
            <div className="option-content">
              <h3>Sign In</h3>
              <p>Access your existing account</p>
            </div>
            <div className="option-arrow">→</div>
          </Link>

          <div className="portal-divider">
            <span>or</span>
          </div>

          <Link href="/signup" className="portal-option signup-option">
            <div className="option-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
            <div className="option-content">
              <h3>Create Account</h3>
              <p>Join the CYP community</p>
            </div>
            <div className="option-arrow">→</div>
          </Link>
        </div>

        <div className="portal-footer">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}
