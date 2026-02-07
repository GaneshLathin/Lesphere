import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

/**
 * PrivateRoute component for protecting routes with authentication and role-based access control
 * 
 * @param {React.ReactNode} children - The component to render if access is granted
 * @param {string[]} roles - Array of allowed roles (e.g., ['STUDENT', 'INSTRUCTOR'])
 * @param {boolean} requireAuth - Whether authentication is required (default: true)
 * 
 * Usage:
 * <PrivateRoute roles={['STUDENT']}>
 *   <StudentDashboard />
 * </PrivateRoute>
 */
const PrivateRoute = ({ children, roles, requireAuth = true }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  // Check if user is authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if user has the required role
  if (roles && roles.length > 0) {
    if (!user || !roles.includes(user.role)) {
      toast.error('Access denied. You do not have permission to view this page.')

      // Redirect based on user's actual role
      if (user) {
        switch (user.role) {
          case 'STUDENT':
            return <Navigate to="/dashboard/student" replace />
          case 'INSTRUCTOR':
            return <Navigate to="/dashboard/instructor" replace />
          case 'ADMIN':
            return <Navigate to="/dashboard/admin" replace />
          default:
            return <Navigate to="/login" replace />
        }
      }

      return <Navigate to="/login" replace />
    }
  }

  // User is authenticated and has correct role
  return children
}

export default PrivateRoute