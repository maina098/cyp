"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import '../../portal/dashboard.css'

type UserProfile = { name?: string; email?: string }

export default function AdminDashboard(){
  const [user, setUser] = useState<UserProfile>({ name: 'Admin', email: 'admin@cyp.local' })

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const u = JSON.parse(raw)
        setUser({ name: u.name || 'Admin', email: u.email || 'admin@cyp.local' })
      }
    } catch {}
  }, [])

  return (
    <div className="dash-shell">
      <aside className="sidebar">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div className="brand-mark">C</div>
          <div>
            <div style={{fontWeight:700}}>{user.name}</div>
            <div style={{fontSize:12,opacity:0.85}}>{user.email}</div>
          </div>
        </div>

        <nav className="side-nav">
          <Link href="/portal/admin" className="side-item active">Dashboard</Link>
          <Link href="/portal/admin/users" className="side-item">Users</Link>
          <Link href="/portal/admin/content" className="side-item">Content</Link>
          <Link href="/portal/admin/settings" className="side-item">Settings</Link>
        </nav>

        <div style={{marginTop:'auto',fontSize:13}}>
          <div>Settings | Logout</div>
        </div>
      </aside>

      <main className="content-area">
        <div className="topbar">
          <h2>Admin Dashboard</h2>
          <div className="search-box"><input placeholder="Search.." style={{width:'100%',padding:12,borderRadius:24,border:'none'}}/></div>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <div style={{width:40,height:40,borderRadius:20,background:'#ddd'}} />
            <div style={{width:36,height:36,borderRadius:8,background:'#1161ee'}} />
          </div>
        </div>

        <div className="kpi-row">
          <div className="kpi-card">
            <div className="small">Educational Impact</div>
            <div className="large">12,400 people</div>
            <div className="small">48% target reached</div>
          </div>
          <div className="kpi-card">
            <div className="small">Community Programs Initiated</div>
            <div className="large">24 programs</div>
            <div className="small">55% target reached</div>
          </div>
          <div className="kpi-card">
            <div className="small">Election</div>
            <div className="large">3 districts</div>
            <div className="small">87% participation</div>
          </div>
          <div className="kpi-card">
            <div className="small">Community Development & Awareness</div>
            <div className="large">78 initiatives</div>
            <div className="small">87% target reached</div>
          </div>
        </div>

        <div className="revenue-panel">
          <div className="revenue-list">
            <h3>Impact by location</h3>
            <p className="small">Summary of community impact by coastal county</p>
            <ul style={{listStyle:'none',padding:0,marginTop:18}}>
              <li style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #eee'}}><span>Mombasa</span><strong>4,200 people</strong></li>
              <li style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #eee'}}><span>Kwale</span><strong>2,100 people</strong></li>
              <li style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #eee'}}><span>Kilifi</span><strong>3,300 people</strong></li>
              <li style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #eee'}}><span>Tana River</span><strong>800 people</strong></li>
            </ul>
          </div>

          <div className="revenue-map">
            <h4>Coastal Map</h4>
            <div style={{height:240,borderRadius:8,display:'grid',placeItems:'center'}}>
              <Image src="/images/coast-map.jpg" alt="Coastal map" width={400} height={240} style={{maxWidth:'100%',borderRadius:6}} priority />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
