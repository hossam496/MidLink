import apiClient from './apiClient.js';

export async function getNotifications(params = {}) {
  const response = await apiClient.get('/notifications', { params });
  return response.data.data;
}

export async function getUnreadCount() {
  const response = await apiClient.get('/notifications/unread-count');
  return response.data.data.count;
}

export async function markAsRead(id) {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead() {
  await apiClient.patch('/notifications/read-all');
}
