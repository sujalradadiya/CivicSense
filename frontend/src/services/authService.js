import api from './api'

export const authService = {
  /**
   * User/Admin Login
   * POST /api/auth/login
   */
  async login(credentials) {
    const response = await api.post('/api/auth/login', credentials)
    if (response.data?.token) {
      this.saveSession(response.data.token, response.data.user)
    }
    return response.data
  },

  /**
   * Citizen Registration
   * POST /api/auth/signup
   */
  async citizenSignup(userData) {
    const response = await api.post('/api/auth/signup', userData)
    if (response.data?.token) {
      this.saveSession(response.data.token, response.data.user)
    }
    return response.data
  },

  /**
   * Admin Registration via Single-Use Invitation Token
   * POST /api/auth/admin-signup
   */
  async adminSignup(adminData) {
    const response = await api.post('/api/auth/admin-signup', adminData)
    if (response.data?.token) {
      this.saveSession(response.data.token, response.data.user)
    }
    return response.data
  },

  /**
   * Get Current Authenticated Profile from Backend
   * GET /api/auth/profile
   */
  async getProfile() {
    const response = await api.get('/api/auth/profile')
    if (response.data?.user) {
      // Keep stored user updated with verified backend data
      const token = this.getToken()
      if (token) {
        this.saveSession(token, response.data.user)
      }
    }
    return response.data
  },

  /**
   * Update Profile
   * PUT /api/auth/profile
   */
  async updateProfile(updates) {
    const response = await api.put('/api/auth/profile', updates)
    return response.data
  },

  /**
   * Helper to persist session in localStorage
   */
  saveSession(token, user) {
    if (token) {
      localStorage.setItem('civicsense_token', token)
      localStorage.setItem('token', token)
    }
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user))
    }
  },

  /**
   * Clear session
   */
  clearSession() {
    localStorage.removeItem('civicsense_token')
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
  },

  /**
   * Retrieve active token
   */
  getToken() {
    return localStorage.getItem('civicsense_token') || localStorage.getItem('token') || null
  },

  /**
   * Retrieve local cached user
   */
  getStoredUser() {
    try {
      const stored = localStorage.getItem('currentUser')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  },
}

export default authService
