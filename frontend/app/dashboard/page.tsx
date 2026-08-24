'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { changeMemberPassword, getEvents, getMemberDashboard, getResources, submitEventParticipation, updateMemberProfile, uploadMemberFile, uploadProfilePicture } from '@/lib/api'
import LiveElection from '@/app/elections/live-election'
import './dashboard.css'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '')

type Member = { id?: string; email: string; name: string; role?: string; county?: string | null; phone?: string | null; profileImageUrl?: string | null; constituency?: string | null; bio?: string | null }
type Item = { id?: string; title: string; summary?: string; content?: string; description?: string; publishedAt?: string; startsAt?: string; endsAt?: string; date?: string; location?: string; fileUrl?: string }
type Application = { id: string; status: string; appliedAt?: string; position?: { title?: string }; electionId?: string }
type Activity = { label: string; date: string; status: string }

function formatDate(value?: string) {
  if (!value) return 'Date to be announced'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function UserDashboard() {
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [resources, setResources] = useState<Item[]>([])
  const [events, setEvents] = useState<Item[]>([])
  const [elections, setElections] = useState<any[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [liveStats, setLiveStats] = useState<any>(null)
  const [stats, setStats] = useState({ eventsAttended: 0, publishedContentRead: 0, communityScore: 0, communityServicesInitiated: 0 })
  const [activity, setActivity] = useState<Activity[]>([])
  const [profileMessage, setProfileMessage] = useState('')
  const [eventMessage, setEventMessage] = useState('')
  const [eventForm, setEventForm] = useState({ eventId: '', title: '', description: '', attachment: null as File | null })
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', county: '', constituency: '', bio: '' })
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedMember = localStorage.getItem('user')
    if (!token) { router.replace('/signin'); return }
    let parsed: Member | null = null
    try {
      parsed = storedMember ? JSON.parse(storedMember) : null
      if (parsed?.role?.toUpperCase() === 'ADMIN') { router.replace('/admin'); return }
      setMember(parsed)
      setProfileForm({ name: parsed?.name || '', email: parsed?.email || '', phone: parsed?.phone || '', county: parsed?.county || '', constituency: parsed?.constituency || '', bio: parsed?.bio || '' })
    } catch { router.replace('/signin'); return }

    const load = async () => {
      try {
        const dashboard = await getMemberDashboard(token)
        if (!dashboard) throw new Error('Unable to load dashboard')
        setMember(dashboard.user)
        setStats(dashboard.stats)
        setProfileForm({ name: dashboard.user.name || '', email: dashboard.user.email || '', phone: dashboard.user.phone || '', county: dashboard.user.county || '', constituency: dashboard.user.constituency || '', bio: dashboard.user.bio || '' })
        setResources(dashboard.resources || [])
        setEvents((dashboard.events || []).map((item) => ({ ...item.event, participationStatus: item.status, mediaUrl: item.mediaUrl })))
        setElections(dashboard.elections || [])
        setApplications((dashboard.elections || []).flatMap((election: any) => election.applications || []))
        setLiveStats(null)
        setActivity((dashboard.recentActivity || []).map((item) => ({ label: item.details || item.action, date: item.createdAt, status: 'Recorded' })))
      } catch { /* The dashboard still renders useful content when optional APIs are unavailable. */ }
      setLoading(false)
    }
    load()
  }, [router])

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.replace('/signin') }

  const updateProfile = async (event: FormEvent) => {
    event.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return
    const nextMember = await updateMemberProfile(token, profileForm)
    if (nextMember) { setMember(nextMember); localStorage.setItem('user', JSON.stringify(nextMember)); setProfileMessage('Profile details saved.') }
    else setProfileMessage('Unable to save profile details.')
  }

  const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const token = localStorage.getItem('token')
    if (!token) return
    const nextMember = await uploadProfilePicture(token, file)
    if (nextMember) { setMember(nextMember); setProfileMessage('Profile picture uploaded.') }
    else setProfileMessage('Unable to upload profile picture.')
  }

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault()
    if (passwordForm.next !== passwordForm.confirm) { setProfileMessage('New passwords must match.'); return }
    const token = localStorage.getItem('token')
    const result = token ? await changeMemberPassword(token, passwordForm.current, passwordForm.next) : null
    setProfileMessage(result?.message || 'Unable to change password.')
    if (result) setPasswordForm({ current: '', next: '', confirm: '' })
  }

  const submitEvent = async (event: FormEvent) => {
    event.preventDefault()
    const token = localStorage.getItem('token')
    if (!token || !eventForm.eventId) { setEventMessage('Select an organization event first.'); return }
    const uploaded = eventForm.attachment ? await uploadMemberFile(token, eventForm.attachment) : null
    const result = await submitEventParticipation(token, eventForm.eventId, { title: eventForm.title, description: eventForm.description, mediaUrl: uploaded?.url, mediaType: uploaded?.mediaType })
    setEventMessage(result ? 'Event submitted for admin review.' : 'Unable to submit event.')
    if (result) setEventForm({ eventId: '', title: '', description: '', attachment: null })
  }

  const activeElection = elections.find((election) => election.status === 'active') || elections[0]
  const attendedCount = stats.eventsAttended
  const publishedCount = resources.length

  if (loading) return <div className="dashboard-loading"><div className="spinner" /><p>Loading your member workspace...</p></div>

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand"><div className="brand-icon">CYP</div><span className="brand-text">Member Portal</span></div>
        <nav className="sidebar-nav">
          {[['dashboard', 'Dashboard'], ['profile', 'My Profile'], ['events', 'Events'], ['resources', 'Resources'], ['elections', 'Elections']].map(([key, label]) => <button key={key} className={`nav-link ${activeMenu === key ? 'active' : ''}`} onClick={() => setActiveMenu(key)}>{label}</button>)}
        </nav>
        <div className="sidebar-footer"><button onClick={logout} className="logout-btn">Logout</button></div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="header-greeting"><h1>Greetings, {member?.name?.split(' ')[0] || 'Member'}!</h1><p>Your CYP participation at a glance</p></div>
          <button className="header-user" onClick={() => setActiveMenu('profile')} aria-label="Open profile"><div className="user-avatar" style={member?.profileImageUrl ? { backgroundImage: `url(${API_BASE}${member.profileImageUrl})` } : undefined}>{!member?.profileImageUrl && (member?.name?.charAt(0)?.toUpperCase() || 'U')}</div></button>
        </header>

        {activeMenu === 'profile' && <section className="dashboard-section profile-grid">
          <div className="dashboard-card"><div className="section-heading"><p className="eyebrow">Member profile</p><h2>Your details</h2></div><form className="dashboard-form" onSubmit={updateProfile}><label>Profile picture<input type="file" accept="image/*" onChange={uploadAvatar} /></label><label>Full name<input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} /></label><label>Email<input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} /></label><label>Phone<input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} /></label><label>County<input value={profileForm.county} onChange={(e) => setProfileForm({ ...profileForm, county: e.target.value })} /></label><label>Constituency<input value={profileForm.constituency} onChange={(e) => setProfileForm({ ...profileForm, constituency: e.target.value })} /></label><label>Bio<textarea rows={3} value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} /></label><button className="primary-action">Save details</button></form></div>
          <div className="dashboard-card"><div className="section-heading"><p className="eyebrow">Account security</p><h2>Change password</h2></div><form className="dashboard-form" onSubmit={submitPassword}><label>Current password<input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} required /></label><label>New password<input type="password" value={passwordForm.next} onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })} required /></label><label>Confirm new password<input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} required /></label><button className="secondary-action">Update password</button></form>{profileMessage && <p className="inline-message">{profileMessage}</p>}</div>
        </section>}

  {activeMenu === 'events' && <section className="dashboard-section"><div className="section-heading"><p className="eyebrow">Participation</p><h2>Events and activities</h2><p>Events attended: {attendedCount}</p></div><div className="item-grid">{events.map((item) => <article className="dashboard-card" key={item.id || item.title}><h3>{item.title}</h3><p>{item.description || item.summary || 'Organization event'}</p><span className="muted-text">{formatDate(item.date || item.startsAt)} {item.location ? `• ${item.location}` : ''}</span></article>)}</div><div className="dashboard-card form-card"><h3>Submit another activity</h3><form className="dashboard-form" onSubmit={submitEvent}><label>Organization event<select required value={eventForm.eventId} onChange={(e) => setEventForm({ ...eventForm, eventId: e.target.value })}><option value="">Select an event</option>{events.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>Activity title<input required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} /></label><label>Description<textarea required rows={4} value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} /></label><label>Photo or document<input type="file" accept="image/*,.pdf,.doc,.docx" onChange={(e) => setEventForm({ ...eventForm, attachment: e.target.files?.[0] || null })} /></label><button className="primary-action">Submit for admin review</button></form>{eventMessage && <p className="inline-message">{eventMessage}</p>}</div></section>}

  {activeMenu === 'resources' && <section className="dashboard-section"><div className="section-heading"><p className="eyebrow">Knowledge centre</p><h2>Resources and published activity</h2><p>All organization resources available to you.</p></div><div className="item-grid">{resources.map((item, index) => <article className="dashboard-card" key={item.id || `${item.title}-${index}`}><p className="eyebrow">Resource</p><h3>{item.title}</h3><p>{item.description || item.content || 'Published CYP resource.'}</p>{item.fileUrl && <a className="text-link" href={item.fileUrl} target="_blank" rel="noreferrer">Open resource</a>}</article>)}</div></section>}
      {activeMenu === 'dashboard' && <div className="kpi-grid"><Kpi title="Events Attended" value={attendedCount} detail="From organization events" /><Kpi title="Published Data Read" value={publishedCount} detail="Published organization data" /><Kpi title="Community Score" value={stats.communityScore} detail={`${stats.communityServicesInitiated} services initiated`} /><Kpi title="Applications" value={applications.length} detail="Election participation" /></div>}

            {activeMenu === 'elections' && <section className="dashboard-section"><div className="section-heading"><p className="eyebrow">Election centre</p><h2>{activeElection?.title || 'Election dates and applications'}</h2><p>{activeElection ? `${formatDate(activeElection.startsAt)} - ${formatDate(activeElection.endsAt)}` : 'No election has been scheduled yet.'}</p></div><div className="election-summary-card"><h3>Application status</h3><p>{activeElection?.status === 'active' ? 'Applications are open. Election application form will appear here.' : `Applications are currently ${activeElection?.status || 'closed'}.`}</p><div className="application-list">{applications.length ? applications.map((application) => <div className="application-row" key={application.id}><span>{application.position?.title || 'Election application'}</span><strong className="status-badge">{application.status}</strong></div>) : <p className="muted-text">No application submitted for this election.</p>}</div></div>{activeElection && <LiveElection election={activeElection as any} />}</section>}

        {activeMenu === 'dashboard' && <section className="activity-section"><div className="activity-header"><div><h2>Recent Activity</h2><p>All actions recorded for your account</p></div></div><div className="activity-table"><table><thead><tr><th>Activity</th><th>Date</th><th>Status</th></tr></thead><tbody>{activity.length ? activity.map((item, index) => <tr key={`${item.label}-${index}`}><td>{item.label}</td><td>{formatDate(item.date)}</td><td><span className="status-badge">{item.status}</span></td></tr>) : <tr><td colSpan={3}>Your member activity will appear here as you participate.</td></tr>}</tbody></table></div></section>}

      </main>
    </div>
  )
}

function Kpi({ title, value, detail }: { title: string; value: number; detail: string }) { return <div className="kpi-card"><span className="kpi-title">{title}</span><div className="kpi-value">{value}</div><span className="progress-label">{detail}</span></div> }
