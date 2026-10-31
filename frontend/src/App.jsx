import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Signup } from './components/Signup'
import { Login } from './components/Login'
import { Home } from './components/Home'
import { Sidebar } from './components/Sidebar'
import { ReportProblemModal } from './components/ReportProblemModal'
import { UserSelfComplain } from './components/UserSelfComplain'

// Route Guards
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminRoute from './components/common/AdminRoute'
import UserRoute from './components/common/UserRoute'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminRegister from './pages/admin/AdminRegister'
import AdminDashboard from './pages/admin/AdminDashboard'
import AllComplaints from './pages/admin/AllComplaints'
import ComplaintDetails from './pages/admin/ComplaintDetails'
import Citizens from './pages/admin/Citizens'
import AIAnalysis from './pages/admin/AIAnalysis'

function App() {
  const { user, role, isAdmin, isCitizen, isAuthenticated, logout, isLoading } = useAuth()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalCategory, setModalCategory] = useState('Road Damage')
  const [globalToast, setGlobalToast] = useState('')

  const location = useLocation()
  const navigate = useNavigate()

  // Identify whether current route is in Admin section
  const isAdminPath = location.pathname.startsWith('/admin')

  useEffect(() => {
    const handleComplaint = () => {
      setGlobalToast('Your problem is recorded successfully!')
      setTimeout(() => {
        setGlobalToast('')
      }, 4500)
    }
    const handleDelete = () => {
      setGlobalToast('Problem statement deleted successfully!')
      setTimeout(() => {
        setGlobalToast('')
      }, 4500)
    }
    window.addEventListener('complaint-submitted', handleComplaint)
    window.addEventListener('complaint-deleted', handleDelete)
    return () => {
      window.removeEventListener('complaint-submitted', handleComplaint)
      window.removeEventListener('complaint-deleted', handleDelete)
    }
  }, [])

  // Sync activeTab with current URL route
  useEffect(() => {
    if (location.pathname === '/my-complaints') {
      setActiveTab('my-complaints')
    } else if (location.pathname === '/home') {
      if (activeTab === 'my-complaints') {
        setActiveTab('dashboard')
      }
    }
  }, [location.pathname])

  // Close mobile sidebar on route or tab change
  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [location.pathname, activeTab])

  const handleLogout = () => {
    logout()
    setIsMobileSidebarOpen(false)
    navigate('/login')
  }

  const handleOpenReportModal = (category = 'Road Damage') => {
    setModalCategory(category)
    setModalOpen(true)
  }

  // If in admin section, let AdminLayout render its dedicated layout
  if (isAdminPath) {
    return (
      <Routes>
        {/* Admin Authentication Routes */}
        <Route
          path="/admin/login"
          element={
            isAuthenticated && isAdmin ? (
              <Navigate to="/admin/dashboard" replace />
            ) : isAuthenticated && isCitizen ? (
              <Navigate to="/home" replace />
            ) : (
              <AdminLogin />
            )
          }
        />

        <Route
          path="/admin/register"
          element={<Navigate to="/signup" replace />}
        />

        {/* Protected Admin Console Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/complaints"
          element={
            <AdminRoute>
              <AllComplaints />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/complaints/:id"
          element={
            <AdminRoute>
              <ComplaintDetails />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <Citizens />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/ai-analysis"
          element={
            <AdminRoute>
              <AIAnalysis />
            </AdminRoute>
          }
        />

        {/* Admin 404 Fallback */}
        <Route
          path="/admin/*"
          element={<Navigate to="/admin/dashboard" replace />}
        />
      </Routes>
    )
  }

  // Citizen & Public Interface Shell
  return (
    <div className={`app-shell ${user && !isAdmin ? 'with-vertical-nav' : 'auth-mode'}`}>
      {/* 
        Vertical Sidebar Navigation 
        Shown when citizen user is logged in
      */}
      {user && !isAdmin && (
        <Sidebar
          user={user}
          onLogout={handleLogout}
          onOpenReportModal={handleOpenReportModal}
          activeTab={activeTab}
          setActiveTab={(tabId) => {
            setActiveTab(tabId)
            if (tabId === 'dashboard') {
              if (location.pathname !== '/home') {
                navigate('/home')
              }
              window.scrollTo({ top: 0, behavior: 'smooth' })
            } else if (tabId === 'categories') {
              if (location.pathname !== '/home') {
                navigate('/home')
                setTimeout(() => {
                  const el = document.getElementById('categories-directory')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }, 150)
              } else {
                const el = document.getElementById('categories-directory')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }
            } else if (tabId === 'my-complaints') {
              navigate('/my-complaints')
            } else if (tabId === 'public-ledger') {
              if (location.pathname !== '/home') {
                navigate('/home')
                setTimeout(() => {
                  const el = document.getElementById('grievances-ledger')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }, 150)
              } else {
                const el = document.getElementById('grievances-ledger')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }
            }
          }}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Layout Area */}
      <div className="app-main-wrapper">
        {/* Top Header for Mobile (or Auth) */}
        {user && !isAdmin ? (
          <header className="mobile-top-bar">
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Toggle vertical navigation sidebar"
            >
              ☰
            </button>
            <div className="mobile-brand">
              <span className="mobile-brand-icon">🏛️</span>
              <span className="brand-title">Civic<span className="gradient-text">Sense</span></span>
            </div>
            <button
              type="button"
              className="mobile-report-btn"
              onClick={() => handleOpenReportModal()}
            >
              + Report
            </button>
          </header>
        ) : (
          /* Minimal Auth Header */
          <header className="auth-simple-header">
            <div className="nav-brand">
              <div className="nav-logo-icon">🏛️</div>
              <span>Civic<span className="gradient-text">Sense</span></span>
            </div>
            <div className="auth-header-links" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/admin/login" className="btn btn-outline btn-sm" style={{ borderColor: '#fbbf24', color: '#fbbf24' }}>
                Admin Portal 🛡️
              </Link>
              {location.pathname === '/signup' ? (
                <Link to="/login" className="btn btn-outline btn-sm">
                  Sign In
                </Link>
              ) : (
                <Link to="/signup" className="btn btn-primary btn-sm">
                  Register Account
                </Link>
              )}
            </div>
          </header>
        )}

        {/* Routed View Content */}
        <main className="app-content-body">
          <Routes>
            {/* Root: Role-based redirect */}
            <Route
              path="/"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : isAdmin ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Navigate to="/home" replace />
                )
              }
            />

            {/* Public Login Route */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  isAdmin ? (
                    <Navigate to="/admin/dashboard" replace />
                  ) : (
                    <Navigate to="/home" replace />
                  )
                ) : (
                  <Login />
                )
              }
            />

            {/* Public Citizen Signup Route */}
            <Route
              path="/signup"
              element={
                isAuthenticated ? (
                  isAdmin ? (
                    <Navigate to="/admin/dashboard" replace />
                  ) : (
                    <Navigate to="/home" replace />
                  )
                ) : (
                  <Signup />
                )
              }
            />

            {/* Citizen Dashboard (Protected: Citizen only) */}
            <Route
              path="/home"
              element={
                <UserRoute>
                  <Home user={user} onLogout={handleLogout} />
                </UserRoute>
              }
            />

            {/* Citizen Complaints (Protected: Citizen only) */}
            <Route
              path="/my-complaints"
              element={
                <UserRoute>
                  <UserSelfComplain user={user} />
                </UserRoute>
              }
            />

            {/* 404 Fallback */}
            <Route
              path="*"
              element={
                <div className="auth-wrapper">
                  <div className="glass-card" style={{ maxWidth: '480px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', margin: '0 0 1rem' }}>404</h1>
                    <h2 style={{ marginBottom: '1rem' }}>Resource Not Found</h2>
                    <p style={{ marginBottom: '1.5rem' }}>
                      The civic portal resource requested does not exist or has been relocated.
                    </p>
                    <Link
                      to={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/home') : '/login'}
                      className="btn btn-primary"
                    >
                      Return to {isAuthenticated ? (isAdmin ? 'Admin Dashboard' : 'Portal Dashboard') : 'Login'}
                    </Link>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="footer civic-footer">
          <div className="footer-inner-content">
            <div>© {new Date().getFullYear()} CivicSense Smart City Municipal Grievance Redressal System.</div>
            <div className="footer-meta-links">
              <span className="operational-tag">● Municipal Dispatch Services Operational</span>
              <Link to="/admin/login" style={{ color: '#fbbf24', textDecoration: 'none', fontSize: '0.82rem' }}>
                Officer Login
              </Link>
              <span>Citizen Charter</span>
              <span>Privacy & Grievance Guidelines</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Quick Report Modal triggered from Sidebar or Mobile bar */}
      <ReportProblemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialCategory={modalCategory}
        user={user}
        onComplaintSubmitted={(newC) => {
          window.dispatchEvent(new CustomEvent('complaint-submitted', { detail: newC }))
        }}
      />

      {/* Global Success Toast Notification */}
      {globalToast && (
        <div className="global-success-toast">
          <span className="toast-icon">✓</span>
          <span>{globalToast}</span>
        </div>
      )}
    </div>
  )
}

export default App
