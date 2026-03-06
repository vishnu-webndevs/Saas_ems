import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'superadmin' | 'admin' | 'employee';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, authChecked } = useAuthStore();

  if (!authChecked) {
    return <LoadingSpinner size="md" className="h-64" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    if (requiredRole === 'superadmin' && user?.role !== 'superadmin') {
      return <Navigate to="/dashboard" replace />;
    }
    
    // Superadmin can access everything, Admin can access admin routes
    if (requiredRole === 'admin' && user?.role !== 'admin' && user?.role !== 'superadmin') {
       return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
