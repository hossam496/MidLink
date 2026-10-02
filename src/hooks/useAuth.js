import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/**
 * useAuth — consumes the AuthContext.
 *
 * Throws a clear error if used outside AuthProvider, which catches
 * mis-wired component trees early in development rather than producing
 * a cryptic "cannot read property of null" error.
 *
 * Usage:
 *   const { user, login, logout, isAuthenticated } = useAuth();
 */
function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default useAuth;
