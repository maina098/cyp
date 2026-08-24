'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import './admin.css'
import {
  BlogPost,
  MemberApplication,
  MemberRecord,
  createBlogPost,
  getStoredApplications,
  getStoredBlogPosts,
  getStoredMembers,
  persistApplications,
  persistBlogPosts,
  persistMembers,
} from '@/lib/content-store'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

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
  const [applications, setApplications] = useState<MemberApplication[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [elections, setElections] = useState<ElectionRecord[]>([])
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

    const loadElections = async () => {
      try {
        const response = await fetch(`${API_BASE}/elections`, { headers: { Authorization: `Bearer ${token}` } })
        if (response.ok) {
          const data = await response.json()
          setElections(Array.isArray(data) ? data : [])
          if (Array.isArray(data) && data[0]) {
            setSelectedElectionId(data[0].id)
            setElectionStatus(data[0].status === 'active' ? 'open' : data[0].status === 'closed' ? 'closed' : 'draft')
          }
        }
      } catch {
        // ignore admin election load errors
      }
    }

    setMembers(getStoredMembers())
    setApplications(getStoredApplications())
    setBlogPosts(getStoredBlogPosts())
    loadElections()
    setLoading(false)
  }, [router])

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

  const updateApplicationStatus = (applicationId: string, status: MemberApplication['status']) => {
    const updatedApplications = applications.map((application) => application.id === applicationId ? { ...application, status } : application)
    setApplications(updatedApplications)
    persistApplications(updatedApplications)
  }

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
      await fetch(`${API_BASE}/elections/${selectedElectionId}/status`, {
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
              <div className="kpi-card"><div className="kpi-header"><span className="kpi-title">Pending Applications</span><div className="kpi-icon news-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div></div><div className="kpi-value">{applications.filter((app) => app.status === 'pending').length}</div><div className="kpi-progress"><div className="progress-bar"><div className="progress-fill" style={{ width: '68%' }} /></div><span className="progress-label">Needs review</span></div></div>
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
            <div className="panel-header"><h2>Member Applications</h2><span>{applications.length} submissions</span></div>
            <div className="application-list">
              {applications.map((application) => (
                <div key={application.id} className="application-card">
                  <div className="application-meta"><strong>{application.name}</strong><span>{application.email}</span></div>
                  <p>{application.message}</p>
                  <div className="application-footer">
                    <span className={`status-pill ${application.status}`}>{application.status}</span>
                    <span>{application.submittedAt}</span>
                  </div>
                  <div className="application-actions">
                    <button className="accept-btn" onClick={() => updateApplicationStatus(application.id, 'approved')}>Approve</button>
                    <button className="reject-btn" onClick={() => updateApplicationStatus(application.id, 'rejected')}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
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
                        <div key={result?.id || Math.random()} className="result-row">
                          <span>{result?.candidate?.name || `Candidate (${result?.candidateId || 'Unknown'})`}</span>
                          <strong>{result?.voteCount || 0} votes</strong>
                        </div>
                      ))
                  ) : (
                    <p>No votes yet.</p>
                  )}
                </div>
              ) : <p>No election selected.</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
