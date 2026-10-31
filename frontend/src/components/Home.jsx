import React, { useState, useEffect } from 'react'
import { PROBLEM_CATEGORIES } from '../data/problemCategories'
import { CategoryCard } from './CategoryCard'
import { ReportProblemModal } from './ReportProblemModal'
import { RecentComplaints } from './RecentComplaints'
import { fetchIssueTypes, deleteIssueFromDatabase } from '../services/issueTypeService'

const INITIAL_SEED_COMPLAINTS = []

export const Home = ({ user }) => {
  const [deleteNotice, setDeleteNotice] = useState('')
  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_complaints')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      localStorage.setItem('civic_complaints', JSON.stringify(INITIAL_SEED_COMPLAINTS))
      return INITIAL_SEED_COMPLAINTS
    } catch {
      return INITIAL_SEED_COMPLAINTS
    }
  })

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await fetchIssueTypes()
        if (data && Array.isArray(data)) {
          // Sort by newest first
          const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          setComplaints(sortedData)
          localStorage.setItem('civic_complaints', JSON.stringify(sortedData))
        }
      } catch (err) {
        console.error('Failed to fetch from DB', err)
      }
    }
    fetchComplaints()
  }, [])

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [modalInitialCategory, setModalInitialCategory] = useState('Road Damage')
  const [modalInitialSubProblem, setModalInitialSubProblem] = useState('')

  // Quick Action notification notice
  const [quickActionNotice, setQuickActionNotice] = useState('')

  // Fallback demo user if accessed directly
  const currentUser = user || JSON.parse(localStorage.getItem('currentUser') || 'null') || {
    name: 'Citizen Explorer',
    email: 'citizen@municipality.gov',
    contact: '+91 98765 00000',
    city: 'Municipal Smart City',
    state: 'Active Zone',
  }

  const handleOpenReportModal = (category = 'Road Damage', subProblem = '') => {
    setModalInitialCategory(category)
    setModalInitialSubProblem(subProblem)
    setModalOpen(true)
  }

  const handleComplaintSubmitted = (newComplaint) => {
    if (!newComplaint) return
    setComplaints((prev) => {
      const idToCheck = newComplaint._id || newComplaint.id
      if (idToCheck && prev.some((c) => (c._id && c._id === idToCheck) || (c.id && c.id === idToCheck))) {
        return prev
      }
      return [newComplaint, ...prev]
    })
  }

  // Listen for complaints submitted from any modal (Sidebar, Navbar, or Home)
  useEffect(() => {
    const handleGlobalComplaint = (e) => {
      if (e.detail) {
        handleComplaintSubmitted(e.detail)
      }
    }
    window.addEventListener('complaint-submitted', handleGlobalComplaint)
    return () => {
      window.removeEventListener('complaint-submitted', handleGlobalComplaint)
    }
  }, [])

  const handleUpvote = (id) => {
    setComplaints((prev) => {
      const updated = prev.map((c) =>
        (c.id === id || c._id === id) ? { ...c, upvotes: (c.upvotes || 0) + 1 } : c
      )
      localStorage.setItem('civic_complaints', JSON.stringify(updated))
      return updated
    })
  }

  const handleDeleteComplaint = async (complaint) => {
    const idToDelete = complaint._id || complaint.id
    if (!idToDelete) return

    try {
      // 1. Delete from backend database
      const result = await deleteIssueFromDatabase(idToDelete)
      if (!result.success) {
        console.warn('Backend delete notification:', result.error)
      }

      // 2. Remove from frontend state
      setComplaints((prev) => {
        const updated = prev.filter(
          (c) =>
            (c._id ? c._id !== idToDelete : true) &&
            (c.id ? c.id !== idToDelete : true) &&
            c.id !== complaint.id &&
            c._id !== complaint._id
        )
        try {
          localStorage.setItem('civic_complaints', JSON.stringify(updated))
        } catch (storageErr) {
          console.error('Failed to update local storage', storageErr)
        }
        return updated
      })

      // 3. Emit global event so other components or App toast can notify
      window.dispatchEvent(
        new CustomEvent('complaint-deleted', { detail: { id: idToDelete, complaint } })
      )

      setDeleteNotice('Your Problem statement has been deleted.')
      setTimeout(() => setDeleteNotice(''), 4000)
    } catch (err) {
      console.error('Failed to delete complaint:', err)
      alert(`Could not delete complaint: ${err.message}`)
    }
  }

  const handleQuickAction = () => {
    setQuickActionNotice('⚡ Quick Action Dispatch: Launching Priority Complaint Form for your location...')
    setTimeout(() => {
      setQuickActionNotice('')
      handleOpenReportModal('Road Damage', 'Pothole')
    }, 600)
  }

  // Calculate live statistics
  const totalComplaints = complaints.length
  const criticalCount = complaints.filter((c) => c.urgency === 'Critical' || c.urgency === 'High').length
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length
  const activeCount = totalComplaints - resolvedCount

  return (
    <div className="civic-home-container">
      {/* Hero Welcome Banner */}
      <div className="hero-banner civic-hero">
        <div className="hero-content">
          <div className="hero-badge-row">
            <span className="badge badge-success">● Public Civic Portal Active</span>
            <span className="badge badge-primary">Ward: {currentUser.city || 'Central Zone'}</span>
          </div>

          <h1 className="hero-title">
            Welcome back, <span className="gradient-text">{currentUser.name}</span>
          </h1>

          <p className="hero-subtitle">
            Report civic issues in your neighborhood. Select a category below or submit a direct problem report
            under our five municipal grievance domains.
          </p>

          {/* Quick Action Button - Note: The user explicitly demanded to remove logout option near quick action */}
          <div className="hero-actions-row">
            <button className="btn btn-primary" onClick={handleQuickAction}>
              <span>⚡ Quick Action — File Issue</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                const el = document.getElementById('categories-directory')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <span>📂 Explore All 5 Categories</span>
            </button>
          </div>

          {quickActionNotice && (
            <div className="quick-action-toast">
              <span>{quickActionNotice}</span>
            </div>
          )}
        </div>

        <div className="hero-stat-pill-group">
          <div className="hero-stat-pill">
            <span className="hero-pill-num">{totalComplaints}</span>
            <span className="hero-pill-lbl">Grievances Registered</span>
          </div>
          <div className="hero-stat-pill">
            <span className="hero-pill-num" style={{ color: '#10b981' }}>{resolvedCount}</span>
            <span className="hero-pill-lbl">Resolved Issues</span>
          </div>
        </div>
      </div>

      {/* Real-time Civic Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            📋
          </div>
          <div className="stat-value">{totalComplaints}</div>
          <div className="stat-label">Total Public Issues Logged</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            🚨
          </div>
          <div className="stat-value">{criticalCount}</div>
          <div className="stat-label">High / Critical Urgency</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            ✅
          </div>
          <div className="stat-value">{resolvedCount}</div>
          <div className="stat-label">Fixed & Municipal Resolved</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            ⚡
          </div>
          <div className="stat-value">{activeCount}</div>
          <div className="stat-label">Action In Progress</div>
        </div>
      </div>

      {/* 5 Enum Categories & Sub-Problems Directory Section */}
      <div id="categories-directory" className="civic-section">
        <div className="section-header-row">
          <div>
            <div className="section-eyebrow">MUNICIPAL SERVICES TAXONOMY</div>
            <h2 className="section-heading">Civic Problem Categories & Sub-Problem Breakdown</h2>
            <p className="section-subtitle">
              Select any category to view its sub-problems breakdown tree and report a specific issue with one click.
            </p>
          </div>
        </div>

        {/* The 5 Categories with their Sub-Problems Tree Hierarchy */}
        <div className="categories-cards-stack">
          {PROBLEM_CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onSelectCategory={(categoryTitle) => handleOpenReportModal(categoryTitle)}
              onSelectSubProblem={(categoryTitle, subProblemName) =>
                handleOpenReportModal(categoryTitle, subProblemName)
              }
            />
          ))}
        </div>
      </div>

      {/* Live Grievances List & Status Tracker */}
      <div id="grievances-ledger" className="civic-section">
        {deleteNotice && (
          <div className="alert-box alert-success" style={{ marginBottom: '1rem' }}>
            <span>✓</span>
            <span>{deleteNotice}</span>
          </div>
        )}
        <RecentComplaints
          complaints={complaints}
          onUpvote={handleUpvote}
          onOpenReportModal={handleOpenReportModal}
          onDeleteComplaint={handleDeleteComplaint}
          currentUser={currentUser}
        />
      </div>

      {/* Report Problem Modal Form */}
      <ReportProblemModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setModalInitialSubProblem('')
        }}
        initialCategory={modalInitialCategory}
        initialSubProblem={modalInitialSubProblem}
        user={currentUser}
      />
    </div>
  )
}
  