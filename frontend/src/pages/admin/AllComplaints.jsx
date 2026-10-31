import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import adminService from '../../services/adminService'
import AdminLayout from '../../components/common/AdminLayout'
import ComplaintTable from '../../components/admin/ComplaintTable'
import ComplaintFilters from '../../components/admin/ComplaintFilters'
import StatusUpdateModal from '../../components/admin/StatusUpdateModal'
import PriorityUpdateModal from '../../components/admin/PriorityUpdateModal'

export const AllComplaints = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const urlStatus = searchParams.get('status')
  const urlPriority = searchParams.get('priority')
  const urlCategory = searchParams.get('category')

  const [filters, setFilters] = useState({
    search: '',
    status: urlStatus || 'ALL',
    priority: urlPriority || 'ALL',
    category: urlCategory || 'All',
    city: '',
    sortOrder: 'desc',
    sortBy: 'createdAt',
  })

  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [complaints, setComplaints] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Auto-refresh interval (polling) toggle: 20 seconds
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false)
  const pollingTimerRef = useRef(null)

  // Action Modals
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [priorityModalOpen, setPriorityModalOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [actionToast, setActionToast] = useState('')

  // Sync state with URL params if URL changes
  useEffect(() => {
    if (urlStatus && urlStatus !== filters.status) {
      setFilters((prev) => ({ ...prev, status: urlStatus }))
      setPage(1)
    }
    if (urlPriority && urlPriority !== filters.priority) {
      setFilters((prev) => ({ ...prev, priority: urlPriority }))
      setPage(1)
    }
  }, [urlStatus, urlPriority, filters.status, filters.priority])

  // Fetch complaints from backend API
  const fetchComplaints = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setIsLoading(true)
      setErrorMessage('')

      try {
        const query = {
          page,
          limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        }

        if (filters.search && filters.search.trim()) {
          query.search = filters.search.trim()
        }
        if (filters.status && filters.status !== 'ALL') {
          query.status = filters.status
        }
        if (filters.priority && filters.priority !== 'ALL') {
          query.priority = filters.priority
        }
        if (filters.category && filters.category !== 'All') {
          query.category = filters.category
        }
        if (filters.city && filters.city.trim()) {
          query.city = filters.city.trim()
        }

        const res = await adminService.getAllComplaints(query)

        if (res && res.data) {
          setComplaints(res.data)
          if (res.pagination) {
            setPagination(res.pagination)
          }
        } else {
          setComplaints([])
        }
      } catch (err) {
        console.error('Failed to fetch admin complaints:', err)
        setErrorMessage(
          err.response?.data?.message || 'Error fetching complaints from MongoDB backend.'
        )
      } finally {
        if (!isBackground) setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [page, limit, filters]
  )

  useEffect(() => {
    fetchComplaints()
  }, [fetchComplaints])

  // Setup auto-refresh polling every 20 seconds, with cleanup on unmount
  useEffect(() => {
    if (autoRefreshEnabled) {
      pollingTimerRef.current = setInterval(() => {
        fetchComplaints(true)
      }, 20000)
    } else {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current)
        pollingTimerRef.current = null
      }
    }

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current)
      }
    }
  }, [autoRefreshEnabled, fetchComplaints])

  const handleManualRefresh = () => {
    setIsRefreshing(true)
    fetchComplaints(false)
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'ALL',
      priority: 'ALL',
      category: 'All',
      city: '',
      sortOrder: 'desc',
      sortBy: 'createdAt',
    })
    setSearchParams({})
    setPage(1)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Quick Status Update
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
      fetchComplaints(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update complaint status')
    } finally {
      setActionSubmitting(false)
    }
  }

  // Quick Priority Update
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
      fetchComplaints(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update complaint priority')
    } finally {
      setActionSubmitting(false)
    }
  }

  return (
    <AdminLayout
      pageTitle="All Citizen Complaints"
      onRefresh={handleManualRefresh}
      isRefreshing={isRefreshing}
    >
      {/* Toast Alert */}
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

      {/* Top Header bar with Auto-Refresh Toggle */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', margin: '0 0 0.25rem 0' }}>
            Complaint Management Registry
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            Inspect, filter, verify, and resolve all municipal grievances submitted by citizens.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Auto Refresh Toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.82rem',
              color: '#cbd5e1',
              cursor: 'pointer',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <input
              type="checkbox"
              checked={autoRefreshEnabled}
              onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Auto-Refresh (20s)</span>
            {autoRefreshEnabled && (
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  animation: 'pulse 1s infinite',
                }}
              />
            )}
          </label>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="alert-box alert-error" style={{ marginBottom: '1.25rem' }}>
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <ComplaintFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Table */}
      <ComplaintTable
        complaints={complaints}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onQuickUpdateStatus={handleOpenStatusModal}
        onQuickUpdatePriority={handleOpenPriorityModal}
      />

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

export default AllComplaints
