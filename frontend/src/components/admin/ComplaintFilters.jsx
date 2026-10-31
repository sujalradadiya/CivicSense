import React from 'react'

const CATEGORIES = [
  'All',
  'Road Damage',
  'Street Lighting',
  'Garbage & Waste',
  'Water Supply',
  'Sewage & Drainage',
  'Public Transport',
  'Traffic & Signals',
  'Parks & Greenery',
  'Illegal Encroachment',
  'Noise Pollution',
  'Air Pollution',
  'Stray Animals',
  'Building Violations',
  'Public Toilet Sanitation',
  'Health & Mosquito Breeding',
  'Electricity Hazards',
  'Fire Hazard',
  'Footpath Encroachment',
  'Stormwater Inundation',
  'Heritage Damage',
]

const STATUSES = ['ALL', 'PENDING', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']
const PRIORITIES = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export const ComplaintFilters = ({
  filters,
  onChange,
  onReset,
  cities = [],
}) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '1.25rem',
        borderRadius: '14px',
        marginBottom: '1.5rem',
        background: 'rgba(18, 24, 38, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end',
        }}
      >
        {/* Search */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
            Search (Citizen Name, Email, Complaint ID, Title)
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Search keywords, CIV-123456, citizen name..."
            value={filters.search || ''}
            onChange={(e) => onChange('search', e.target.value)}
            style={{ width: '100%', height: '38px', fontSize: '0.88rem' }}
          />
        </div>

        {/* Status */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
            Status
          </label>
          <select
            className="form-select"
            value={filters.status || 'ALL'}
            onChange={(e) => onChange('status', e.target.value)}
            style={{ width: '100%', height: '38px', fontSize: '0.88rem' }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
            Priority
          </label>
          <select
            className="form-select"
            value={filters.priority || 'ALL'}
            onChange={(e) => onChange('priority', e.target.value)}
            style={{ width: '100%', height: '38px', fontSize: '0.88rem' }}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p === 'ALL' ? 'All Priorities' : p}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
            Category
          </label>
          <select
            className="form-select"
            value={filters.category || 'All'}
            onChange={(e) => onChange('category', e.target.value)}
            style={{ width: '100%', height: '38px', fontSize: '0.88rem' }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
            City
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Ahmedabad, Mumbai"
            value={filters.city || ''}
            onChange={(e) => onChange('city', e.target.value)}
            style={{ width: '100%', height: '38px', fontSize: '0.88rem' }}
          />
        </div>

        {/* Sort By Submission Date */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
            Sort Submission Date
          </label>
          <select
            className="form-select"
            value={filters.sortOrder || 'desc'}
            onChange={(e) => onChange('sortOrder', e.target.value)}
            style={{ width: '100%', height: '38px', fontSize: '0.88rem' }}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        <div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onReset}
            style={{ width: '100%', height: '38px' }}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  )
}

export default ComplaintFilters
