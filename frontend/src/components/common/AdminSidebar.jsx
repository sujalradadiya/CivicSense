import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export const AdminSidebar = ({ isOpenMobile, onCloseMobile }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const currentPath = location.pathname
  const searchParams = new URLSearchParams(location.search)
  const currentStatus = searchParams.get('status')

  const navItems = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: '📊',
      isActive: currentPath === '/admin/dashboard',
    },
    {
      header: 'COMPLAINT DISPATCH',
    },
    {
      label: 'All Complaints',
      path: '/admin/complaints',
      icon: '📋',
      isActive: currentPath === '/admin/complaints' && !currentStatus,
    },
    {
      label: 'Pending Verification',
      path: '/admin/complaints?status=PENDING',
      icon: '⏳',
      isActive: currentPath === '/admin/complaints' && currentStatus === 'PENDING',
      badgeColor: '#fbbf24',
    },
    {
      label: 'Verified Complaints',
      path: '/admin/complaints?status=VERIFIED',
      icon: '✓',
      isActive: currentPath === '/admin/complaints' && currentStatus === 'VERIFIED',
      badgeColor: '#60a5fa',
    },
    {
      label: 'In Progress',
      path: '/admin/complaints?status=IN_PROGRESS',
      icon: '⚙️',
      isActive: currentPath === '/admin/complaints' && currentStatus === 'IN_PROGRESS',
      badgeColor: '#22d3ee',
    },
    {
      label: 'Resolved',
      path: '/admin/complaints?status=RESOLVED',
      icon: '✅',
      isActive: currentPath === '/admin/complaints' && currentStatus === 'RESOLVED',
      badgeColor: '#34d399',
    },
    {
      label: 'Rejected',
      path: '/admin/complaints?status=REJECTED',
      icon: '✕',
      isActive: currentPath === '/admin/complaints' && currentStatus === 'REJECTED',
      badgeColor: '#fb7185',
    },
    {
      header: 'MANAGEMENT & INTELLIGENCE',
    },
    {
      label: 'Citizens',
      path: '/admin/users',
      icon: '👥',
      isActive: currentPath === '/admin/users',
    },
    {
      label: 'AI Analysis',
      path: '/admin/ai-analysis',
      icon: '🤖',
      isActive: currentPath === '/admin/ai-analysis',
      tag: 'Future',
    },
  ]

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 998,
          }}
        />
      )}

      <aside
        className={`admin-sidebar ${isOpenMobile ? 'mobile-open' : ''}`}
        style={{
          width: '260px',
          backgroundColor: '#0c1220',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          overflowY: 'auto',
        }}
      >
        {/* Brand / Logo */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.6rem' }}>🏛️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em' }}>
                Civic<span style={{ color: '#6366f1' }}>Sense</span>
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: '#fbbf24',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Admin Control Portal
              </div>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              type="button"
              className="mobile-close-btn"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '1.25rem',
                cursor: 'pointer',
                display: 'none',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Current Admin Profile Snapshot */}
        <div
          style={{
            padding: '1rem 1.25rem',
            margin: '0.75rem 1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
              flexShrink: 0,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name || 'Administrator'}
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: '#94a3b8',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.email || 'admin@civicsence.com'}
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{ flex: 1, padding: '0.5rem 0.75rem' }}>
          {navItems.map((item, idx) => {
            if (item.header) {
              return (
                <div
                  key={idx}
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.35)',
                    padding: '1rem 0.75rem 0.35rem 0.75rem',
                    letterSpacing: '0.06em',
                  }}
                >
                  {item.header}
                </div>
              )
            }

            return (
              <Link
                key={idx}
                to={item.path}
                onClick={onCloseMobile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  color: item.isActive ? '#fff' : '#94a3b8',
                  backgroundColor: item.isActive ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                  border: item.isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: item.isActive ? 600 : 500,
                  marginBottom: '0.2rem',
                  transition: 'background-color 0.15s, color 0.15s',
                }}
              >
                <span style={{ fontSize: '1.05rem' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.tag && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(168, 85, 247, 0.2)',
                      color: '#c084fc',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                    }}
                  >
                    {item.tag}
                  </span>
                )}
                {item.badgeColor && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: item.badgeColor,
                    }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer with Logout */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              color: '#fb7185',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.1)'
            }}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
