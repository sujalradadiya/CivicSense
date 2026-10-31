import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminNavbar from './AdminNavbar'

export const AdminLayout = ({ pageTitle, onRefresh, isRefreshing, children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div
      className="admin-app-shell"
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#090d16',
        color: '#f8fafc',
      }}
    >
      {/* Sidebar */}
      <AdminSidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Administrative Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh',
        }}
      >
        <AdminNavbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          pageTitle={pageTitle}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />

        <main
          style={{
            flex: 1,
            padding: '1.75rem',
            overflowY: 'auto',
          }}
        >
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
