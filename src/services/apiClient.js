import axios from 'axios';
import { API_BASE_URL } from '@/config/constants';

// Single Axios instance used by all service modules.
const apiClient = axios.create({
  baseURL:          API_BASE_URL,
  withCredentials:  true,  // Required for HttpOnly cookie-based auth.
  timeout:          15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically remove Content-Type for FormData so the browser sets
// multipart/form-data with the correct boundary parameter.
apiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});
// When the access token expires the server returns 401.
// We attempt one silent refresh, then retry the original request.
// If the refresh also fails (e.g. refresh token expired), the user is
// redirected to /login via the auth context.

let isRefreshing    = false;
let refreshQueue    = []; // Queued requests waiting for the refresh to complete.

function processRefreshQueue(error) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  refreshQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status          = error.response?.status;

    // Only attempt refresh for 401s that are not themselves auth endpoint calls.
    // Retrying a failed login or register makes no sense.
    const isAuthEndpoint = originalRequest?.url?.startsWith('/auth/');
    const alreadyRetried = originalRequest?._retried;

    if (status === 401 && !isAuthEndpoint && !alreadyRetried) {
      originalRequest._retried = true;

      if (isRefreshing) {
        // Another request is already refreshing — queue this one.
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      isRefreshing = true;

      try {
        await apiClient.post('/auth/refresh');
        processRefreshQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processRefreshQueue(refreshError);
        // Dispatch a custom event so AuthContext can react (redirect to login).
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalise all errors into a consistent shape for consumers.
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    const errors = error.response?.data?.errors || [];

    return Promise.reject({ message, errors, status });
  }
);

export default apiClient;
