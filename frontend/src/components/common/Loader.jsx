import React from 'react'

export const Loader = ({ message = 'Loading...', fullScreen = false, size = 'default' }) => {
  const containerStyle = fullScreen
    ? {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        minHeight: '200px',
      }

  const spinnerSize = size === 'small' ? '24px' : size === 'large' ? '56px' : '36px'

  return (
    <div style={containerStyle} role="status" aria-live="polite">
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: 'var(--primary, #6366f1)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '1rem',
        }}
      />
      {message && (
        <span
          style={{
            color: 'var(--text-secondary, #cbd5e1)',
            fontSize: size === 'small' ? '0.85rem' : '0.95rem',
            fontWeight: 500,
          }}
        >
          {message}
        </span>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Loader
