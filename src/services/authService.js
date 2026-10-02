import apiClient from './apiClient.js';

// All auth API calls go through this service.
// Components and context never call apiClient directly for auth operations.

/**
 * Register a new account.
 * @param {{ name, email, password, role }} data
 * @returns {Promise<{ user }>}
 */
export async function register(data) {
  const response = await apiClient.post('/auth/register', data);
  return response.data.data;
}

/**
 * Log in with email and password.
 * The server sets HttpOnly cookies on success — no token handling needed here.
 * @param {{ email, password }} credentials
 * @returns {Promise<{ user }>}
 */
export async function login(credentials) {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data.data;
}

/**
 * Log out the current session.
 * The server clears the HttpOnly cookies.
 * @returns {Promise<void>}
 */
export async function logout() {
  await apiClient.post('/auth/logout');
}

/**
 * Request a new access token using the refresh cookie.
 * Called automatically by the Axios interceptor when a 401 is received.
 * @returns {Promise<{ user }>}
 */
export async function refreshToken() {
  const response = await apiClient.post('/auth/refresh');
  return response.data.data;
}

/**
 * Fetch the currently authenticated user's profile.
 * Used on app load to rehydrate auth state from an existing cookie session.
 * @returns {Promise<{ user }>}
 */
export async function getMe() {
  const response = await apiClient.get('/auth/me');
  return response.data.data;
}
