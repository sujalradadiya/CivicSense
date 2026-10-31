import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loader from './Loader'

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isCitizen, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <Loader message="Verifying administrator credentials..." fullScreen />
  }

  // Not authenticated at all -> redirect to Admin Login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // Authenticated as a citizen USER -> forbid admin access, redirect to citizen dashboard
  if (isCitizen && !isAdmin) {
    return <Navigate to="/home" replace />
  }

  // Only allow ADMIN
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default AdminRoute
