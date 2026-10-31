import React, { useState } from 'react'

export const RecentComplaints = ({
  complaints,
  onUpvote,
  onOpenReportModal,
  onDeleteComplaint,
  currentUser,
}) => {
  const [filterCategory, setFilterCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const categories = ['All', 'Road Damage', 'Garbage', 'Street Light', 'Water Supply', 'Drainage']

  const filtered = complaints.filter((c) => {
    const complaintCat = (c.category || '').trim().toLowerCase()
    const activeFilter = filterCategory.trim().toLowerCase()
    const matchesCat = activeFilter === 'all' || complaintCat === activeFilter

    const query = (searchQuery || '').trim().toLowerCase()
    const matchesSearch =
      !query ||
      (c.subProblem && c.subProblem.toLowerCase().includes(query)) ||
      (c.location && c.location.toLowerCase().includes(query)) ||
      (c.description && c.description.toLowerCase().includes(query)) ||
      (c.id && c.id.toLowerCase().includes(query)) ||
      (c.reportedBy && c.reportedBy.toLowerCase().includes(query)) ||
      complaintCat.includes(query)

    return matchesCat && matchesSearch
  })

  const handleDelete = async (item) => {
    const id = item._id || item.id
    const confirmText = `Are you sure you want to delete this problem statement (#${item.id || id})?\n\n"${item.subProblem || 'Issue'}" will be permanently deleted.`
    if (!window.confirm(confirmText)) {
      return
    }

    try {
      setDeletingId(id)
      if (onDeleteComplaint) {
        await onDeleteComplaint(item)
      }
    } finally {
      setDeletingId(null)
    }
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return <span className="status-pill pill-resolved">✓ Resolved</span>
      case 'In Progress':
        return <span className="status-pill pill-progress">⚡ In Progress</span>
      case 'Under Review':
        return <span className="status-pill pill-review">🔍 Under Review</span>
      default:
        return <span className="status-pill pill-pending">⏱️ Pending Verification</span>
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

  return (
    <div className="recent-complaints-section">
      <div className="section-header-row">
        <div>
          <div className="section-eyebrow">CITIZEN GRIEVANCES TRACKER</div>
          <h2 className="section-heading">Public Complaints & Action Dispatch Ledger</h2>
          <p className="section-subtitle">
            Live feed of verified infrastructure issues logged by residents across municipal wards.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => onOpenReportModal && onOpenReportModal()}
        >
          <span>+ File New Complaint</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="complaints-filter-bar">
        <div className="filter-category-scroll">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`cat-filter-chip ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              <span>{cat !== 'All' ? getCategoryIcon(cat) : '✨'}</span>
              <span>{cat}</span>
              {cat === 'All' ? (
                <span className="count-pill">{complaints.length}</span>
              ) : (
                <span className="count-pill">
                  {
                    complaints.filter(
                      (c) => (c.category || '').trim().toLowerCase() === cat.trim().toLowerCase()
                    ).length
                  }
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="complaint-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, sub-problem, street..."
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

      {/* Complaints List Grid */}
      {filtered.length === 0 ? (
        <div className="empty-complaints-card">
          <div className="empty-icon">📂</div>
          <h3>No matching grievances found</h3>
          <p>Be the first citizen to report an issue for this category.</p>
          <button
            className="btn btn-primary btn-sm"
            style={{ marginTop: '1rem' }}
            onClick={() => onOpenReportModal && onOpenReportModal(filterCategory !== 'All' ? filterCategory : undefined)}
          >
            Report an Issue Now
          </button>
        </div>
      ) : (
        <div className="complaints-cards-grid">
          {filtered.map((item) => {
            const itemId = item._id || item.id
            const isDeleting = deletingId === itemId

            return (
              <div key={itemId} className="complaint-record-card">
                <div className="complaint-card-top">
                  <div className="complaint-id-meta">
                    <span className="complaint-id-tag">#{item.id || item._id}</span>
                    <span className="complaint-time">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recently'}
                    </span>
                  </div>
                  <div className="complaint-status-wrap">
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                <div className="complaint-title-block">
                  <div className="complaint-icon-badge">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <h4 className="complaint-subproblem-title">{item.subProblem}</h4>
                    <div className="complaint-cat-label">
                      Category: <strong>{item.category}</strong>
                    </div>
                  </div>
                </div>

                <p className="complaint-desc">{item.description}</p>

                <div className="complaint-location-box">
                  <span className="loc-icon">📍</span>
                  <span className="loc-text">{item.location}</span>
                  {item.landmark && <span className="loc-landmark">• Ref: {item.landmark}</span>}
                </div>

                <div className="complaint-card-footer">
                  <div className="complaint-reporter-info">
                    <span className="reporter-avatar">
                      {item.reportedBy ? item.reportedBy.charAt(0).toUpperCase() : 'C'}
                    </span>
                    <span className="reporter-name">{item.reportedBy}</span>
                    {getUrgencyBadge(item.urgency)}
                  </div>

                  <div className="complaint-actions">
                    <button
                      type="button"
                      className="btn-upvote"
                      onClick={() => onUpvote && onUpvote(item.id || item._id)}
                      title="Upvote / Support this municipal grievance"
                    >
                      <span>▲</span>
                      <span>{item.upvotes || 1} Citizen Endorsements</span>
                    </button>

                    <button
                      type="button"
                      className="btn-delete-complaint"
                      onClick={() => handleDelete(item)}
                      disabled={isDeleting}
                      title="Permanently delete this problem"
                    >
                      <span>🗑️</span>
                      <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
