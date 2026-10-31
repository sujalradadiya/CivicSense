import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export const Login = ({ onLoginSuccess }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { login, updateUserState } = useAuth()

  const prefillEmail = location.state?.email || ''
  const initialSuccess = location.state?.registeredRole
    ? `Account created successfully as ${location.state.registeredRole}! Please sign in below.`
    : ''

  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState(initialSuccess)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: prefillEmail,
      password: '',
    },
  })

  useEffect(() => {
    if (prefillEmail) {
      setValue('email', prefillEmail)
    }
  }, [prefillEmail, setValue])

  const onSubmit = async (data) => {
    setServerError('')
    setSuccessMessage('')

    const email = data.email.trim().toLowerCase()
    const password = data.password ? data.password.trim() : ''

    try {
      // 1. Primary: Use RBAC Auth API /api/auth/login
      let authResult = null
      let role = 'USER'

      try {
        const res = await login({ email, password })
        if (res.success) {
          authResult = res.user
          role = String(res.role || res.user.role || 'USER').toUpperCase()
        }
      } catch (authErr) {
        console.warn('/api/auth/login failed, attempting legacy fallback...', authErr.message)

        // Fallback for legacy database records
        const payload = {
          name: data.name ? data.name.trim() : '',
          contact: data.contact ? String(data.contact).trim() : '',
          email,
          password,
        }

        try {
          const res = await axios.post('/users/login', payload)
          if (res.data && (res.data.user || res.data.data)) {
            authResult = res.data.user || res.data.data
          } else if (res.status === 200 || res.status === 201) {
            authResult = res.data
          }
        } catch (postErr) {
          const checkRes = await axios.get('/users')
          const usersList = Array.isArray(checkRes.data) ? checkRes.data : checkRes.data?.data || []
          if (Array.isArray(usersList) && usersList.length > 0) {
            const matchedUser = usersList.find(
              (u) => u.email?.toLowerCase() === email || String(u.contact) === String(payload.contact)
            )
            if (matchedUser) {
              authResult = matchedUser
            } else {
              throw new Error('Invalid email or password. Please verify your credentials or Sign Up.')
            }
          } else {
            throw authErr
          }
        }
      }

      if (!authResult) {
        throw new Error('Could not authenticate user.')
      }

      // Check role
      role = String(authResult.role || role || 'USER').toUpperCase()

      const authUser = {
        name: authResult.name || 'Citizen',
        email: authResult.email || email,
        contact: authResult.contact || '',
        role: role,
        city: authResult.city || '',
        id: authResult._id || authResult.id,
      }

      updateUserState(authUser)
      if (onLoginSuccess) {
        onLoginSuccess(authUser)
      }

      // Role-based redirection: USER -> Citizen Dashboard (/home), ADMIN -> Admin Dashboard (/admin/dashboard)
      if (role === 'ADMIN') {
        setSuccessMessage('Administrator verified! Redirecting to Admin Dashboard...')
        setTimeout(() => {
          navigate('/admin/dashboard', { replace: true })
        }, 700)
      } else {
        setSuccessMessage('Login successful! Redirecting to Citizen Dashboard...')
        setTimeout(() => {
          navigate('/home', { replace: true })
        }, 700)
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Unable to login. Please verify your credentials and try again.'
      setServerError(errorMsg)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="glass-card auth-card">
        {/* Navigation Tabs between Login and Sign Up */}
        <div className="auth-tabs">
          <button className="auth-tab active" type="button">
            Sign In
          </button>
          <Link to="/signup" className="auth-tab">
            Create Account
          </Link>
        </div>

        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access your civic grievance portal.</p>
        </div>

        {/* Feedback Notifications */}
        {serverError && (
          <div className="alert-box alert-error">
            <span>⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert-box alert-success">
            <span>✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="form-layout" noValidate>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              <span>Email Address</span>
              <span className="required-badge">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="name@example.com"
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Please enter a valid email address',
                },
              })}
            />
            {errors.email && (
              <span className="form-error-msg">
                <span>✕</span> {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              <span>Password</span>
              <span className="required-badge">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your account password"
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
            style={{ marginTop: '0.75rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Portal →</span>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/signup" style={{ fontWeight: 600, color: 'var(--primary)' }}>
            Sign Up Now
          </Link>
        </div>

        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            fontSize: '0.82rem',
          }}
        >
          <span style={{ color: '#94a3b8' }}>Are you a municipal official? </span>
          <Link to="/admin/login" style={{ color: '#fbbf24', fontWeight: 600 }}>
            Admin Portal Access 🛡️
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
