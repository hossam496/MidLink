import apiClient from './apiClient.js';

export async function createRequest(donationId, data = {}) {
  const response = await apiClient.post(`/requests/donations/${donationId}`, data);
  return response.data.data;
}

export async function getRequest(id) {
  const response = await apiClient.get(`/requests/${id}`);
  return response.data.data;
}

export async function getMyRequests(params = {}) {
  const response = await apiClient.get('/requests/my', { params });
  return response.data.data;
}

export async function getReceivedRequests(params = {}) {
  const response = await apiClient.get('/requests/received', { params });
  return response.data.data;
}

export async function listRequestsForDonation(donationId, params = {}) {
  const response = await apiClient.get(`/requests/donations/${donationId}`, { params });
  return response.data.data;
}

export async function approveRequest(id, notes = '') {
  const response = await apiClient.post(`/requests/${id}/approve`, { notes });
  return response.data.data;
}

export async function rejectRequest(id, reason) {
  const response = await apiClient.post(`/requests/${id}/reject`, { reason });
  return response.data.data;
}

export async function markDistributed(id) {
  const response = await apiClient.post(`/requests/${id}/distribute`);
  return response.data.data;
}

export async function cancelRequest(id) {
  const response = await apiClient.post(`/requests/${id}/cancel`);
  return response.data.data;
}
