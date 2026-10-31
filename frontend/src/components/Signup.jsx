import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export const Signup = () => {
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      stateId: '',
      role: 'User',
    },
  })

  const SubmitHandler = async (data) => {
    setServerError('')
    setSuccessMessage('')

    const role = (data.role || 'User').trim().toUpperCase()
    const isAdmin = role === 'ADMIN'

    const payload = {
      name: data.name ? data.name.trim() : '',
      email: data.email ? data.email.trim().toLowerCase() : '',
      contact: data.contact ? String(data.contact).trim() : '',
      city: data.city ? data.city.trim() : '',
      age: data.age ? Number(data.age) : undefined,
      stateId: data.stateId || undefined,
      password: data.password ? data.password.trim() : '',
      role: isAdmin ? 'ADMIN' : 'USER',
    }

    try {
      // 1. Register with backend /api/auth/signup endpoint
      let isSuccess = false

      try {
        const res = await axios.post('/api/auth/signup', payload)
        if (res.status === 200 || res.status === 201) {
          isSuccess = true
        }
      } catch (authErr) {
        console.warn('/api/auth/signup failed, trying /users fallback...', authErr.message)

        // Fallback to /users endpoint
        const res = await axios.post('/users', payload)
        if (res.status === 200 || res.status === 201) {
          isSuccess = true
        }
      }

      if (isSuccess) {
        const roleLabel = isAdmin ? 'Admin' : 'User'
        setSuccessMessage(`Account created successfully as ${roleLabel}! Redirecting to Login...`)
        reset()

        // Redirect to Login page so user logs in with their credentials
        setTimeout(() => {
          navigate('/login', {
            state: {
              email: payload.email,
              registeredRole: roleLabel,
            },
          })
        }, 900)
      } else {
        setServerError('Registration failed. Please check details and try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      if (error.response) {
        const msg =
          error.response.data?.message ||
          error.response.data?.error ||
          JSON.stringify(error.response.data)
        setServerError(`Registration Error: ${msg}`)
      } else {
        setServerError(`Error: ${error.message}`)
      }
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="glass-card auth-card-wide">
        {/* Navigation Tabs between Login and Sign Up */}
        <div className="auth-tabs">
          <Link to="/login" className="auth-tab">
            Sign In
          </Link>
          <button className="auth-tab active" type="button">
            Create Account
          </button>
        </div>

        <div className="auth-header">
          <h2>Join Our Platform</h2>
          <p>Create your verified profile with your contact & email.</p>
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

        <form onSubmit={handleSubmit(SubmitHandler)} className="form-layout" noValidate>
          {/* Form Grid: Row 1 */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                <span>Full Name</span>
                <span className="required-badge">*</span>
              </label>
              <input
                type="text"
                id="name"
                className="form-input"
                placeholder="Enter full name"
                {...register('name', {
                  required: 'Full name is required',
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
              <label className="form-label" htmlFor="age">
                <span>Age</span>
              </label>
              <input
                type="number"
                id="age"
                className="form-input"
                min="1"
                max="120"
                placeholder="Enter age (e.g. 24)"
                {...register('age', {
                  min: { value: 1, message: 'Age must be positive' },
                  max: { value: 120, message: 'Age must be valid' },
                })}
              />
              {errors.age && (
                <span className="form-error-msg">
                  <span>✕</span> {errors.age.message}
                </span>
              )}
            </div>
          </div>

          {/* Form Grid: Row 2 */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="contact">
                <span>Contact Number</span>
                <span className="required-badge">* (Unique)</span>
              </label>
              <input
                type="tel"
                id="contact"
                className="form-input"
                placeholder="e.g. 9876543210"
                {...register('contact', {
                  required: 'Contact number is required',
                  pattern: {
                    value: /^[0-9+ -]{7,15}$/,
                    message: 'Enter a valid phone/contact number',
                  },
                })}
              />
              {errors.contact && (
                <span className="form-error-msg">
                  <span>✕</span> {errors.contact.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                <span>Email Address</span>
                <span className="required-badge">* (Unique)</span>
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="name@example.com"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Enter a valid email address',
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

          {/* Form Grid: Row 3 */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="city">
                <span>City</span>
                <span className="required-badge">*</span>
              </label>
              <input
                type="text"
                id="city"
                className="form-input"
                placeholder="Enter your city"
                {...register('city', { required: 'City is required' })}
              />
              {errors.city && (
                <span className="form-error-msg">
                  <span>✕</span> {errors.city.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="stateId">
                <span>State</span>
                <span className="required-badge">*</span>
              </label>
              <select
                id="stateId"
                className="form-select"
                defaultValue=""
                {...register('stateId', { required: 'Please select a state' })}
              >
                <option value="" disabled>
                  Select a state
                </option>
                <option value="64a7f8b9c1d2e3f4a5b6c7d8">Gujarat</option>
                <option value="64a7f8b9c1d2e3f4a5b6c7d9">Maharashtra</option>
                <option value="64a7f8b9c1d2e3f4a5b6c7da">Delhi</option>
                <option value="64a7f8b9c1d2e3f4a5b6d7da">Karnataka</option>
                <option value="64a7f8b9c1d2e3f4a5b6c7da">Telangana</option>
              </select>
              {errors.stateId && (
                <span className="form-error-msg">
                  <span>✕</span> {errors.stateId.message}
                </span>
              )}
            </div>
          </div>

          {/* Form Grid: Row 4 */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                <span>Password</span>
                <span className="required-badge">* (Min 6 chars)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input"
                  placeholder="Create a password"
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

            {/* Account Role: User or Admin */}
            <div className="form-group">
              <label className="form-label" htmlFor="role">
                <span>Account Role</span>
                <span className="required-badge">*</span>
              </label>
              <select
                id="role"
                className="form-select"
                defaultValue="User"
                {...register('role')}
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
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
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account →</span>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary)' }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Signup
