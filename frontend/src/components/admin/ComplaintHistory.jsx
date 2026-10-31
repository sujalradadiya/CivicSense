import React from 'react'
import ComplaintStatusBadge from './ComplaintStatusBadge'
import PriorityBadge from './PriorityBadge'

export const ComplaintHistory = ({ history = [], createdAt }) => {
  // If no history exists, show initial submission record based on createdAt
  const hasHistory = Array.isArray(history) && history.length > 0

  return (
    <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '14px' }}>
      <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>📜</span>
        <span>Complaint Status & Audit Timeline</span>
      </h3>

      <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
        {/* Continuous timeline vertical line */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            bottom: '8px',
            left: '7px',
            width: '2px',
            backgroundColor: 'rgba(99, 102, 241, 0.3)',
          }}
        />

        {/* 1. Initial Submission Point */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <div
            style={{
              position: 'absolute',
              left: '-1.5rem',
              top: '4px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: '#6366f1',
              border: '3px solid #090d16',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.92rem' }}>
              Complaint Registered & Submitted
            </span>
            <ComplaintStatusBadge status="PENDING" size="small" />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {createdAt ? new Date(createdAt).toLocaleString() : 'Registration Time'}
            </span>
          </div>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
            Logged by citizen into municipal portal intake.
          </p>
        </div>

        {/* 2. Recorded Audit Events from Database */}
        {hasHistory &&
          history.map((record, index) => {
            const isStatusChange = record.action === 'STATUS_CHANGE' || record.newStatus
            const isPriorityChange = record.action === 'PRIORITY_CHANGE' || record.newPriority

            return (
              <div key={index} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-1.5rem',
                    top: '4px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: isStatusChange
                      ? record.newStatus === 'RESOLVED'
                        ? '#10b981'
                        : record.newStatus === 'REJECTED'
                        ? '#f43f5e'
                        : '#3b82f6'
                      : '#f59e0b',
                    border: '3px solid #090d16',
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.92rem' }}>
                    {isStatusChange
                      ? `Status Updated to ${record.newStatus}`
                      : isPriorityChange
                      ? `Priority Changed to ${record.newPriority}`
                      : record.action || 'Audit Record'}
                  </span>

                  {record.newStatus && <ComplaintStatusBadge status={record.newStatus} size="small" />}
                  {record.newPriority && <PriorityBadge priority={record.newPriority} size="small" />}

                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {record.timestamp ? new Date(record.timestamp).toLocaleString() : 'N/A'}
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '0.6rem 0.85rem',
                    marginTop: '0.4rem',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
                    Updated by:{' '}
                    <strong style={{ color: '#cbd5e1' }}>
                      {record.adminName || record.adminEmail || 'Administrator'}
                    </strong>
                  </div>
                  {record.remarks && (
                    <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                      Remarks: "{record.remarks}"
                    </div>
                  )}
                  {record.previousStatus && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Previous Status: {record.previousStatus}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

        {!hasHistory && (
          <div style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.5rem' }}>
            No administrative status modifications recorded yet.
          </div>
        )}
      </div>
    </div>
  )
}

export default ComplaintHistory
