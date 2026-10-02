import { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '@/services/authService';

export const AuthContext = createContext(null);

/**
 * AuthProvider manages the global authentication state.
 *
 * State is intentionally simple: user object or null.
 * The access token lives exclusively in an HttpOnly cookie — this component
 * never reads, stores, or inspects it.
 *
 * On mount, getMe() is called to rehydrate state from an existing cookie session.
 * This covers page refreshes and returning users with a valid session.
 */
export function AuthProvider({ children }) {
  const [user,         setUser]         = useState(null);
  const [isLoading,    setIsLoading]    = useState(true); // True during initial session check.
  const [isInitialised, setIsInitialised] = useState(false);

  // ─── Rehydrate on mount ───────────────────────────────────────────────────
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const data = await authService.getMe();
        setUser(data.user);
      } catch {
        // No active session — user is not logged in. This is expected.
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialised(true);
      }
    }

    checkExistingSession();
  }, []);

  // ─── Listen for session expiry from the Axios interceptor ─────────────────
  useEffect(() => {
    function handleSessionExpired() {
      setUser(null);
    }

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  // ─── Auth actions ──────────────────────────────────────────────────────────

  const register = useCallback(async (formData) => {
    // Strip confirmPassword — the server does not expect it.
    const { confirmPassword: _confirm, ...registrationData } = formData;
    const data = await authService.register(registrationData);
    // Registration does not log the user in automatically.
    // The user must verify their account first (email verification in Phase 12).
    return data;
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      // Always clear local state, even if the server request fails.
      setUser(null);
    }
  }, []);

  const value = {
    user,
    isLoading,
    isInitialised,
    isAuthenticated: !!user,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
