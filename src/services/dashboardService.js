/**
 * dashboardService.js  (frontend)
 *
 * All calls to the new /api/dashboard/* endpoints live here.
 * Components never call apiClient directly for dashboard operations.
 *
 * The three existing services (donationService, requestService,
 * notificationService) are intentionally NOT duplicated here — the
 * dashboard page continues to call them directly for the list widgets.
 * This service only handles the three NEW dashboard-specific endpoints.
 */

import apiClient from './apiClient.js';

/**
 * Fetch role-scoped KPI statistics.
 * Returns different shapes depending on the authenticated user's role:
 *   donor/ngo  → { donations: {...}, receivedRequests: {...}, unreadNotifications }
 *   beneficiary → { requests: {...}, unreadNotifications }
 *   admin       → full platform stats from adminAnalyticsService
 *
 * @returns {Promise<object>} overview payload from data.overview
 */
export async function getOverview() {
  const response = await apiClient.get('/dashboard/overview');
  return response.data.data.overview;
}

/**
 * Fetch time-series data for the analytics chart widget.
 *
 * @param {number} [days=30]  Look-back window. Accepted: 7 | 14 | 30 | 60 | 90.
 * @returns {Promise<{ dateRange: string[], series: Array<{key, label, data}>, days: number }>}
 */
export async function getAnalytics(days = 30) {
  const response = await apiClient.get('/dashboard/analytics', { params: { days } });
  return response.data.data;
}

/**
 * Fetch recent activity feed entries scoped to the current user's role.
 *
 * @param {number} [limit=10]  Max entries to return (server caps at 50).
 * @returns {Promise<Array<{_id, action, label, actorName, targetType, targetId, actionUrl, createdAt}>>}
 */
export async function getActivity(limit = 10) {
  const response = await apiClient.get('/dashboard/activity', { params: { limit } });
  return response.data.data.activity;
}
