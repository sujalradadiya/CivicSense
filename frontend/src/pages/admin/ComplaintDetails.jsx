import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import adminService from '../../services/adminService'
import AdminLayout from '../../components/common/AdminLayout'
import ComplaintStatusBadge from '../../components/admin/ComplaintStatusBadge'
import PriorityBadge from '../../components/admin/PriorityBadge'
import ComplaintHistory from '../../components/admin/ComplaintHistory'
import StatusUpdateModal from '../../components/admin/StatusUpdateModal'
import PriorityUpdateModal from '../../components/admin/PriorityUpdateModal'
import Loader from '../../components/common/Loader'

export const ComplaintDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [complaint, setComplaint] = useState(null)
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successToast, setSuccessToast] = useState('')

  // Action Modals
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [priorityModalOpen, setPriorityModalOpen] = useState(false)
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  // Direct Inline Action State
  const [inlineRemarks, setInlineRemarks] = useState('')

  // Fetch Complaint details and history from backend
  const fetchDetails = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const res = await adminService.getComplaintById(id)
      if (res && res.data) {
        setComplaint(res.data)
      } else {
        setErrorMessage('Complaint record could not be found.')
      }

      // Fetch history timeline
      try {
        const histRes = await adminService.getComplaintHistory(id)
        if (histRes && Array.isArray(histRes.data)) {
          setHistory(histRes.data)
        }
      } catch (histErr) {
        console.warn('Failed to fetch complaint history:', histErr)
      }
    } catch (err) {
      console.error('Failed to fetch complaint details:', err)
      setErrorMessage(
        err.response?.data?.message || 'Failed to fetch complaint details from backend.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  // Status Update Handler
  const handleUpdateStatus = async ({ status, remarks, evidenceImages }) => {
    setIsSubmittingAction(true)
    try {
      await adminService.updateComplaintStatus(id, { status, remarks, evidenceImages })
      setSuccessToast(`Complaint status changed to ${status} successfully!`)
      setStatusModalOpen(false)
      setTimeout(() => setSuccessToast(''), 4000)
      await fetchDetails()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update complaint status.')
    } finally {
      setIsSubmittingAction(false)
    }
  }

  // Priority Update Handler
  const handleUpdatePriority = async ({ priority, reason }) => {
    setIsSubmittingAction(true)
    try {
      await adminService.updateComplaintPriority(id, { priority, reason })
      setSuccessToast(`Complaint priority changed to ${priority} successfully!`)
      setPriorityModalOpen(false)
      setTimeout(() => setSuccessToast(''), 4000)
      await fetchDetails()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update complaint priority.')
    } finally {
      setIsSubmittingAction(false)
    }
  }

  // Direct Quick Action buttons (Verify, In Progress)
  const handleDirectAction = async (targetStatus) => {
    if (targetStatus === 'REJECTED' || targetStatus === 'RESOLVED') {
      // Require modal to enter remarks
      setStatusModalOpen(true)
      return
    }

    setIsSubmittingAction(true)
    try {
      await adminService.updateComplaintStatus(id, {
        status: targetStatus,
        remarks: inlineRemarks.trim() || `Marked ${targetStatus} by administrator`,
      })
      setInlineRemarks('')
      setSuccessToast(`Status updated to ${targetStatus}!`)
      setTimeout(() => setSuccessToast(''), 4000)
      await fetchDetails()
    } catch (err) {
      alert(err.response?.data?.message || `Failed to update status to ${targetStatus}`)
    } finally {
      setIsSubmittingAction(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Complaint Details">
        <Loader message="Loading complaint details from database..." />
      </AdminLayout>
    )
  }

  if (errorMessage || !complaint) {
    return (
      <AdminLayout pageTitle="Complaint Details">
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Unable to View Complaint</h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            {errorMessage || 'The specified complaint does not exist in the database.'}
          </p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/admin/complaints')}>
            ← Back to All Complaints
          </button>
        </div>
      </AdminLayout>
    )
  }

  const complaintCode = complaint.complaintId || `CIV-${String(complaint.id).slice(-6).toUpperCase()}`

  return (
    <AdminLayout pageTitle={`Complaint ${complaintCode}`} onRefresh={fetchDetails}>
      {/* Toast Alert */}
      {successToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#10b981',
            color: '#fff',
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          <span>✓</span>
          <span>{successToast}</span>
        </div>
      )}

      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
        <Link to="/admin/complaints" style={{ color: '#94a3b8', textDecoration: 'none' }}>
          Complaints Registry
        </Link>
        <span style={{ color: '#64748b' }}>/</span>
        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{complaintCode}</span>
      </div>

      {/* Header bar */}
      <div
        className="glass-card"
        style={{
          padding: '1.5rem 1.75rem',
          borderRadius: '16px',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: 0, fontFamily: 'monospace' }}>
              {complaintCode}
            </h2>
            <ComplaintStatusBadge status={complaint.currentStatus || complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            Submitted on{' '}
            {complaint.submissionDate || complaint.createdAt
              ? new Date(complaint.submissionDate || complaint.createdAt).toLocaleString()
              : 'Unknown Date'}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setPriorityModalOpen(true)}
          >
            Change Priority
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setStatusModalOpen(true)}
          >
            Update Lifecycle Status
          </button>
        </div>
      </div>

      {/* Grid Layout: Left Column (Details) + Right Column (Citizen info & Actions) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Complaint Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. Complaint Details Card */}
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📝</span>
              <span>Complaint Information</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Issue Title / Subject
                </label>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc', marginTop: '0.2rem' }}>
                  {complaint.complaintTitle || complaint.category || 'Grievance Title'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Category
                  </label>
                  <div style={{ fontSize: '0.92rem', color: '#cbd5e1', fontWeight: 500, marginTop: '0.2rem' }}>
                    {complaint.category || 'General Civic'}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Sub-Problem
                  </label>
                  <div style={{ fontSize: '0.92rem', color: '#cbd5e1', fontWeight: 500, marginTop: '0.2rem' }}>
                    {complaint.subProblem || 'General'}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Description & Details
                </label>
                <div
                  style={{
                    fontSize: '0.92rem',
                    color: '#e2e8f0',
                    lineHeight: 1.6,
                    marginTop: '0.35rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  {complaint.complaintDescription || complaint.description || 'No detailed description provided.'}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Location & Street Landmark
                </label>
                <div style={{ fontSize: '0.92rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                  📍 {complaint.location || complaint.city || 'Location not specified'}
                </div>
                {complaint.coordinates && (
                  <div style={{ fontSize: '0.8rem', color: '#818cf8', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                    GPS: Lat {complaint.coordinates.lat}, Lng {complaint.coordinates.lng}
                  </div>
                )}
              </div>

              {/* Uploaded Images */}
              {complaint.images && complaint.images.length > 0 && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
                    Citizen Uploaded Images ({complaint.images.length})
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {complaint.images.map((imgUrl, idx) => (
                      <a
                        key={idx}
                        href={imgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          width: '120px',
                          height: '90px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'block',
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={`Evidence ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Reason (if rejected) */}
              {complaint.rejectionReason && (
                <div
                  style={{
                    backgroundColor: 'rgba(244, 63, 94, 0.12)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#fb7185', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    Official Rejection Reason
                  </div>
                  <div style={{ color: '#fecdd3', fontSize: '0.9rem' }}>{complaint.rejectionReason}</div>
                </div>
              )}

              {/* Resolution Remarks (if resolved) */}
              {complaint.resolutionRemarks && (
                <div
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#34d399', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    Official Resolution Remarks
                  </div>
                  <div style={{ color: '#a7f3d0', fontSize: '0.9rem' }}>{complaint.resolutionRemarks}</div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Timeline History */}
          <ComplaintHistory history={history} createdAt={complaint.submissionDate || complaint.createdAt} />
        </div>

        {/* Right Column: Citizen Information + Admin Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Citizen Information Card */}
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>👤</span>
              <span>Citizen Information</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Citizen Name</span>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', marginTop: '0.15rem' }}>
                  {complaint.citizenName || 'Anonymous Citizen'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Official Email</span>
                <div style={{ fontSize: '0.92rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
                  {complaint.citizenEmail || 'N/A'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Contact Number</span>
                <div style={{ fontSize: '0.92rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
                  {complaint.citizenContact || 'N/A'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>City / Jurisdiction</span>
                <div style={{ fontSize: '0.92rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
                  {complaint.city || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Admin Fast Action Panel */}
          <div
            className="glass-card"
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              backgroundColor: 'rgba(18, 24, 38, 0.85)',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 0.5rem 0' }}>
              Administrative Actions
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 1.25rem 0' }}>
              Execute state transitions backed by MongoDB audit trails.
            </p>

            {/* Quick remarks input */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                Quick Action Remarks
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Optional remark for verification / progress..."
                value={inlineRemarks}
                onChange={(e) => setInlineRemarks(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* 1. Verify */}
              <button
                type="button"
                className="btn btn-outline"
                disabled={isSubmittingAction || complaint.currentStatus === 'VERIFIED'}
                onClick={() => handleDirectAction('VERIFIED')}
                style={{
                  justifyContent: 'center',
                  borderColor: 'rgba(59, 130, 246, 0.4)',
                  color: '#60a5fa',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                }}
              >
                ✓ Verify Complaint Authenticity
              </button>

              {/* 2. Mark in progress */}
              <button
                type="button"
                className="btn btn-outline"
                disabled={isSubmittingAction || complaint.currentStatus === 'IN_PROGRESS'}
                onClick={() => handleDirectAction('IN_PROGRESS')}
                style={{
                  justifyContent: 'center',
                  borderColor: 'rgba(6, 182, 212, 0.4)',
                  color: '#22d3ee',
                  backgroundColor: 'rgba(6, 182, 212, 0.08)',
                }}
              >
                ⚙️ Mark In Progress (Work Started)
              </button>

              {/* 3. Mark resolved */}
              <button
                type="button"
                className="btn"
                disabled={isSubmittingAction || complaint.currentStatus === 'RESOLVED'}
                onClick={() => setStatusModalOpen(true)}
                style={{
                  justifyContent: 'center',
                  backgroundColor: '#10b981',
                  color: '#fff',
                }}
              >
                ✅ Mark as Resolved (Requires Remarks)
              </button>

              {/* 4. Reject */}
              <button
                type="button"
                className="btn btn-outline"
                disabled={isSubmittingAction || complaint.currentStatus === 'REJECTED'}
                onClick={() => setStatusModalOpen(true)}
                style={{
                  justifyContent: 'center',
                  borderColor: 'rgba(244, 63, 94, 0.4)',
                  color: '#fb7185',
                  backgroundColor: 'rgba(244, 63, 94, 0.08)',
                }}
              >
                ✕ Reject Complaint (Requires Reason)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={statusModalOpen}
        complaint={complaint}
        onClose={() => setStatusModalOpen(false)}
        onSubmit={handleUpdateStatus}
        isSubmitting={isSubmittingAction}
      />

      {/* Priority Update Modal */}
      <PriorityUpdateModal
        isOpen={priorityModalOpen}
        complaint={complaint}
        onClose={() => setPriorityModalOpen(false)}
        onSubmit={handleUpdatePriority}
        isSubmitting={isSubmittingAction}
      />
    </AdminLayout>
  )
}

export default ComplaintDetails
