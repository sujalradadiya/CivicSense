import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loader from './Loader'

export const UserRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <Loader message="Verifying session..." fullScreen />
  }

  // Not logged in -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If ADMIN accesses citizen-only page, redirect to Admin Dashboard
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}

export default UserRoute
