import React from 'react'

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending Verification',
    bg: 'rgba(245, 158, 11, 0.12)',
    color: '#fbbf24',
    border: 'rgba(245, 158, 11, 0.3)',
    icon: '⏳',
  },
  VERIFIED: {
    label: 'Verified',
    bg: 'rgba(59, 130, 246, 0.12)',
    color: '#60a5fa',
    border: 'rgba(59, 130, 246, 0.3)',
    icon: '✓',
  },
  ASSIGNED: {
    label: 'Assigned',
    bg: 'rgba(139, 92, 246, 0.12)',
    color: '#a78bfa',
    border: 'rgba(139, 92, 246, 0.3)',
    icon: '🏢',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'rgba(6, 182, 212, 0.12)',
    color: '#22d3ee',
    border: 'rgba(6, 182, 212, 0.3)',
    icon: '⚙️',
  },
  RESOLVED: {
    label: 'Resolved',
    bg: 'rgba(16, 185, 129, 0.12)',
    color: '#34d399',
    border: 'rgba(16, 185, 129, 0.3)',
    icon: '✅',
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'rgba(244, 63, 94, 0.12)',
    color: '#fb7185',
    border: 'rgba(244, 63, 94, 0.3)',
    icon: '✕',
  },
}

export const ComplaintStatusBadge = ({ status = 'PENDING', size = 'default' }) => {
  const normStatus = String(status || 'PENDING')
    .toUpperCase()
    .replace(/\s+/g, '_')

  const config = STATUS_CONFIG[normStatus] || {
    label: status,
    bg: 'rgba(148, 163, 184, 0.12)',
    color: '#94a3b8',
    border: 'rgba(148, 163, 184, 0.25)',
    icon: '•',
  }

  const isSmall = size === 'small'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: isSmall ? '0.2rem 0.55rem' : '0.3rem 0.75rem',
        borderRadius: '9999px',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontSize: isSmall ? '0.75rem' : '0.82rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: isSmall ? '0.75rem' : '0.85rem' }}>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}

export default ComplaintStatusBadge
