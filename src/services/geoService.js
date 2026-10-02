import apiClient from './apiClient.js';

export async function getNearbyDonations(params) {
  const response = await apiClient.get('/geo/nearby-donations', { params });
  return response.data.data;
}

export async function getNearbyUrgentRequests(params) {
  const response = await apiClient.get('/geo/nearby-requests', { params });
  return response.data.data;
}

export async function updateUserLocation(longitude, latitude) {
  const response = await apiClient.patch('/geo/user-location', { longitude, latitude });
  return response.data.data;
}

export async function getNgosNearPoint(params) {
  const response = await apiClient.get('/geo/nearby-ngos', { params });
  return response.data.data;
}
