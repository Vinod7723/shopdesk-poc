import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  requiredRole?: 'employee' | 'customer'
}

export default function ProtectedRoute({ requiredRole }: Props) {
  const { isAuthenticated, isInitialized, role } = useAuth()

  // Wait until localStorage is read before making any redirect decision
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  // Not logged in — send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Logged in but wrong role — redirect to their correct home
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'customer' ? '/shop' : '/products'} replace />
  }

  return <Outlet />
}
