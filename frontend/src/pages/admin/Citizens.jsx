import React, { useState, useEffect, useCallback } from 'react'
import adminService from '../../services/adminService'
import AdminLayout from '../../components/common/AdminLayout'
import CitizenDetailsModal from './CitizenDetailsModal'
import Loader from '../../components/common/Loader'

export const Citizens = () => {
  const [citizens, setCitizens] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')

  // Modal View
  const [selectedCitizenId, setSelectedCitizenId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchCitizens = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const query = {
        page,
        limit: 10,
      }
      if (search && search.trim()) query.search = search.trim()
      if (cityFilter && cityFilter.trim()) query.city = cityFilter.trim()

      const res = await adminService.getAllCitizens(query)
      if (res && res.data) {
        setCitizens(res.data)
        if (res.pagination) {
          setPagination(res.pagination)
        }
      } else {
        setCitizens([])
      }
    } catch (err) {
      console.error('Failed to fetch citizens:', err)
      setError(err.response?.data?.message || 'Failed to fetch registered citizens.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [page, search, cityFilter])

  useEffect(() => {
    fetchCitizens()
  }, [fetchCitizens])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchCitizens()
  }

  const handleOpenCitizen = (citizenId) => {
    setSelectedCitizenId(citizenId)
    setModalOpen(true)
  }

  return (
    <AdminLayout pageTitle="Citizen Directory" onRefresh={handleRefresh} isRefreshing={isRefreshing}>
      {/* Top Description bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', margin: '0 0 0.25rem 0' }}>
            Registered Citizen Accounts
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            Inspect citizen activity, verify account contact information, and review past grievances.
          </p>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="alert-box alert-error" style={{ marginBottom: '1.25rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          borderRadius: '14px',
          marginBottom: '1.5rem',
          background: 'rgba(18, 24, 38, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ flex: 2, minWidth: '220px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
            Search Citizens (Name, Email, Contact, City)
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Search citizen name or contact..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            style={{ width: '100%', height: '38px', fontSize: '0.88rem' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: '160px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
            Filter by City
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Ahmedabad, Surat"
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value)
              setPage(1)
            }}
            style={{ width: '100%', height: '38px', fontSize: '0.88rem' }}
          />
        </div>

        <div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSearch('')
              setCityFilter('')
              setPage(1)
            }}
            style={{ height: '38px' }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Loader message="Loading registered citizens..." />
      ) : citizens.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center', borderRadius: '14px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>👥</div>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Citizens Found</h3>
          <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '0 auto' }}>
            No registered citizens match your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    fontSize: '0.72rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  <th style={{ padding: '0.9rem 1rem' }}>Citizen Name</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Email Address</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Contact</th>
                  <th style={{ padding: '0.9rem 1rem' }}>City</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Registered On</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Total Complaints</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Account Status</th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {citizens.map((c) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.025)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#f8fafc' }}>
                      {c.name}
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{c.email}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{c.contact}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>📍 {c.city}</td>
                    <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                      {c.registrationDate ? new Date(c.registrationDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          backgroundColor: 'rgba(99, 102, 241, 0.15)',
                          color: '#a5b4fc',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                        }}
                      >
                        {c.totalComplaints || 0}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor:
                            c.accountStatus === 'ACTIVE'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(244, 63, 94, 0.15)',
                          color: c.accountStatus === 'ACTIVE' ? '#34d399' : '#fb7185',
                          border: `1px solid ${
                            c.accountStatus === 'ACTIVE'
                              ? 'rgba(16, 185, 129, 0.3)'
                              : 'rgba(244, 63, 94, 0.3)'
                          }`,
                        }}
                      >
                        {c.accountStatus || 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenCitizen(c.id)}
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        View Profile & Issues →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> (
                {pagination.total} citizens)
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Citizen Details & History Modal */}
      <CitizenDetailsModal
        isOpen={modalOpen}
        citizenId={selectedCitizenId}
        onClose={() => setModalOpen(false)}
      />
    </AdminLayout>
  )
}

export default Citizens
