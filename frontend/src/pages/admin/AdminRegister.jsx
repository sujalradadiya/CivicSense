import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export const AdminRegister = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const { adminRegister } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const prefill = location.state?.prefill || {}

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: prefill.name || '',
      email: prefill.email || '',
      contact: prefill.contact || '',
      city: prefill.city || '',
      invitationToken: '',
    },
  })

  const onSubmit = async (data) => {
    setServerError('')
    setSuccessMessage('')

    const payload = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      contact: String(data.contact).trim(),
      city: data.city ? data.city.trim() : '',
      invitationToken: data.invitationToken.trim(),
    }

    try {
      const result = await adminRegister(payload)

      if (result.success) {
        setSuccessMessage('Administrator verified and registered! Redirecting to Dashboard...')
        setTimeout(() => {
          navigate('/admin/dashboard', { replace: true })
        }, 800)
      } else {
        setServerError(result.message || 'Invitation verification failed.')
      }
    } catch (err) {
      console.error('Admin signup error:', err)
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to verify administrative invitation.'
      setServerError(msg)
    }
  }

  return (
    <div className="auth-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card auth-card-wide" style={{ maxWidth: '580px', width: '100%', margin: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              marginBottom: '0.75rem',
            }}
          >
            📜
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#fff', margin: '0 0 0.4rem 0' }}>
            Administrator Invitation Signup
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            Enter your authorized municipal single-use invitation token to complete setup.
          </p>
        </div>

        {/* Security Warning Notice */}
        <div
          style={{
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#a5b4fc',
            fontSize: '0.82rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
          }}
        >
          <span>🔒</span>
          <span>
            Public admin self-registration is disabled. You must possess a cryptographic single-use invitation token
            issued by the CivicSense Department.
          </span>
        </div>

        {serverError && (
          <div className="alert-box alert-error" style={{ marginBottom: '1.25rem' }}>
            <span>⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert-box alert-success" style={{ marginBottom: '1.25rem' }}>
            <span>✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="form-layout" noValidate>
          {/* Invitation Token (Mandatory) */}
          <div className="form-group">
            <label className="form-label" htmlFor="invitationToken">
              <span>Single-Use Invitation Token</span>
              <span className="required-badge">* (Required)</span>
            </label>
            <input
              id="invitationToken"
              type="text"
              className="form-input"
              placeholder="e.g. 64a7f8b9c... or cryptographic token"
              style={{ fontFamily: 'monospace', borderColor: '#fbbf24' }}
              {...register('invitationToken', {
                required: 'A verified invitation token is mandatory',
              })}
            />
            {errors.invitationToken && (
              <span className="form-error-msg">
                <span>✕</span> {errors.invitationToken.message}
              </span>
            )}
          </div>

          {/* Row 1: Name and Email */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="admin-name">
                <span>Full Name</span>
                <span className="required-badge">*</span>
              </label>
              <input
                id="admin-name"
                type="text"
                className="form-input"
                placeholder="Officer Name"
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Minimum 2 characters' },
                })}
              />
              {errors.name && (
                <span className="form-error-msg">
                  <span>✕</span> {errors.name.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-email">
                <span>Invited Email Address</span>
                <span className="required-badge">*</span>
              </label>
              <input
                id="admin-email"
                type="email"
                className="form-input"
                placeholder="official@municipality.gov"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Please provide a valid email format',
                  },
                })}
              />
              {errors.email && (
                <span className="form-error-msg">
                  <span>✕</span> {errors.email.message}
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Contact and City */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="admin-contact">
                <span>Official Contact Number</span>
                <span className="required-badge">*</span>
              </label>
              <input
                id="admin-contact"
                type="tel"
                className="form-input"
                placeholder="e.g. 9876543210"
                {...register('contact', {
                  required: 'Contact number is required',
                })}
              />
              {errors.contact && (
                <span className="form-error-msg">
                  <span>✕</span> {errors.contact.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-city">
                <span>Assigned Municipal City</span>
                <span className="required-badge">*</span>
              </label>
              <input
                id="admin-city"
                type="text"
                className="form-input"
                placeholder="e.g. Ahmedabad"
                {...register('city', { required: 'City is required' })}
              />
              {errors.city && (
                <span className="form-error-msg">
                  <span>✕</span> {errors.city.message}
                </span>
              )}
            </div>
          </div>

          {/* Password with Show/Hide */}
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              <span>Create Administrator Password</span>
              <span className="required-badge">* (Min 6 chars)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Create strong admin password"
                style={{ paddingRight: '45px' }}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && (
              <span className="form-error-msg">
                <span>✕</span> {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
            style={{ marginTop: '0.75rem', height: '44px', fontWeight: 600 }}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                <span>Verifying Token & Registering...</span>
              </>
            ) : (
              <span>Complete Admin Registration →</span>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
          Already have an active admin account?{' '}
          <Link to="/admin/login" style={{ color: '#fbbf24', fontWeight: 600 }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminRegister
