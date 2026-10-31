import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchIssueTypes, deleteIssueFromDatabase } from '../services/issueTypeService'
import { ReportProblemModal } from './ReportProblemModal'

export const UserSelfComplain = ({ user }) => {
  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_complaints')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterCategory, setFilterCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [noticeMessage, setNoticeMessage] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [viewScope, setViewScope] = useState('mine') // 'mine' or 'all'

  // Resolve current active user
  const currentUser = user || JSON.parse(localStorage.getItem('currentUser') || 'null') || {
    name: 'Citizen',
    email: '',
    city: 'Municipal Area',
  }

  // Fetch latest complaints from database
  const loadComplaints = async () => {
    setIsLoading(true)
    try {
      const data = await fetchIssueTypes()
      if (data && Array.isArray(data)) {
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setComplaints(sorted)
        localStorage.setItem('civic_complaints', JSON.stringify(sorted))
      }
    } catch (err) {
      console.error('Failed to load user complaints:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadComplaints()
  }, [])

  // Listen for real-time events
  useEffect(() => {
    const handleCreated = (e) => {
      if (e.detail) {
        setComplaints((prev) => {
          const id = e.detail._id || e.detail.id
          if (id && prev.some((c) => (c._id && c._id === id) || (c.id && c.id === id))) {
            return prev
          }
          return [e.detail, ...prev]
        })
      }
    }

    const handleDeleted = (e) => {
      if (e.detail?.id) {
        const deletedId = e.detail.id
        setComplaints((prev) =>
          prev.filter(
            (c) =>
              (c._id ? c._id !== deletedId : true) &&
              (c.id ? c.id !== deletedId : true)
          )
        )
      }
    }

    window.addEventListener('complaint-submitted', handleCreated)
    window.addEventListener('complaint-deleted', handleDeleted)
    return () => {
      window.removeEventListener('complaint-submitted', handleCreated)
      window.removeEventListener('complaint-deleted', handleDeleted)
    }
  }, [])

  // Check if a complaint was filed by the current user
  const isOwner = (item) => {
    const uEmail = (currentUser?.email || '').trim().toLowerCase()
    const uName = (currentUser?.name || '').trim().toLowerCase()
    const uContact = String(currentUser?.contact || '').trim()
    const cEmail = (item.userEmail || '').trim().toLowerCase()
    const cName = (item.reportedBy || '').trim().toLowerCase()
    const cContact = String(item.userContact || '').trim()

    if (uEmail && cEmail && uEmail === cEmail) return true
    if (uContact && cContact && uContact === cContact) return true
    if (uName && cName && uName === cName) return true
    return false
  }

  // Filter complaints belonging to this user
  const userComplaints = complaints.filter(isOwner)

  // Scope determines whether we show user's own complaints or all
  const scopedComplaints = viewScope === 'mine' ? userComplaints : complaints

  // Status and Category options
  const statusOptions = ['All', 'Pending Verification', 'Under Review', 'In Progress', 'Resolved']
  const categoryOptions = ['All', 'Road Damage', 'Garbage', 'Street Light', 'Water Supply', 'Drainage']

  // Filtered dataset
  const filtered = scopedComplaints.filter((c) => {
    const statusMatch =
      filterStatus === 'All' ||
      (c.status || '').trim().toLowerCase() === filterStatus.trim().toLowerCase()

    const catMatch =
      filterCategory === 'All' ||
      (c.category || '').trim().toLowerCase() === filterCategory.trim().toLowerCase()

    const q = searchQuery.trim().toLowerCase()
    const searchMatch =
      !q ||
      (c.subProblem && c.subProblem.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.location && c.location.toLowerCase().includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q))

    return statusMatch && catMatch && searchMatch
  })

  // Statistics calculation for user's complaints
  const totalUserCount = userComplaints.length
  const pendingCount = userComplaints.filter(
    (c) => (c.status || '').toLowerCase().includes('pending')
  ).length
  const inProgressCount = userComplaints.filter(
    (c) =>
      (c.status || '').toLowerCase().includes('progress') ||
      (c.status || '').toLowerCase().includes('review')
  ).length
  const resolvedCount = userComplaints.filter(
    (c) => (c.status || '').toLowerCase().includes('resolved')
  ).length

  // Delete problem handler
  const handleDelete = async (item) => {
    const itemId = item._id || item.id
    const confirmMessage = `Are you sure you want to delete this problem statement (#${item.id || itemId})?\n\n"${item.subProblem || 'Complaint'}" will be permanently removed from the ledger and the database.`
    if (!window.confirm(confirmMessage)) return

    try {
      setDeletingId(itemId)
      const res = await deleteIssueFromDatabase(itemId)
      if (!res.success) {
        console.warn('Backend delete response warning:', res.error)
      }

      setComplaints((prev) => {
        const updated = prev.filter(
          (c) =>
            (c._id ? c._id !== itemId : true) &&
            (c.id ? c.id !== itemId : true) &&
            c.id !== item.id &&
            c._id !== item._id
        )
        try {
          localStorage.setItem('civic_complaints', JSON.stringify(updated))
        } catch (e) {
          console.error(e)
        }
        return updated
      })

      window.dispatchEvent(
        new CustomEvent('complaint-deleted', { detail: { id: itemId, complaint: item } })
      )

      setNoticeMessage('Your problem statement has been deleted successfully.')
      setTimeout(() => setNoticeMessage(''), 4000)
    } catch (err) {
      console.error('Delete error:', err)
      alert(`Could not delete complaint: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Road Damage':
        return '🚧'
      case 'Garbage':
        return '🗑️'
      case 'Street Light':
        return '💡'
      case 'Water Supply':
        return '💧'
      case 'Drainage':
        return '🌊'
      default:
        return '📌'
    }
  }

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase()
    if (s.includes('resolved')) {
      return <span className="status-pill pill-resolved">✓ Resolved</span>
    }
    if (s.includes('progress')) {
      return <span className="status-pill pill-progress">⚡ In Progress</span>
    }
    if (s.includes('review')) {
      return <span className="status-pill pill-review">🔍 Under Review</span>
    }
    return <span className="status-pill pill-pending">⏱️ Pending Verification</span>
  }

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return <span className="urgency-pill pill-critical">● Critical</span>
      case 'High':
        return <span className="urgency-pill pill-high">● High</span>
      case 'Medium':
        return <span className="urgency-pill pill-medium">● Medium</span>
      default:
        return <span className="urgency-pill pill-low">● Low</span>
    }
  }

  // Get active step index (0 to 3) for status pipeline stepper
  const getStatusStepIndex = (status) => {
    const s = (status || '').toLowerCase()
    if (s.includes('resolved')) return 3
    if (s.includes('progress')) return 2
    if (s.includes('review')) return 1
    return 0 // Pending
  }

  return (
    <div className="civic-home-container self-complaints-page">
      {/* Page Header Banner */}
      <div className="hero-banner civic-hero self-hero">
        <div className="hero-content">
          <div className="hero-badge-row">
            <span className="badge badge-primary">👤 Resident Grievance Dashboard</span>
            <span className="badge badge-success">● Citizen Redressal ID: {currentUser.name}</span>
          </div>

          <h1 className="hero-title">
            My <span className="gradient-text">Complaints</span> & Tracking
          </h1>

          <p className="hero-subtitle">
            View real-time resolution lifecycle, official updates, and municipal dispatch status for all issues registered under your account.
          </p>

          <div className="hero-actions-row">
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
              <span>+ File New Complaint</span>
            </button>
            <Link to="/home" className="btn btn-secondary">
              <span>🏛️ Return to Civic Dashboard</span>
            </Link>
          </div>
        </div>

        {/* User Grievances Status Overview Pills */}
        <div className="hero-stat-pill-group">
          <div className="hero-stat-pill">
            <span className="hero-pill-num">{totalUserCount}</span>
            <span className="hero-pill-lbl">My Total Filed</span>
          </div>
          <div className="hero-stat-pill">
            <span className="hero-pill-num" style={{ color: '#10b981' }}>{resolvedCount}</span>
            <span className="hero-pill-lbl">Resolved Issues</span>
          </div>
        </div>
      </div>

      {/* Delete / Success Notice Toast */}
      {noticeMessage && (
        <div className="alert-box alert-success" style={{ animation: 'slideDown 0.3s ease-out' }}>
          <span>✓</span>
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Real-time Status Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            📝
          </div>
          <div className="stat-value">{totalUserCount}</div>
          <div className="stat-label">Total Complaints Logged by You</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fda4af' }}>
            ⏱️
          </div>
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-label">Awaiting Municipal Verification</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            ⚡
          </div>
          <div className="stat-value">{inProgressCount}</div>
          <div className="stat-label">Under Review / Crew Dispatched</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            ✅
          </div>
          <div className="stat-value">{resolvedCount}</div>
          <div className="stat-label">Resolved & Fixed</div>
        </div>
      </div>

      {/* View Scope Tabs (My Complaints vs All Municipal Ledger) */}
      {/* <div className="self-scope-toggle-bar">
        <div className="scope-tabs-group">
          <button
            type="button"
            className={`scope-tab-btn ${viewScope === 'mine' ? 'active' : ''}`}
            onClick={() => setViewScope('mine')}
          >
            <span>👤 My Complaints ({totalUserCount})</span>
          </button>
          <button
            type="button"
            className={`scope-tab-btn ${viewScope === 'all' ? 'active' : ''}`}
            onClick={() => setViewScope('all')}
          >
            <span>🌐 All Public Issues ({complaints.length})</span>
          </button>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={loadComplaints}
          disabled={isLoading}
          title="Refresh complaints from database"
        >
          <span>{isLoading ? '🔄 Syncing...' : '🔄 Refresh Data'}</span>
        </button>
      </div> */}

      {/* Filters & Search Controls */}
      <div className="self-filters-container">
        {/* Status Filter Chips */}
        <div className="filter-group-block">
          <span className="filter-group-title">Filter by Status:</span>
          <div className="filter-category-scroll">
            {statusOptions.map((st) => (
              <button
                key={st}
                type="button"
                className={`cat-filter-chip ${filterStatus === st ? 'active' : ''}`}
                onClick={() => setFilterStatus(st)}
              >
                <span>{filterStatus === st ? '●' : '○'}</span>
                <span>{st}</span>
                <span className="count-pill">
                  {st === 'All'
                    ? scopedComplaints.length
                    : scopedComplaints.filter(
                        (c) => (c.status || '').trim().toLowerCase() === st.trim().toLowerCase()
                      ).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="filter-group-block">
          <span className="filter-group-title">Filter by Category:</span>
          <div className="filter-category-scroll">
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`cat-filter-chip ${filterCategory === cat ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                <span>{cat !== 'All' ? getCategoryIcon(cat) : '✨'}</span>
                <span>{cat}</span>
                <span className="count-pill">
                  {cat === 'All'
                    ? scopedComplaints.length
                    : scopedComplaints.filter(
                        (c) => (c.category || '').trim().toLowerCase() === cat.trim().toLowerCase()
                      ).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="complaint-search-box self-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, sub-problem, location, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Complaints List / Cards */}
      <div className="self-complaints-list-wrapper">
        {filtered.length === 0 ? (
          <div className="empty-complaints-card">
            <div className="empty-icon">{viewScope === 'mine' ? '📝' : '📂'}</div>
            <h3>
              {viewScope === 'mine'
                ? totalUserCount === 0
                  ? "You haven't filed any complaints yet"
                  : 'No complaints match your current filters'
                : 'No public grievances found'}
            </h3>
            <p>
              {viewScope === 'mine' && totalUserCount === 0
                ? 'Report an infrastructure issue in your locality and track its real-time municipal resolution.'
                : 'Try adjusting your search query, status, or category filter.'}
            </p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '1.25rem' }}
              onClick={() => setModalOpen(true)}
            >
              <span>+ File A Complaint Now</span>
            </button>
          </div>
        ) : (
          <div className="self-complaints-grid">
            {filtered.map((item) => {
              const itemId = item._id || item.id
              const isDeleting = deletingId === itemId
              const currentStep = getStatusStepIndex(item.status)

              return (
                <div key={itemId} className="self-complaint-card">
                  {/* Card Header with ID, Date, and Badges */}
                  <div className="complaint-card-top">
                    <div className="complaint-id-meta">
                      <span className="complaint-id-tag">#{item.id || item._id}</span>
                      <span className="complaint-time">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Recent'}
                      </span>
                    </div>

                    <div className="complaint-status-wrap">
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  {/* Title & Category Info */}
                  <div className="complaint-title-block">
                    <div className="complaint-icon-badge">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <h3 className="self-card-subproblem">{item.subProblem}</h3>
                      <div className="complaint-cat-label">
                        Category: <strong>{item.category}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Status Lifecycle Progress Stepper */}
                  <div className="status-lifecycle-track">
                    <div className="track-step-label-row">
                      <span className="track-section-label">Municipal Redressal Pipeline:</span>
                      <span className="track-current-status-name">
                        Stage: <strong>{item.status || 'Pending Verification'}</strong>
                      </span>
                    </div>

                    <div className="stepper-horizontal">
                      {[
                        { num: 1, label: 'Submitted' },
                        { num: 2, label: 'Reviewed' },
                        { num: 3, label: 'Dispatched' },
                        { num: 4, label: 'Resolved' },
                      ].map((step, idx) => {
                        const isDone = currentStep > idx
                        const isCurrent = currentStep === idx
                        return (
                          <React.Fragment key={step.num}>
                            <div
                              className={`stepper-node ${isDone ? 'step-done' : ''} ${
                                isCurrent ? 'step-current' : ''
                              }`}
                            >
                              <div className="node-circle">
                                {isDone ? '✓' : step.num}
                              </div>
                              <span className="node-label">{step.label}</span>
                            </div>
                            {idx < 3 && (
                              <div
                                className={`stepper-connector ${
                                  currentStep > idx ? 'connector-done' : ''
                                }`}
                              />
                            )}
                          </React.Fragment>
                        )
                      })}
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="self-desc-box">
                    <div className="desc-heading">Problem Statement:</div>
                    <p className="complaint-desc self-complaint-desc">{item.description}</p>
                  </div>

                  {/* Location & Landmark Information */}
                  <div className="complaint-location-box">
                    <span className="loc-icon">📍</span>
                    <span className="loc-text">{item.location}</span>
                    {item.landmark && <span className="loc-landmark">• Ref: {item.landmark}</span>}
                    {item.city && <span className="loc-city">({item.city})</span>}
                  </div>

                  {/* Card Footer with Reporter Meta & Actions */}
                  <div className="complaint-card-footer">
                    <div className="complaint-reporter-info">
                      <span className="reporter-avatar">
                        {item.reportedBy ? item.reportedBy.charAt(0).toUpperCase() : 'U'}
                      </span>
                      <div className="reporter-text-block">
                        <span className="reporter-name">
                          {item.reportedBy} {isOwner(item) && <strong className="you-pill">(You)</strong>}
                        </span>
                        <div className="reporter-sub-meta">
                          {getUrgencyBadge(item.urgency)}
                        </div>
                      </div>
                    </div>

                    <div className="complaint-actions">
                      <div className="endorsement-pill" title="Community support count">
                        <span>▲</span>
                        <span>{item.upvotes || 1} Endorsements</span>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        className="btn-delete-complaint"
                        onClick={() => handleDelete(item)}
                        disabled={isDeleting}
                        title="Permanently delete this problem statement"
                      >
                        <span>🗑️</span>
                        <span>{isDeleting ? 'Deleting...' : 'Delete Problem'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportProblemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={currentUser}
        onComplaintSubmitted={(newC) => {
          setComplaints((prev) => [newC, ...prev])
          setNoticeMessage('Your new complaint has been filed and recorded successfully!')
          setTimeout(() => setNoticeMessage(''), 4500)
        }}
      />
    </div>
  )
}
