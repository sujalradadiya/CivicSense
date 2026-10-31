import React from 'react'
import { Link } from 'react-router-dom'
import ComplaintStatusBadge from './ComplaintStatusBadge'
import PriorityBadge from './PriorityBadge'

export const ComplaintTable = ({
  complaints = [],
  isLoading = false,
  pagination,
  onPageChange,
  onQuickUpdateStatus,
  onQuickUpdatePriority,
}) => {
  if (isLoading) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', borderRadius: '14px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem auto',
          }}
        />
        <p style={{ color: '#94a3b8', margin: 0 }}>Fetching complaints records...</p>
      </div>
    )
  }

  if (!complaints || complaints.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', borderRadius: '14px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
        <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Complaints Found</h3>
        <p style={{ color: '#94a3b8', maxWidth: '420px', margin: '0 auto' }}>
          No grievance records match the current filter parameters or search query. Try adjusting your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card" style={{ borderRadius: '14px', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                textTransform: 'uppercase',
                fontSize: '0.72rem',
                letterSpacing: '0.05em',
              }}
            >
              <th style={{ padding: '0.9rem 1rem' }}>Complaint ID</th>
              <th style={{ padding: '0.9rem 1rem' }}>Citizen Details</th>
              <th style={{ padding: '0.9rem 1rem' }}>Location</th>
              <th style={{ padding: '0.9rem 1rem' }}>Issue & Category</th>
              <th style={{ padding: '0.9rem 1rem' }}>Priority</th>
              <th style={{ padding: '0.9rem 1rem' }}>Status</th>
              <th style={{ padding: '0.9rem 1rem' }}>Submitted</th>
              <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((item) => {
              const id = item.id || item._id
              const complaintCode = item.complaintId || `CIV-${String(id).slice(-6).toUpperCase()}`

              return (
                <tr
                  key={id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.025)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {/* Complaint ID */}
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                    <Link
                      to={`/admin/complaints/${id}`}
                      style={{
                        color: '#818cf8',
                        fontWeight: 600,
                        textDecoration: 'none',
                        fontFamily: 'monospace',
                        fontSize: '0.88rem',
                      }}
                    >
                      {complaintCode}
                    </Link>
                  </td>

                  {/* Citizen Name & Email */}
                  <td style={{ padding: '1rem', minWidth: '160px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                      {item.citizenName || item.reportedBy || 'Citizen'}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                      {item.citizenEmail || item.userEmail || 'N/A'}
                    </div>
                  </td>

                  {/* City */}
                  <td style={{ padding: '1rem', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                    <span>📍 {item.city || 'Unknown'}</span>
                  </td>

                  {/* Title & Category */}
                  <td style={{ padding: '1rem', minWidth: '220px' }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: '#f8fafc',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '260px',
                      }}
                      title={item.complaintTitle || item.category}
                    >
                      {item.complaintTitle || item.category || 'Civic Issue'}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#a5b4fc', marginTop: '0.15rem' }}>
                      {item.category} {item.subProblem ? `• ${item.subProblem}` : ''}
                    </div>
                  </td>

                  {/* Priority */}
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                    <PriorityBadge priority={item.priority} size="small" />
                  </td>

                  {/* Status */}
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                    <ComplaintStatusBadge status={item.currentStatus || item.status} size="small" />
                  </td>

                  {/* Submission Date */}
                  <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {item.submissionDate || item.createdAt
                      ? new Date(item.submissionDate || item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                      {/* View Details */}
                      <Link
                        to={`/admin/complaints/${id}`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        Details
                      </Link>

                      {/* Quick Status Update */}
                      {onQuickUpdateStatus && (
                        <button
                          type="button"
                          onClick={() => onQuickUpdateStatus(item)}
                          className="btn btn-sm"
                          style={{
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.75rem',
                            backgroundColor: 'rgba(99, 102, 241, 0.2)',
                            color: '#a5b4fc',
                            border: '1px solid rgba(99, 102, 241, 0.4)',
                          }}
                        >
                          Status
                        </button>
                      )}

                      {/* Quick Priority Update */}
                      {onQuickUpdatePriority && (
                        <button
                          type="button"
                          onClick={() => onQuickUpdatePriority(item)}
                          className="btn btn-sm"
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            backgroundColor: 'rgba(245, 158, 11, 0.15)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                          }}
                        >
                          Priority
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> (
            <strong>{pagination.total}</strong> total complaints)
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              style={{ padding: '0.3rem 0.75rem' }}
            >
              ← Previous
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              style={{ padding: '0.3rem 0.75rem' }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComplaintTable
