import React, { useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'VERIFIED', label: 'Verified', desc: 'Confirm authenticity of the civic issue' },
  { value: 'IN_PROGRESS', label: 'In Progress', desc: 'Work has begun on ground' },
  { value: 'RESOLVED', label: 'Resolved', desc: 'Issue has been redressed successfully' },
  { value: 'REJECTED', label: 'Rejected', desc: 'Issue cannot be processed or is invalid' },
]

export const StatusUpdateModal = ({
  isOpen,
  complaint,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [status, setStatus] = useState('VERIFIED')
  const [remarks, setRemarks] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [validationError, setValidationError] = useState('')

  if (!isOpen || !complaint) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setValidationError('')

    // Enforce backend validation rules
    if (status === 'REJECTED' && (!remarks || !remarks.trim())) {
      setValidationError('A rejection reason / remarks is strictly required when rejecting a complaint.')
      return
    }

    if (status === 'RESOLVED' && (!remarks || !remarks.trim())) {
      setValidationError('Resolution remarks are strictly required when marking a complaint as RESOLVED.')
      return
    }

    const payload = {
      status,
      remarks: remarks.trim(),
      evidenceImages: evidenceUrl.trim() ? [evidenceUrl.trim()] : undefined,
    }

    onSubmit(payload)
  }

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
        padding: '1rem',
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'rgba(18, 24, 38, 0.98)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '1.75rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>Update Complaint Status</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              ID: {complaint.complaintId || complaint.id} • Current: <strong>{complaint.currentStatus || complaint.status}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.25rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {validationError && (
          <div
            style={{
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#fb7185',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>⚠️</span>
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Status Selection */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}>
              Select New Status <span style={{ color: '#f43f5e' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = status === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setStatus(opt.value)
                      setValidationError('')
                    }}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      textAlign: 'left',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: isSelected ? '#a5b4fc' : '#fff' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      {opt.desc}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Remarks / Reason */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}>
              Administrative Remarks / Reason{' '}
              {(status === 'REJECTED' || status === 'RESOLVED') && (
                <span style={{ color: '#f43f5e' }}>(Required for {status})</span>
              )}
            </label>
            <textarea
              className="form-input"
              rows={3}
              placeholder={
                status === 'REJECTED'
                  ? 'Specify why this complaint is rejected...'
                  : status === 'RESOLVED'
                  ? 'Detail the resolution action taken and department notes...'
                  : 'Add administrative notes for this status change...'
              }
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value)
                setValidationError('')
              }}
              style={{
                width: '100%',
                resize: 'vertical',
                backgroundColor: 'rgba(13, 17, 28, 0.85)',
                color: '#fff',
                borderColor: validationError ? '#f43f5e' : undefined,
              }}
            />
          </div>

          {/* Evidence Image URL for RESOLVED */}
          {status === 'RESOLVED' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}>
                Resolution Evidence Photo URL (Optional)
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/resolved-work-photo.jpg"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating Status...' : 'Apply Status Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StatusUpdateModal
