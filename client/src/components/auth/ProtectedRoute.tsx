import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - Auth State:', { isAuthenticated, user });
  console.log('ProtectedRoute - Allowed Roles:', allowedRoles);
  console.log('ProtectedRoute - Current Path:', location.pathname);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If user doesn't have required role, redirect to unauthorized or home
  if (user && !allowedRoles.includes(user.role)) {
    console.log(`ProtectedRoute - User role '${user.role}' not in allowed roles:`, allowedRoles);
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute - Access granted, rendering children');
  return <>{children}</>;
};
