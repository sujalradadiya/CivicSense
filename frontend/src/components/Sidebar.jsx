import React from 'react'
import { NavLink } from 'react-router-dom'

export const Sidebar = ({
  user,
  onLogout,
  onOpenReportModal,
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const currentUser = user || {
    name: 'Guest User',
    email: 'guest@portal.gov',
    city: 'City Central',
  }

  const navItems = [
    {
      id: 'dashboard',
      label: 'Civic Dashboard',
      icon: '📊',
      badge: 'Live',
    },
    {
      id: 'my-complaints',
      label: 'My Complaints',
      icon: '📝',
      badge: 'Self',
    },
    {
      id: 'report',
      label: 'Report Problem',
      icon: '⚠️',
      highlight: true,
      action: () => onOpenReportModal && onOpenReportModal(),
    },
    {
      id: 'categories',
      label: 'Problem Categories',
      icon: '🗂️',
      badge: '5 Active',
    },
    {
      id: 'public-ledger',
      label: 'Public Grievances',
      icon: '📋',
    },
  ]

  const handleNavClick = (item) => {
    if (item.action) {
      item.action()
    } else if (setActiveTab) {
      setActiveTab(item.id)
    }
    if (onCloseMobile) onCloseMobile()
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div className="sidebar-mobile-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`vertical-sidebar ${isOpenMobile ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🏛️</div>
          <div className="sidebar-brand-text">
            <span className="brand-title">Civic<span className="gradient-text">Pulse</span></span>
            <span className="brand-subtitle">Municipal Services Portal</span>
          </div>
        </div>

        {/* Quick Report Callout Button */}
        <div className="sidebar-action-box">
          <button
            className="btn btn-primary btn-block sidebar-report-btn"
            onClick={() => {
              if (onOpenReportModal) onOpenReportModal()
              if (onCloseMobile) onCloseMobile()
            }}
          >
            <span className="pulse-dot"></span>
            <span>+ Report An Issue</span>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="sidebar-section-title">MAIN NAVIGATION</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`sidebar-nav-item ${isActive ? 'active' : ''} ${item.highlight ? 'highlight-item' : ''}`}
              >
                <span className="nav-item-icon">{item.icon}</span>
                <span className="nav-item-label">{item.label}</span>
                {item.badge && (
                  <span className={`nav-item-badge ${isActive ? 'badge-active' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Quick Category Jump List */}
        <div className="sidebar-section-title">PROBLEM DIRECTORY</div>
        <div className="sidebar-quick-categories">
          <div
            className="quick-cat-item"
            onClick={() => {
              if (onOpenReportModal) onOpenReportModal('Road Damage')
              if (onCloseMobile) onCloseMobile()
            }}
          >
            <span className="quick-cat-icon">🚧</span>
            <span className="quick-cat-name">Road Damage</span>
          </div>
          <div
            className="quick-cat-item"
            onClick={() => {
              if (onOpenReportModal) onOpenReportModal('Garbage')
              if (onCloseMobile) onCloseMobile()
            }}
          >
            <span className="quick-cat-icon">🗑️</span>
            <span className="quick-cat-name">Garbage</span>
          </div>
          <div
            className="quick-cat-item"
            onClick={() => {
              if (onOpenReportModal) onOpenReportModal('Street Light')
              if (onCloseMobile) onCloseMobile()
            }}
          >
            <span className="quick-cat-icon">💡</span>
            <span className="quick-cat-name">Street Light</span>
          </div>
          <div
            className="quick-cat-item"
            onClick={() => {
              if (onOpenReportModal) onOpenReportModal('Water Supply')
              if (onCloseMobile) onCloseMobile()
            }}
          >
            <span className="quick-cat-icon">💧</span>
            <span className="quick-cat-name">Water Supply</span>
          </div>
          <div
            className="quick-cat-item"
            onClick={() => {
              if (onOpenReportModal) onOpenReportModal('Drainage')
              if (onCloseMobile) onCloseMobile()
            }}
          >
            <span className="quick-cat-icon">🌊</span>
            <span className="quick-cat-name">Drainage</span>
          </div>
        </div>

        {/* User Account & Bottom Sign Out Section */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-avatar">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{currentUser.name}</div>
              <div className="sidebar-user-meta">
                <span className="status-indicator-dot"></span>
                <span>{currentUser.city || 'Citizen'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="btn btn-outline btn-block sidebar-logout-btn"
            title="Sign out of your civic portal account"
          >
            <span>🚪 Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
