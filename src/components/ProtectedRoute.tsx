import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'helper';
  requiredRoles?: ('client' | 'helper')[];
}

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, requiredRoles }) => {
  const { isAuthenticated, isLoading, authRoute } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to client auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/client" replace />;
  }

  // Determine which roles are required
  const rolesToCheck = requiredRoles || (requiredRole ? [requiredRole] : []);

  // Check role-based access if required
  if (rolesToCheck.length > 0) {
    // If no authRoute is set (null), redirect to appropriate auth page
    if (!authRoute) {
      // Default to client auth if no specific role is determined
      return <Navigate to="/auth/client" replace />;
    }
    
    // Check if user has the required role
    if (!rolesToCheck.includes(authRoute)) {
      // Redirect to dashboard if user has wrong role
      return <Navigate to="/auth/client" replace />;
    }
  }

  // User is authenticated and has correct role (if required)
  return <>{children}</>;
};

export default ProtectedRoute;
