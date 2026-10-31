import React from 'react'

export const DashboardCard = ({
  title,
  value,
  icon,
  accentColor = '#6366f1',
  isLoading = false,
  subtitle,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="glass-card"
      style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        background: 'rgba(18, 24, 38, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.borderColor = accentColor
          e.currentTarget.style.boxShadow = `0 10px 24px -5px ${accentColor}25`
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
          e.currentTarget.style.boxShadow = 'none'
        }
      }}
    >
      {/* Decorative accent gradient line on left edge */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: accentColor,
        }}
      />

      <div style={{ flex: 1, paddingLeft: '0.5rem' }}>
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted, #8291a5)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: '0 0 0.5rem 0',
          }}
        >
          {title}
        </p>

        {isLoading ? (
          <div
            style={{
              width: '60px',
              height: '32px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              animation: 'pulse 1.5s infinite ease-in-out',
            }}
          />
        ) : (
          <h3
            style={{
              fontSize: '1.85rem',
              fontWeight: 700,
              color: 'var(--text-primary, #f8fafc)',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {value !== undefined && value !== null ? Number(value).toLocaleString() : '0'}
          </h3>
        )}

        {subtitle && (
          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-secondary, #cbd5e1)',
              marginTop: '0.35rem',
              display: 'inline-block',
            }}
          >
            {subtitle}
          </span>
        )}
      </div>

      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${accentColor}18`,
          color: accentColor,
          fontSize: '1.5rem',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
    </div>
  )
}

export default DashboardCard
