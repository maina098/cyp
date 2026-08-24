"use client"

import React, { useEffect, useState } from 'react'

export default function ProfilePage(){
  const [profile, setProfile] = useState({ mission: '', vision: '', work: '' })

  useEffect(()=>{
    try{
      const raw = localStorage.getItem('userProfile')
      if(raw) setProfile(JSON.parse(raw))
    }catch{}
  },[])

  function save(){
    localStorage.setItem('userProfile', JSON.stringify(profile))
    alert('Profile saved')
  }

  return (
    <div style={{padding:28}}>
      <h2>Profile: Mission & Vision</h2>
      <div style={{maxWidth:720}}>
        <label>Mission</label>
        <textarea value={profile.mission} onChange={(e)=>setProfile({...profile,mission:e.target.value})} style={{width:'100%',minHeight:80}} />
        <label>Vision</label>
        <textarea value={profile.vision} onChange={(e)=>setProfile({...profile,vision:e.target.value})} style={{width:'100%',minHeight:80}} />
        <label>Work / Activities</label>
        <textarea value={profile.work} onChange={(e)=>setProfile({...profile,work:e.target.value})} style={{width:'100%',minHeight:120}} />
        <div style={{marginTop:12}}>
          <button onClick={save} style={{padding:'10px 16px',borderRadius:8,background:'#1161ee',color:'#fff',border:'none'}}>Save Profile</button>
        </div>
      </div>
    </div>
  )
}
