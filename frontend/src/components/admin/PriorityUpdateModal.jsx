import React, { useState } from 'react'
import PriorityBadge from './PriorityBadge'

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export const PriorityUpdateModal = ({
  isOpen,
  complaint,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [priority, setPriority] = useState(complaint?.priority || 'MEDIUM')
  const [reason, setReason] = useState('')

  if (!isOpen || !complaint) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      priority,
      reason: reason.trim() || `Priority adjusted to ${priority} by administrator`,
    })
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
          maxWidth: '460px',
          background: 'rgba(18, 24, 38, 0.98)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '1.75rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>Change Complaint Priority</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              ID: {complaint.complaintId || complaint.id}
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

        <form onSubmit={handleSubmit}>
          {/* Priority selection */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}>
              Select Priority Level
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {PRIORITIES.map((p) => {
                const isSelected = priority === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                    }}
                  >
                    <PriorityBadge priority={p} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Reason */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}>
              Reason for Priority Change
            </label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="e.g. Escaped water main threatens roadway foundation, immediate hazard..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: '100%',
                resize: 'vertical',
                backgroundColor: 'rgba(13, 17, 28, 0.85)',
                color: '#fff',
              }}
            />
          </div>

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
              {isSubmitting ? 'Saving...' : 'Update Priority'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PriorityUpdateModal
