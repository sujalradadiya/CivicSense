import React, { useState } from 'react'
import adminService from '../../services/adminService'
import AdminLayout from '../../components/common/AdminLayout'
import PriorityBadge from '../../components/admin/PriorityBadge'

export const AIAnalysis = () => {
  const [complaintIdInput, setComplaintIdInput] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchedId, setSearchedId] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchError, setSearchError] = useState('')

  const handleSearchAI = async (e) => {
    e.preventDefault()
    if (!complaintIdInput.trim()) return

    setIsSearching(true)
    setSearchError('')
    setHasSearched(true)
    setSearchedId(complaintIdInput.trim())

    try {
      const res = await adminService.getComplaintAIAnalysis(complaintIdInput.trim())
      if (res && res.available && res.data) {
        setAiResult(res.data)
      } else {
        setAiResult(null)
      }
    } catch (err) {
      console.warn('AI analysis search error:', err)
      setAiResult(null)
      setSearchError(err.response?.data?.message || 'Complaint not found or backend AI service unavailable.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <AdminLayout pageTitle="AI Agent Intelligence & Inspection">
      {/* Top Banner explaining future integration and admin authority */}
      <div
        className="glass-card"
        style={{
          padding: '1.5rem 1.75rem',
          borderRadius: '16px',
          marginBottom: '1.75rem',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.6rem' }}>🤖</span>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', margin: 0 }}>
            AI Advisory Integration Architecture (Readiness Module)
          </h2>
        </div>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
          This interface is structured to ingest automated predictions from municipal AI microservices.
          <strong style={{ color: '#fbbf24' }}>
            {' '}
            Important: AI recommendations are purely advisory. Certified municipal administrators retain sole and
            final authority over verification, priority scoring, and issue resolution.
          </strong>
        </p>
      </div>

      {/* Query Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1.5rem',
          borderRadius: '14px',
          marginBottom: '1.75rem',
          background: 'rgba(18, 24, 38, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <form onSubmit={handleSearchAI} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
              Query AI Analysis for Complaint
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Complaint ID (e.g. CIV-123456 or Mongo ID)"
              value={complaintIdInput}
              onChange={(e) => setComplaintIdInput(e.target.value)}
              style={{ width: '100%', height: '42px' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSearching || !complaintIdInput.trim()}
            style={{ height: '42px', padding: '0 1.5rem' }}
          >
            {isSearching ? 'Querying Backend...' : 'Inspect AI Recommendations →'}
          </button>
        </form>

        {searchError && (
          <div className="alert-box alert-error" style={{ marginTop: '1rem' }}>
            <span>⚠️</span>
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* 4 Agent Architecture Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Agent 1: Complaint Classification Agent */}
        <div
          className="glass-card"
          style={{
            padding: '1.5rem',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.3rem' }}>🏷️</span>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>1. Complaint Classification Agent</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 1rem 0' }}>
            Analyzes complaint description and citizen terminology to predict municipal category and sub-problems.
          </p>

          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Predicted Category</div>
            {aiResult?.category ? (
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#a5b4fc', marginTop: '0.25rem' }}>
                {aiResult.category}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.25rem' }}>
                AI analysis not available yet
              </div>
            )}
          </div>
        </div>

        {/* Agent 2: Priority Assessment Agent */}
        <div
          className="glass-card"
          style={{
            padding: '1.5rem',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.3rem' }}>🚨</span>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>2. Priority Assessment Agent</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 1rem 0' }}>
            Evaluates public safety risk, structural hazard, and urgency based on citizen statements and location.
          </p>

          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Suggested Priority</div>
            {aiResult?.suggestedPriority ? (
              <div style={{ marginTop: '0.4rem' }}>
                <PriorityBadge priority={aiResult.suggestedPriority} />
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.25rem' }}>
                AI analysis not available yet
              </div>
            )}
          </div>
        </div>

        {/* Agent 3: Complaint Verification Agent */}
        <div
          className="glass-card"
          style={{
            padding: '1.5rem',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.3rem' }}>🔍</span>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>3. Complaint Verification Agent</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 1rem 0' }}>
            Inspects uploaded photographs via computer vision to detect spam, duplicates, or verify physical damage.
          </p>

          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Verification Recommendation
            </div>
            {aiResult?.verificationResult ? (
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#34d399', marginTop: '0.25rem' }}>
                {aiResult.verificationResult}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.25rem' }}>
                AI analysis not available yet
              </div>
            )}
          </div>
        </div>

        {/* Agent 4: Department Routing Agent */}
        <div
          className="glass-card"
          style={{
            padding: '1.5rem',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.3rem' }}>🏢</span>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>4. Department Routing Agent</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 1rem 0' }}>
            Matches grievance jurisdiction to appropriate municipal authorities (Roads, Water, Sanitation, Electrical).
          </p>

          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Suggested Department
            </div>
            {aiResult?.suggestedDepartment ? (
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#22d3ee', marginTop: '0.25rem' }}>
                {aiResult.suggestedDepartment}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.25rem' }}>
                AI analysis not available yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confidence and Timestamp (if present from backend) */}
      {hasSearched && (
        <div
          className="glass-card"
          style={{
            padding: '1.5rem',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.5rem' }}>
            Query Results for: <span style={{ fontFamily: 'monospace', color: '#818cf8' }}>{searchedId}</span>
          </h4>

          {aiResult ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Confidence Score</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399', marginTop: '0.2rem' }}>
                  {aiResult.confidence ? `${(aiResult.confidence * 100).toFixed(1)}%` : 'N/A'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Analysis Date</span>
                <div style={{ fontSize: '0.92rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                  {aiResult.analyzedAt ? new Date(aiResult.analyzedAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                marginTop: '1rem',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>ℹ️</div>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                AI analysis not available yet for this complaint.
              </p>
              <p style={{ color: '#64748b', margin: '0.4rem 0 0 0', fontSize: '0.8rem' }}>
                Backend AI processing pipeline is pending deployment in future phases.
              </p>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}

export default AIAnalysis
