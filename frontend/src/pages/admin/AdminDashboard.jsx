import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import adminService from '../../services/adminService'
import AdminLayout from '../../components/common/AdminLayout'
import DashboardCard from '../../components/admin/DashboardCard'
import ComplaintTable from '../../components/admin/ComplaintTable'
import StatusUpdateModal from '../../components/admin/StatusUpdateModal'
import PriorityUpdateModal from '../../components/admin/PriorityUpdateModal'

export const AdminDashboard = () => {
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [recentComplaints, setRecentComplaints] = useState([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Quick Action Modal states
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [priorityModalOpen, setPriorityModalOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [actionToast, setActionToast] = useState('')

  // Fetch Dashboard Stats from Backend
  const loadStats = useCallback(async () => {
    setIsLoadingStats(true)
    setErrorMessage('')
    try {
      const res = await adminService.getDashboardStats()
      if (res && res.data) {
        setStats(res.data)
      } else {
        setStats({
          totalUsers: 0,
          totalComplaints: 0,
          pending: 0,
          verified: 0,
          inProgress: 0,
          resolved: 0,
          rejected: 0,
          highPriority: 0,
        })
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err)
      setErrorMessage(
        err.response?.data?.message || 'Could not connect to backend to fetch live statistics.'
      )
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  // Fetch Recent Complaints
  const loadRecentComplaints = useCallback(async () => {
    setIsLoadingComplaints(true)
    try {
      const res = await adminService.getAllComplaints({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' })
      if (res && res.data) {
        setRecentComplaints(res.data)
      }
    } catch (err) {
      console.error('Failed to load recent complaints:', err)
    } finally {
      setIsLoadingComplaints(false)
    }
  }, [])

  // Combined Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([loadStats(), loadRecentComplaints()])
    setIsRefreshing(false)
  }

  useEffect(() => {
    loadStats()
    loadRecentComplaints()
  }, [loadStats, loadRecentComplaints])

  // Handle Quick Status Update from Table
  const handleOpenStatusModal = (complaint) => {
    setSelectedComplaint(complaint)
    setStatusModalOpen(true)
  }

  const handleSubmitStatus = async (payload) => {
    if (!selectedComplaint) return
    setActionSubmitting(true)
    try {
      const complaintId = selectedComplaint.id || selectedComplaint._id
      await adminService.updateComplaintStatus(complaintId, payload)
      setActionToast(`Complaint status updated to ${payload.status} successfully!`)
      setStatusModalOpen(false)
      setTimeout(() => setActionToast(''), 4000)
      // Refresh statistics and list
      loadStats()
      loadRecentComplaints()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update complaint status')
    } finally {
      setActionSubmitting(false)
    }
  }

  // Handle Quick Priority Update from Table
  const handleOpenPriorityModal = (complaint) => {
    setSelectedComplaint(complaint)
    setPriorityModalOpen(true)
  }

  const handleSubmitPriority = async (payload) => {
    if (!selectedComplaint) return
    setActionSubmitting(true)
    try {
      const complaintId = selectedComplaint.id || selectedComplaint._id
      await adminService.updateComplaintPriority(complaintId, payload)
      setActionToast(`Complaint priority updated to ${payload.priority} successfully!`)
      setPriorityModalOpen(false)
      setTimeout(() => setActionToast(''), 4000)
      loadStats()
      loadRecentComplaints()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update complaint priority')
    } finally {
      setActionSubmitting(false)
    }
  }

  return (
    <AdminLayout pageTitle="Municipal Command Overview" onRefresh={handleRefresh} isRefreshing={isRefreshing}>
      {/* Toast Notification */}
      {actionToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#10b981',
            color: '#fff',
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          <span>✓</span>
          <span>{actionToast}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="alert-box alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span>
          <span>{errorMessage}</span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleRefresh}
            style={{ marginLeft: 'auto', padding: '0.2rem 0.6rem' }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Header welcome banner */}
      <div
        className="glass-card"
        style={{
          padding: '1.5rem 1.75rem',
          borderRadius: '16px',
          marginBottom: '1.75rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 0.35rem 0' }}>
            Smart City Grievance Redressal Control
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: 0 }}>
            Real-time complaint tracking, verification lifecycle and municipal resolution management.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/admin/complaints?status=PENDING')}
          >
            Review Pending ({stats?.pending || 0})
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/admin/users')}
          >
            Manage Citizens
          </button>
        </div>
      </div>

      {/* 8 Required Dashboard Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {/* 1. Total Citizens */}
        <DashboardCard
          title="Total Citizens"
          value={stats?.totalUsers}
          icon="👥"
          accentColor="#6366f1"
          subtitle="Registered resident accounts"
          isLoading={isLoadingStats}
          onClick={() => navigate('/admin/users')}
        />

        {/* 2. Total Complaints */}
        <DashboardCard
          title="Total Complaints"
          value={stats?.totalComplaints}
          icon="📋"
          accentColor="#3b82f6"
          subtitle="All recorded grievances"
          isLoading={isLoadingStats}
          onClick={() => navigate('/admin/complaints')}
        />

        {/* 3. Pending Complaints */}
        <DashboardCard
          title="Pending Verification"
          value={stats?.pending}
          icon="⏳"
          accentColor="#f59e0b"
          subtitle="Awaiting admin inspection"
          isLoading={isLoadingStats}
          onClick={() => navigate('/admin/complaints?status=PENDING')}
        />

        {/* 4. Verified Complaints */}
        <DashboardCard
          title="Verified Complaints"
          value={stats?.verified}
          icon="✓"
          accentColor="#8b5cf6"
          subtitle="Verified by municipality"
          isLoading={isLoadingStats}
          onClick={() => navigate('/admin/complaints?status=VERIFIED')}
        />

        {/* 5. In Progress */}
        <DashboardCard
          title="In Progress"
          value={stats?.inProgress}
          icon="⚙️"
          accentColor="#06b6d4"
          subtitle="Department work ongoing"
          isLoading={isLoadingStats}
          onClick={() => navigate('/admin/complaints?status=IN_PROGRESS')}
        />

        {/* 6. Resolved */}
        <DashboardCard
          title="Resolved Complaints"
          value={stats?.resolved}
          icon="✅"
          accentColor="#10b981"
          subtitle="Fully redressed issues"
          isLoading={isLoadingStats}
          onClick={() => navigate('/admin/complaints?status=RESOLVED')}
        />

        {/* 7. Rejected */}
        <DashboardCard
          title="Rejected Complaints"
          value={stats?.rejected}
          icon="✕"
          accentColor="#f43f5e"
          subtitle="Dismissed / Invalid issues"
          isLoading={isLoadingStats}
          onClick={() => navigate('/admin/complaints?status=REJECTED')}
        />

        {/* 8. High Priority Complaints */}
        <DashboardCard
          title="High / Critical Urgency"
          value={stats?.highPriority}
          icon="🚨"
          accentColor="#ef4444"
          subtitle="Immediate hazard tickets"
          isLoading={isLoadingStats}
          onClick={() => navigate('/admin/complaints?priority=HIGH')}
        />
      </div>

      {/* Recent Complaints Intake Section */}
      <div style={{ marginTop: '2.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: '0 0 0.25rem 0' }}>
              Recent Complaints Intake
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
              Latest citizen grievances submitted into the Smart City portal
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/admin/complaints')}
          >
            View All Complaints →
          </button>
        </div>

        <ComplaintTable
          complaints={recentComplaints}
          isLoading={isLoadingComplaints}
          onQuickUpdateStatus={handleOpenStatusModal}
          onQuickUpdatePriority={handleOpenPriorityModal}
        />
      </div>

      {/* Quick Status Modal */}
      <StatusUpdateModal
        isOpen={statusModalOpen}
        complaint={selectedComplaint}
        onClose={() => setStatusModalOpen(false)}
        onSubmit={handleSubmitStatus}
        isSubmitting={actionSubmitting}
      />

      {/* Quick Priority Modal */}
      <PriorityUpdateModal
        isOpen={priorityModalOpen}
        complaint={selectedComplaint}
        onClose={() => setPriorityModalOpen(false)}
        onSubmit={handleSubmitPriority}
        isSubmitting={actionSubmitting}
      />
    </AdminLayout>
  )
}

export default AdminDashboard
