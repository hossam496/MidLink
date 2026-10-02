import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute — guards routes that require authentication and/or specific roles.
 *
 * While the initial session check is in progress (isLoading), shows a spinner
 * rather than immediately redirecting — avoids a flash-of-redirect for users
 * who have a valid existing session.
 *
 * redirectTo preserves the attempted URL in state so the login page can
 * redirect back after a successful login.
 *
 * @param {{ allowedRoles?: string[], redirectTo?: string, children: ReactNode }} props
 */
function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo   = '/login',
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Still determining session state — hold render until we know.
  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // Role check — only applied when allowedRoles is specified.
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to a dedicated "not authorised" page (added in a later phase).
    // For now, send to home.
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
