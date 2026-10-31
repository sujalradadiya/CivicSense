import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getStoredUser())
  const [token, setToken] = useState(() => authService.getToken())
  const [isLoading, setIsLoading] = useState(true)

  // Verify and refresh user profile with backend on mount
  const refreshProfile = useCallback(async () => {
    const currentToken = authService.getToken()
    if (!currentToken) {
      setUser(null)
      setToken(null)
      setIsLoading(false)
      return null
    }

    try {
      const data = await authService.getProfile()
      if (data?.user) {
        setUser(data.user)
        setToken(currentToken)
        return data.user
      }
    } catch (err) {
      console.warn('Backend profile verification failed:', err?.response?.data?.message || err.message)
      // If 401 Unauthorized, token is definitely invalid
      if (err?.response?.status === 401) {
        authService.clearSession()
        setUser(null)
        setToken(null)
      }
    } finally {
      setIsLoading(false)
    }
    return null
  }, [])

  useEffect(() => {
    refreshProfile()

    // Listen for global 401 unauthorized events from Axios interceptor
    const handleUnauthorized = () => {
      setUser(null)
      setToken(null)
    }
    window.addEventListener('civicsense-unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('civicsense-unauthorized', handleUnauthorized)
    }
  }, [refreshProfile])

  // Common Login Handler for USER and ADMIN
  const login = async (credentials) => {
    const data = await authService.login(credentials)
    if (data?.token && data?.user) {
      setToken(data.token)
      setUser(data.user)
      return {
        success: true,
        user: data.user,
        role: data.user.role,
        token: data.token,
      }
    }
    return { success: false, message: data?.message || 'Login failed' }
  }

  // Admin Registration via Invitation
  const adminRegister = async (adminData) => {
    const data = await authService.adminSignup(adminData)
    if (data?.token && data?.user) {
      setToken(data.token)
      setUser(data.user)
      return {
        success: true,
        user: data.user,
        role: data.user.role,
      }
    }
    return { success: false, message: data?.message || 'Admin registration failed' }
  }

  // Citizen Registration
  const citizenRegister = async (userData) => {
    const data = await authService.citizenSignup(userData)
    if (data?.token && data?.user) {
      setToken(data.token)
      setUser(data.user)
      return {
        success: true,
        user: data.user,
        role: data.user.role,
      }
    }
    return { success: false, message: data?.message || 'Registration failed' }
  }

  // Logout Handler
  const logout = () => {
    authService.clearSession()
    setUser(null)
    setToken(null)
  }

  // Update local user state
  const updateUserState = (newUserData) => {
    setUser(newUserData)
    authService.saveSession(token, newUserData)
  }

  const role = user?.role ? String(user.role).toUpperCase() : null
  const isAuthenticated = Boolean(token && user)
  const isAdmin = role === 'ADMIN'
  const isCitizen = role === 'USER'

  const value = {
    user,
    token,
    role,
    isAuthenticated,
    isAdmin,
    isCitizen,
    isLoading,
    login,
    logout,
    adminRegister,
    citizenRegister,
    refreshProfile,
    updateUserState,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
