import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import adminService from '../../services/adminService'
import ComplaintStatusBadge from '../../components/admin/ComplaintStatusBadge'
import PriorityBadge from '../../components/admin/PriorityBadge'
import Loader from '../../components/common/Loader'

export const CitizenDetailsModal = ({ isOpen, citizenId, onClose }) => {
  const [citizen, setCitizen] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen || !citizenId) return

    const loadCitizenData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const [profileRes, complaintsRes] = await Promise.all([
          adminService.getCitizenById(citizenId),
          adminService.getCitizenComplaints(citizenId),
        ])

        if (profileRes && profileRes.data) {
          setCitizen(profileRes.data)
        }
        if (complaintsRes && Array.isArray(complaintsRes.data)) {
          setComplaints(complaintsRes.data)
        }
      } catch (err) {
        console.error('Failed to load citizen details:', err)
        setError(err.response?.data?.message || 'Failed to fetch citizen profile and complaints.')
      } finally {
        setIsLoading(false)
      }
    }

    loadCitizenData()
  }, [isOpen, citizenId])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1.5rem',
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          background: 'rgba(18, 24, 38, 0.98)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>👤</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>
                Citizen Profile & Filed Complaints
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                ID: {citizenId}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.4rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem' }}>
          {isLoading ? (
            <Loader message="Loading citizen profile..." />
          ) : error ? (
            <div className="alert-box alert-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          ) : (
            <div>
              {/* Profile Details Card */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Full Name</span>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                    {citizen?.name}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Email</span>
                  <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    {citizen?.email}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Contact</span>
                  <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    {citizen?.contact || 'N/A'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>City</span>
                  <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    📍 {citizen?.city || 'N/A'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Registration Date</span>
                  <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    {citizen?.registrationDate
                      ? new Date(citizen.registrationDate).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Account Status</span>
                  <div style={{ marginTop: '0.2rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: citizen?.accountStatus === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: citizen?.accountStatus === 'ACTIVE' ? '#34d399' : '#fb7185',
                        border: `1px solid ${citizen?.accountStatus === 'ACTIVE' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                      }}
                    >
                      {citizen?.accountStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistics Overview */}
              {citizen?.statistics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#818cf8' }}>
                      {citizen.statistics.totalComplaints}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.15rem' }}>
                      Total Submitted
                    </div>
                  </div>
                  <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#34d399' }}>
                      {citizen.statistics.resolvedComplaints}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.15rem' }}>
                      Resolved
                    </div>
                  </div>
                  <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fbbf24' }}>
                      {citizen.statistics.pendingComplaints}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.15rem' }}>
                      Pending
                    </div>
                  </div>
                </div>
              )}

              {/* Citizen Complaints List */}
              <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📋</span>
                <span>All Complaints Filed by this Citizen ({complaints.length})</span>
              </h4>

              {complaints.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                  No complaints filed by this citizen yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {complaints.map((c) => {
                    const cId = c._id || c.id
                    const cCode = c.complaintId || `CIV-${String(cId).slice(-6).toUpperCase()}`

                    return (
                      <div
                        key={cId}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '10px',
                          padding: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.75rem',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#818cf8', fontSize: '0.88rem' }}>
                              {cCode}
                            </span>
                            <ComplaintStatusBadge status={c.status} size="small" />
                            {c.priority && <PriorityBadge priority={c.priority} size="small" />}
                          </div>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>
                            {c.issueTitle || c.category || 'Grievance'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                            {c.issueTypeId?.category || c.category} • Submitted on{' '}
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>

                        <Link
                          to={`/admin/complaints/${cId}`}
                          className="btn btn-outline btn-sm"
                          onClick={onClose}
                        >
                          View Full Complaint →
                        </Link>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
            Close Profile
          </button>
        </div>
      </div>
    </div>
  )
}

export default CitizenDetailsModal
