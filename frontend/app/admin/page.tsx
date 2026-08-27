'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import './admin.css'
import {
  BlogPost,
  MemberRecord,
  createBlogPost,
  getStoredBlogPosts,
  getStoredMembers,
  persistBlogPosts,
  persistMembers,
} from '@/lib/content-store'
import { API_BASE } from '@/lib/api-base'
import { WS_BASE } from '@/lib/api-base'
import { io } from 'socket.io-client'
import { AdminEvent, AdminResource, ElectionApplication, approveElectionApplication, createAdminEvent, createAdminResource, deleteAdminEvent, deleteAdminResource, getAdminApplications, getAdminEvents, getAdminResources, getElections, getSystemHealth, rejectElectionApplication, updateApplicationStatus as updateElectionApplicationStatus, uploadAdminResource } from '@/lib/api'

type ElectionRecord = {
  id: string
  title: string
  description?: string | null
  status: 'draft' | 'scheduled' | 'active' | 'closed'
  startsAt: string
  endsAt: string
  candidates: Array<{ id: string; name: string; bio?: string | null; position?: number }>
  electionResults?: Array<{ id: string; candidateId: string; voteCount: number; candidate?: { name: string } }>
}

type User = {
  id: string
  email: string
  name: string
  role: string
}

type ElectionStatus = 'draft' | 'open' | 'closed'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<MemberRecord[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [elections, setElections] = useState<ElectionRecord[]>([])
  const [liveApplications, setLiveApplications] = useState<ElectionApplication[]>([])
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [resources, setResources] = useState<AdminResource[]>([])
  const [health, setHealth] = useState<{ ok: boolean; data: any } | null>(null)
  const [eventForm, setEventForm] = useState({ title: '', description: '', location: '', date: '', status: 'UPCOMING' })
  const [resourceForm, setResourceForm] = useState({ title: '', description: '', file: null as File | null, category: 'Reports' })
  const [selectedElectionId, setSelectedElectionId] = useState<string>('')
  const [electionStatus, setElectionStatus] = useState<ElectionStatus>('open')
  const [blogForm, setBlogForm] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'News',
    author: 'Admin Team',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token) {
      router.push('/signin')
      return
    }

    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        const isAdmin = parsed.role?.toUpperCase() === 'ADMIN'
        if (!isAdmin) {
          router.push('/dashboard')
          return
        }
        setUser(parsed)
      } catch {
        // Invalid user data
      }
    }

    const loadLiveData = async () => {
      try {
        const [electionResult, applicationResult, eventResult, resourceResult, healthResult] = await Promise.allSettled([
          getElections(), getAdminApplications(token), getAdminEvents(token), getAdminResources(token), getSystemHealth(),
        ])
        const electionData = electionResult.status === 'fulfilled' ? electionResult.value : []
        const applicationData = applicationResult.status === 'fulfilled' ? applicationResult.value : []
        const eventData = eventResult.status === 'fulfilled' ? eventResult.value : []
        const resourceData = resourceResult.status === 'fulfilled' ? resourceResult.value : []
        const healthData = healthResult.status === 'fulfilled' ? healthResult.value : { ok: false, data: null }
        setElections(electionData as ElectionRecord[])
        setLiveApplications(applicationData)
        setEvents(eventData)
        setResources(resourceData)
        setHealth(healthData)
        if (electionData[0]) {
          setSelectedElectionId((current) => current || electionData[0].id)
          setElectionStatus(electionData[0].status === 'active' ? 'open' : electionData[0].status === 'closed' ? 'closed' : 'draft')
        }
      } catch {
        setHealth({ ok: false, data: null })
      }
    }

    setMembers(getStoredMembers())
    setBlogPosts(getStoredBlogPosts())
    loadLiveData()
    const refreshTimer = window.setInterval(loadLiveData, 15000)
    setLoading(false)
    return () => window.clearInterval(refreshTimer)
  }, [router])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !selectedElectionId) return
    const socket = io(`${WS_BASE}/results`, { transports: ['websocket'], auth: { token } })
    const refreshElections = () => getElections().then((data) => setElections(data as ElectionRecord[]))
    socket.on('connect', () => {
      socket.emit('subscribeElection', selectedElectionId)
      socket.emit('subscribeApplications', selectedElectionId)
    })
    socket.on('newApplication', (payload) => {
      if (payload?.application?.electionId === selectedElectionId) setLiveApplications((current) => [payload.application, ...current.filter((item) => item.id !== payload.application.id)])
    })
    socket.on('applicationStatusUpdate', (payload) => {
      if (payload?.application) setLiveApplications((current) => current.map((item) => item.id === payload.application.id ? payload.application : item))
    })
    socket.on('resultsUpdate', refreshElections)
    socket.on('voteCasted', refreshElections)
    socket.on('statusUpdate', refreshElections)
    return () => { socket.disconnect() }
  }, [selectedElectionId])

  const memberStats = useMemo(() => ({
    total: members.length,
    active: members.filter((member) => member.status === 'active').length,
    pending: members.filter((member) => member.status === 'pending').length,
    suspended: members.filter((member) => member.status === 'suspended').length,
  }), [members])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/signin')
  }

  const deleteMember = (memberId: string) => {
    const updatedMembers = members.filter((member) => member.id !== memberId)
    setMembers(updatedMembers)
    persistMembers(updatedMembers)
  }

  const updateMemberStatus = (memberId: string, status: MemberRecord['status']) => {
    const updatedMembers = members.map((member) => member.id === memberId ? { ...member, status } : member)
    setMembers(updatedMembers)
    persistMembers(updatedMembers)
  }

  const updateApplicationStatus = async (applicationId: string, status: ElectionApplication['status']) => {
    const token = localStorage.getItem('token')
    if (!token) return
    const application = liveApplications.find((item) => item.id === applicationId)
    if (!application) return
    const result = status === 'approved'
      ? await approveElectionApplication(token, application.electionId, applicationId)
      : status === 'rejected'
        ? await rejectElectionApplication(token, application.electionId, applicationId)
        : await updateElectionApplicationStatus(token, applicationId, status)
    if (result.success && result.data) setLiveApplications((current) => current.map((item) => item.id === applicationId ? result.data! : item))
  }

  const addEvent = async () => {
    const token = localStorage.getItem('token')
    if (!token || !eventForm.title || !eventForm.date) return
    const created = await createAdminEvent(token, eventForm)
    if (created) { setEvents((current) => [...current, created].sort((a, b) => a.date.localeCompare(b.date))); setEventForm({ title: '', description: '', location: '', date: '', status: 'UPCOMING' }) }
  }

  const addResource = async () => {
    const token = localStorage.getItem('token')
    if (!token || !resourceForm.title || !resourceForm.file) return
    const uploaded = await uploadAdminResource(token, resourceForm.file)
    const created = uploaded ? await createAdminResource(token, { title: resourceForm.title, description: resourceForm.description, fileUrl: uploaded.url, category: resourceForm.category }) : null
    if (created) { setResources((current) => [created, ...current]); setResourceForm({ title: '', description: '', file: null, category: 'Reports' }) }
  }

  const removeEvent = async (id: string) => { const token = localStorage.getItem('token'); if (token && await deleteAdminEvent(token, id)) setEvents((current) => current.filter((item) => item.id !== id)) }
  const removeResource = async (id: string) => { const token = localStorage.getItem('token'); if (token && await deleteAdminResource(token, id)) setResources((current) => current.filter((item) => item.id !== id)) }

  const handlePublishBlog = () => {
    if (!blogForm.title.trim() || !blogForm.content.trim()) {
      return
    }

    const newPost = createBlogPost({
      title: blogForm.title.trim(),
      summary: blogForm.summary.trim() || blogForm.content.trim().slice(0, 140),
      content: blogForm.content.trim(),
      category: blogForm.category,
      author: blogForm.author.trim() || 'Admin Team',
    })

    const updatedPosts = [newPost, ...blogPosts]
    setBlogPosts(updatedPosts)
    persistBlogPosts(updatedPosts)
    setBlogForm({ title: '', summary: '', content: '', category: 'News', author: 'Admin Team' })
    setActiveMenu('news')
  }

  const handleElectionAction = async (nextStatus: ElectionStatus) => {
    if (!selectedElectionId) return

    setElectionStatus(nextStatus)
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      await fetch(`${API_BASE}/elections/${selectedElectionId}/transition-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus === 'open' ? 'active' : nextStatus }),
      })
    } catch {
      // ignore status sync errors
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">CYP</div>
          <span className="brand-text">Admin Panel</span>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className={`nav-link ${activeMenu === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveMenu('dashboard'); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Dashboard
          </a>
          <a href="#" className={`nav-link ${activeMenu === 'members' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveMenu('members'); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Members
          </a>
          <a href="#" className={`nav-link ${activeMenu === 'applications' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveMenu('applications'); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Applications
          </a>
          <a href="#" className={`nav-link ${activeMenu === 'news' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveMenu('news'); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Blog Publisher
          </a>
          <a href="#" className={`nav-link ${activeMenu === 'elections' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveMenu('elections'); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Elections
          </a>
          <a href="#" className={`nav-link ${activeMenu === 'events' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveMenu('events'); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Events
          </a>
          <a href="#" className={`nav-link ${activeMenu === 'resources' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveMenu('resources'); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            Resources
          </a>
          <a href="#" className={`nav-link ${activeMenu === 'settings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveMenu('settings'); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Settings
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="header-greeting">
            <h1>Admin Dashboard</h1>
            <p>Manage CYP platform content and users</p>
          </div>
          <div className="header-user">
            <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
          </div>
        </header>

        {activeMenu === 'dashboard' && (
          <>
            <div className="kpi-grid">
              <div className="kpi-card"><div className="kpi-header"><span className="kpi-title">Total Members</span><div className="kpi-icon users-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div></div><div className="kpi-value">{memberStats.total}</div><div className="kpi-progress"><div className="progress-bar"><div className="progress-fill" style={{ width: '100%' }} /></div><span className="progress-label">{memberStats.active} active members</span></div></div>
              <div className="kpi-card"><div className="kpi-header"><span className="kpi-title">Pending Applications</span><div className="kpi-icon news-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div></div><div className="kpi-value">{liveApplications.filter((app) => app.status === 'pending').length}</div><div className="kpi-progress"><div className="progress-bar"><div className="progress-fill" style={{ width: '68%' }} /></div><span className="progress-label">Live from database</span></div></div>
              <div className="kpi-card"><div className="kpi-header"><span className="kpi-title">Election Status</span><div className="kpi-icon events-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div></div><div className="kpi-value" style={{ textTransform: 'capitalize' }}>{electionStatus}</div><div className="kpi-progress"><div className="progress-bar"><div className="progress-fill" style={{ width: electionStatus === 'open' ? '92%' : electionStatus === 'draft' ? '48%' : '100%' }} /></div><span className="progress-label">{electionStatus === 'open' ? 'Voting active' : electionStatus === 'draft' ? 'Preparing cycle' : 'Closed for this cycle'}</span></div></div>
              <div className="kpi-card"><div className="kpi-header"><span className="kpi-title">Published Blog Posts</span><div className="kpi-icon resources-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div></div><div className="kpi-value">{blogPosts.length}</div><div className="kpi-progress"><div className="progress-bar"><div className="progress-fill" style={{ width: '82%' }} /></div><span className="progress-label">Synced to frontend</span></div></div>
            </div>

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="actions-grid">
                <button className="action-btn" onClick={() => setActiveMenu('news')}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Publish blog</button>
                <button className="action-btn" onClick={() => setActiveMenu('members')}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Review members</button>
                <button className="action-btn" onClick={() => setActiveMenu('applications')}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Approve applications</button>
                <button className="action-btn" onClick={() => setActiveMenu('elections')}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Moderate election</button>
              </div>
            </div>

            <div className="activity-section">
              <div className="activity-header"><div><h2>Recent Platform Activity</h2><p>Latest changes and updates</p></div><select className="time-filter"><option>Last 7 days</option><option>Last 30 days</option><option>All time</option></select></div>
              <div className="activity-table"><table><thead><tr><th>Action</th><th>User</th><th>Date</th><th>Status</th></tr></thead><tbody><tr><td>Created news: "JKP Launches Blueprint 2030"</td><td>Admin</td><td>Aug 15, 2026</td><td><span className="status-badge published">Published</span></td></tr><tr><td>Updated event: "CYP Elections"</td><td>Admin</td><td>Aug 14, 2026</td><td><span className="status-badge updated">Updated</span></td></tr><tr><td>Uploaded resource: "Economic Blueprint PDF"</td><td>Admin</td><td>Aug 13, 2026</td><td><span className="status-badge published">Published</span></td></tr><tr><td>New member application: john@example.com</td><td>System</td><td>Aug 12, 2026</td><td><span className="status-badge pending">Pending</span></td></tr></tbody></table></div>
            </div>
          </>
        )}

        {activeMenu === 'members' && (
          <div className="panel-card">
            <div className="panel-header"><h2>System Members</h2><span>{memberStats.total} records</span></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.email}</td>
                      <td>{member.role}</td>
                      <td><span className={`status-pill ${member.status}`}>{member.status}</span></td>
                      <td className="action-cell">
                        <select value={member.status} onChange={(e) => updateMemberStatus(member.id, e.target.value as MemberRecord['status'])}>
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="suspended">Suspended</option>
                        </select>
                        <button className="danger-btn" onClick={() => deleteMember(member.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'applications' && (
          <div className="panel-card">
            <div className="panel-header"><h2>Member Applications</h2><span>{liveApplications.length} live submissions</span></div>
            <div className="application-list">
              {liveApplications.map((application) => (
                <div key={application.id} className="application-card">
                  <div className="application-meta"><strong>{application.name}</strong><span>{application.email}</span></div>
                  <p>{application.description}</p>
                  <div className="application-footer">
                    <span className={`status-pill ${application.status}`}>{application.status}</span>
                    <span>{new Date(application.appliedAt).toLocaleString()}</span>
                  </div>
                  <div className="application-actions">
                    <button className="accept-btn" onClick={() => updateApplicationStatus(application.id, 'approved')}>Approve</button>
                    <button className="reject-btn" onClick={() => updateApplicationStatus(application.id, 'rejected')}>Reject</button>
                  </div>
                </div>
              ))}
              {!liveApplications.length && <p className="empty-state">No applications have been submitted.</p>}
            </div>
          </div>
        )}

        {activeMenu === 'events' && (
          <div className="panel-card">
            <div className="panel-header"><h2>Upcoming Events</h2><span>{events.length} live records</span></div>
            <div className="blog-editor">
              <div className="field-row"><label>Title<input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} /></label></div>
              <div className="field-row"><label>Description<textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} rows={3} /></label></div>
              <div className="field-row"><label>Location<input value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} /></label></div>
              <div className="field-row"><label>Date and time<input type="datetime-local" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} /></label></div>
              <button className="publish-btn" onClick={addEvent}>Add event</button>
            </div>
            <div className="published-posts">
              {events.map((event) => <article key={event.id} className="post-card"><div className="post-head"><strong>{event.title}</strong><span>{event.status}</span></div><p>{event.description}</p><small>{new Date(event.date).toLocaleString()} · {event.location}</small><button className="danger-btn" onClick={() => removeEvent(event.id)}>Delete event</button></article>)}
            </div>
          </div>
        )}

        {activeMenu === 'resources' && (
          <div className="panel-card">
            <div className="panel-header"><h2>Resource Library</h2><span>{resources.length} live records</span></div>
            <div className="blog-editor">
              <div className="field-row"><label>Title<input value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} /></label></div>
              <div className="field-row"><label>Description<textarea value={resourceForm.description} onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })} rows={3} /></label></div>
              <div className="field-row"><label>Category<input value={resourceForm.category} onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })} /></label></div>
              <div className="field-row"><label>Upload media<input type="file" accept="image/*,.pdf,.doc,.docx,.mp4" onChange={(e) => setResourceForm({ ...resourceForm, file: e.target.files?.[0] || null })} /></label></div>
              <button className="publish-btn" onClick={addResource}>Add resource</button>
            </div>
            <div className="published-posts">
              {resources.map((resource) => <article key={resource.id} className="post-card"><div className="post-head"><strong>{resource.title}</strong><span>{resource.category}</span></div><p>{resource.description || 'No description provided.'}</p><a className="text-link" href={resource.fileUrl.startsWith('http') ? resource.fileUrl : `${API_BASE}${resource.fileUrl}`} target="_blank" rel="noreferrer">Preview media</a><button className="danger-btn" onClick={() => removeResource(resource.id)}>Delete resource</button></article>)}
            </div>
          </div>
        )}

        {activeMenu === 'settings' && (
          <div className="panel-card">
            <div className="panel-header"><h2>System Settings and Health</h2><span>Checked {health ? 'just now' : 'pending'}</span></div>
            <div className="election-status-box"><span className="status-label">API health</span><strong className="status-value">{health?.ok ? 'Healthy' : 'Unavailable'}</strong><p>{health?.ok ? 'Memory and disk probes are responding.' : 'The health endpoint could not be reached. Check the backend URL, server logs, and database connection.'}</p></div>
            <div className="moderator-notes"><h3>Admin operations guide</h3><ul><li>Keep elections in draft until positions and candidates are ready.</li><li>Open applications before inviting members to apply.</li><li>Open voting only after approved applications have become candidates.</li><li>Use this health status and the browser network log to investigate failed API calls.</li></ul></div>
          </div>
        )}

        {activeMenu === 'news' && (
          <div className="panel-card">
            <div className="panel-header"><h2>Publish Blog / Update Frontend</h2><span>Live sync to public site</span></div>
            <div className="blog-editor">
              <div className="field-row"><label>Title<input value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} placeholder="Headline or title" /></label></div>
              <div className="field-row"><label>Summary<textarea value={blogForm.summary} onChange={(e) => setBlogForm({ ...blogForm, summary: e.target.value })} placeholder="Short summary for the homepage and cards" /></label></div>
              <div className="field-row"><label>Category<select value={blogForm.category} onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}><option>News</option><option>Announcement</option><option>Insight</option><option>Editorial</option></select></label></div>
              <div className="field-row"><label>Author<input value={blogForm.author} onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })} placeholder="Author name" /></label></div>
              <div className="field-row"><label>Content<textarea value={blogForm.content} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} placeholder="Full article content" rows={8} /></label></div>
              <button className="publish-btn" onClick={handlePublishBlog}>Publish to frontend</button>
            </div>

            <div className="published-posts">
              <h3>Published content</h3>
              {blogPosts.map((post) => (
                <article key={post.id} className="post-card">
                  <div className="post-head"><strong>{post.title}</strong><span>{post.category}</span></div>
                  <p>{post.summary}</p>
                  <small>{post.author} · {post.publishedAt}</small>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeMenu === 'elections' && (
          <div className="panel-card">
            <div className="panel-header"><h2>Election Moderation</h2><span>Control the live election cycle</span></div>
            <div className="election-controls">
              <div className="field-row">
                <label htmlFor="election-select">Election</label>
                <select id="election-select" value={selectedElectionId} onChange={(e) => setSelectedElectionId(e.target.value)}>
                  {elections.length === 0 ? <option value="">No elections yet</option> : elections.map((item) => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                  ))}
                </select>
              </div>
              <div className="election-status-box">
                <span className="status-label">Current state</span>
                <strong className="status-value">{electionStatus}</strong>
              </div>
              <div className="toggle-row">
                <button className={electionStatus === 'draft' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => handleElectionAction('draft')}>Draft</button>
                <button className={electionStatus === 'open' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => handleElectionAction('open')}>Open</button>
                <button className={electionStatus === 'closed' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => handleElectionAction('closed')}>Closed</button>
              </div>
            </div>
            <div className="moderator-notes">
              <h3>Live results</h3>
              {selectedElectionId ? (
                <div className="election-results-list">
                  {elections
                    .find((item) => item.id === selectedElectionId)?.electionResults?.length ? (
                    elections
                      .find((item) => item.id === selectedElectionId)
                      ?.electionResults?.slice()
                      ?.sort((a, b) => (b?.voteCount || 0) - (a?.voteCount || 0))
                      ?.map((result) => (
                        <div key={result?.id || result?.candidateId} className="result-row">
                          <span>{result?.candidate?.name || elections.find((item) => item.id === selectedElectionId)?.candidates?.find((candidate: any) => candidate.id === result?.candidateId)?.name || `Candidate (${result?.candidateId || 'Unknown'})`}</span>
                          <strong>{result?.voteCount || 0} votes</strong>
                        </div>
                      ))
                  ) : (
                    <p>No votes yet.</p>
                  )}
                </div>
              ) : <p>No election selected.</p>}
              <h3>Approved applicants</h3>
              {liveApplications.filter((application) => application.electionId === selectedElectionId && application.status === 'approved').length ? liveApplications.filter((application) => application.electionId === selectedElectionId && application.status === 'approved').map((application) => <div className="result-row" key={application.id}><span>{application.name} · {application.email}</span><strong>{application.position?.title || 'Approved candidate'}</strong></div>) : <p>No approved applicants for this election.</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
