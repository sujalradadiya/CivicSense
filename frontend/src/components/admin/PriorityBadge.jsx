import React from 'react'

const PRIORITY_CONFIG = {
  CRITICAL: {
    label: 'Critical',
    bg: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    border: 'rgba(239, 68, 68, 0.4)',
    dotColor: '#ef4444',
  },
  HIGH: {
    label: 'High',
    bg: 'rgba(249, 115, 22, 0.15)',
    color: '#fb923c',
    border: 'rgba(249, 115, 22, 0.35)',
    dotColor: '#f97316',
  },
  MEDIUM: {
    label: 'Medium',
    bg: 'rgba(59, 130, 246, 0.15)',
    color: '#60a5fa',
    border: 'rgba(59, 130, 246, 0.35)',
    dotColor: '#3b82f6',
  },
  LOW: {
    label: 'Low',
    bg: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    border: 'rgba(16, 185, 129, 0.35)',
    dotColor: '#10b981',
  },
}

export const PriorityBadge = ({ priority = 'MEDIUM', size = 'default' }) => {
  const normPriority = String(priority || 'MEDIUM').toUpperCase()
  const config = PRIORITY_CONFIG[normPriority] || PRIORITY_CONFIG.MEDIUM

  const isSmall = size === 'small'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: isSmall ? '0.2rem 0.5rem' : '0.25rem 0.65rem',
        borderRadius: '6px',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontSize: isSmall ? '0.72rem' : '0.8rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.dotColor,
          display: 'inline-block',
        }}
      />
      <span>{config.label}</span>
    </span>
  )
}

export default PriorityBadge
