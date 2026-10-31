import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (data) => {
    setServerError('')
    setSuccessMessage('')

    const payload = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    }

    try {
      const result = await login(payload)

      if (result.success) {
        if (result.role === 'ADMIN') {
          setSuccessMessage('Administrator verified! Redirecting to Admin Dashboard...')
          setTimeout(() => {
            const destination = location.state?.from?.pathname || '/admin/dashboard'
            navigate(destination, { replace: true })
          }, 600)
        } else {
          // If a USER logs in through the admin portal, redirect to citizen dashboard
          setSuccessMessage('Logged in as Citizen. Redirecting to Citizen Dashboard...')
          setTimeout(() => {
            navigate('/home', { replace: true })
          }, 800)
        }
      } else {
        setServerError(result.message || 'Invalid administrator credentials.')
      }
    } catch (err) {
      console.error('Admin login error:', err)
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Administrative authentication failed. Please verify credentials.'
      setServerError(msg)
    }
  }

  return (
    <div className="auth-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card auth-card" style={{ maxWidth: '440px', width: '100%', margin: '1.5rem' }}>
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
            🛡️
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#fff', margin: '0 0 0.4rem 0' }}>Admin Portal Login</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            CivicSense Smart City Administrative & Redressal Console
          </p>
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
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">
              <span>Admin Email</span>
              <span className="required-badge">*</span>
            </label>
            <input
              id="admin-email"
              type="email"
              className="form-input"
              placeholder="admin@civicsence.com"
              {...register('email', {
                required: 'Administrator email is required',
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

          {/* Password with Show/Hide */}
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              <span>Security Password</span>
              <span className="required-badge">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter admin password"
                style={{ paddingRight: '45px' }}
                {...register('password', {
                  required: 'Password is required',
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
            style={{ marginTop: '1rem', height: '44px', fontWeight: 600 }}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                <span>Authenticating Administrator...</span>
              </>
            ) : (
              <span>Authorize & Sign In →</span>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            textAlign: 'center',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ color: '#94a3b8' }}>
            Need an account?{' '}
            <Link to="/signup" style={{ color: '#fbbf24', fontWeight: 600 }}>
              Create Account Here
            </Link>
          </div>
          <div style={{ color: '#64748b' }}>
            Looking for public citizen services?{' '}
            <Link to="/login" style={{ color: 'var(--primary, #6366f1)', fontWeight: 600 }}>
              Citizen Portal Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
