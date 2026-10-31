import React, { useState, useEffect } from 'react'
import { PROBLEM_CATEGORIES, CATEGORY_ENUM } from '../data/problemCategories'
import { addIssueToDatabase } from '../services/issueTypeService'

export const ReportProblemModal = ({
  isOpen,
  onClose,
  initialCategory,
  initialSubProblem,
  user,
  onComplaintSubmitted,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'Road Damage')
  const [selectedSubProblem, setSelectedSubProblem] = useState(initialSubProblem || '')
  const [location, setLocation] = useState('')
  const [urgency, setUrgency] = useState('High')
  const [description, setDescription] = useState('')
  const [landmark, setLandmark] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Sync category and subproblem when modal opens or initial props change
  useEffect(() => {
    if (!isOpen) return

    const validCat = initialCategory && CATEGORY_ENUM.includes(initialCategory)
      ? initialCategory
      : 'Road Damage'
    setSelectedCategory(validCat)

    const catData = PROBLEM_CATEGORIES.find((c) => c.title === validCat)
    const availableSubProblems = catData?.subProblems?.map((sp) => sp.name) || []

    if (initialSubProblem && availableSubProblems.includes(initialSubProblem)) {
      setSelectedSubProblem(initialSubProblem)
    } else if (availableSubProblems.length > 0) {
      setSelectedSubProblem(availableSubProblems[0])
    } else {
      setSelectedSubProblem('')
    }
    setErrorMessage('')
  }, [isOpen, initialCategory, initialSubProblem])

  // Get active category object
  const currentCatObj = PROBLEM_CATEGORIES.find((c) => c.title === selectedCategory) || PROBLEM_CATEGORIES[0]

  if (!isOpen) return null

  const handleCategoryChange = (catTitle) => {
    setSelectedCategory(catTitle)
    const catData = PROBLEM_CATEGORIES.find((c) => c.title === catTitle)
    if (catData && catData.subProblems && catData.subProblems.length > 0) {
      setSelectedSubProblem(catData.subProblems[0].name)
    } else {
      setSelectedSubProblem('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!location.trim()) {
      setErrorMessage('Please enter the street address or location.')
      return
    }

    if (!description.trim()) {
      setErrorMessage('Please describe the problem details.')
      return
    }

    setIsSubmitting(true)

    const complaintId = 'CIV-' + Math.floor(100000 + Math.random() * 900000)

    // Prepare the payload to be saved in the database
    const newComplaint = {
      id: complaintId,
      category: selectedCategory,
      subProblem: selectedSubProblem,
      location: location.trim(),
      landmark: landmark.trim(),
      urgency,
      description: description.trim(),
      status: 'Pending Verification',
      reportedBy: user?.name || 'Citizen Reporter',
      userContact: user?.contact || 'N/A',
      userEmail: user?.email || 'N/A',
      city: user?.city || 'Municipal Zone',
      createdAt: new Date().toISOString(),
      upvotes: 1,
    }

    try {
      // 1. POST complaint to database API via issueTypeService
      const result = await addIssueToDatabase(newComplaint)
      const savedComplaint = result.success ? result.data : newComplaint

      if (!result.success) {
        console.warn('Backend API save warning:', result.error)
      }

      // 2. Persist in local storage for instant offline UI
      const existing = JSON.parse(localStorage.getItem('civic_complaints') || '[]')
      const updated = [savedComplaint, ...existing]
      localStorage.setItem('civic_complaints', JSON.stringify(updated))

      // 3. Trigger parent callback
      if (onComplaintSubmitted) {
        onComplaintSubmitted(savedComplaint)
      }

      // 4. Also emit global custom event so any component (Home, App, Navbar) gets notified
      window.dispatchEvent(new CustomEvent('complaint-submitted', { detail: savedComplaint }))

      // Reset form fields and close modal
      setIsSubmitting(false)
      setLocation('')
      setDescription('')
      setLandmark('')
      onClose()
    } catch (err) {
      console.error('Error submitting issue to database:', err)
      const errorDetail = err.response?.data?.message || err.message || 'Unknown network error'
      setErrorMessage(`Failed to register complaint: ${errorDetail}`)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span className="modal-badge">MUNICIPAL GRIEVANCE DISPATCH</span>
            </div>
            <h2>Register Public Infrastructure Problem</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="modal-form">
          {errorMessage && (
            <div className="alert-box alert-error">
              <span>⚠️</span>
              <div>{errorMessage}</div>
            </div>
          )}

          {/* 1. Category Enum Selector */}
          <div className="form-group">
            <label className="form-label">
              <span>Select Problem Category (Enum):</span>
              <span className="required-badge">* Required</span>
            </label>
            <div className="cat-selector-pills">
              {PROBLEM_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.title
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.title)}
                    className={`cat-pill-btn ${isSelected ? 'selected' : ''}`}
                    style={{
                      '--pill-accent': cat.color,
                      '--pill-glow': cat.bgGlow,
                    }}
                  >
                    <span className="cat-pill-icon">{cat.icon}</span>
                    <span className="cat-pill-title">{cat.title}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Sub-Problem Selector */}
          <div className="form-group">
            <label className="form-label">
              <span>Sub-problem for "{selectedCategory}":</span>
              <span className="required-badge">* Required</span>
            </label>
            <div className="subproblem-selection-grid">
              {currentCatObj.subProblems.map((sub) => {
                const isSelected = selectedSubProblem === sub.name
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubProblem(sub.name)}
                    className={`subproblem-card-item ${isSelected ? 'active-sub' : ''}`}
                  >
                    <div className="subproblem-radio">
                      <div className={`radio-dot ${isSelected ? 'checked' : ''}`} />
                    </div>
                    <div className="subproblem-info">
                      <span className="subproblem-name">{sub.name}</span>
                      <span className="subproblem-tag">{sub.severity} Urgency</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 3. Location & Urgency Grid */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                <span>Location / Street Address:</span>
                <span className="required-badge">*</span>
              </label>
              <div className="input-with-button">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 5th Avenue, Crossroad 14"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
                {user?.city && (
                  <button
                    type="button"
                    className="input-inline-btn"
                    onClick={() => setLocation(user.city + ', Near Center')}
                    title="Insert User City"
                  >
                    📍 {user.city}
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Nearest Landmark:</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Opposite City Hospital / Near Metro Gate 2"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>
          </div>

          {/* 4. Priority & Reporter */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                <span>Urgency Priority Level:</span>
              </label>
              <select
                className="form-select"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
              >
                <option value="Low">🟢 Low — Cosmetic / Minor inconvenience</option>
                <option value="Medium">🟡 Medium — Requires inspection this week</option>
                <option value="High">🟠 High — Disruption to traffic or hygiene</option>
                <option value="Critical">🔴 Critical — Public safety or life hazard</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Reported By:</span>
              </label>
              <input
                type="text"
                className="form-input"
                disabled
                value={`${user?.name || 'Citizen'} (${user?.contact || user?.email || 'Active Resident'})`}
              />
            </div>
          </div>

          {/* 5. Detailed Description */}
          <div className="form-group">
            <label className="form-label">
              <span>Detailed Problem Description:</span>
              <span className="required-badge">*</span>
            </label>
            <textarea
              className="form-input form-textarea"
              rows="3"
              placeholder="Describe the severity, how long it has been present, if it blocks pedestrian/vehicle traffic, etc..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  <span>Transmitting Grievance...</span>
                </>
              ) : (
                <span>🚀 Dispatch Complaint to Civic Authority</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}