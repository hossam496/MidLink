import apiClient from './apiClient.js';

// All donation API calls are centralised here.
// Components never call apiClient directly for donation operations.

/**
 * List available donations with optional filters.
 * @param {object} params - { longitude, latitude, radiusKm, categoryId, itemType, page, limit }
 */
export async function listDonations(params = {}) {
  const response = await apiClient.get('/donations', { params });
  return response.data.data;
}

/**
 * Get a single donation by ID.
 * @param {string} id
 */
export async function getDonation(id) {
  const response = await apiClient.get(`/donations/${id}`);
  return response.data.data;
}

/**
 * Create a new donation (DRAFT). Sends multipart/form-data for images.
 * @param {FormData} formData
 */
export async function createDonation(formData) {
  const response = await apiClient.post('/donations', formData);
  return response.data.data;
}

/**
 * Update a DRAFT donation.
 * @param {string}   id
 * @param {FormData} formData
 */
export async function updateDonation(id, formData) {
  const response = await apiClient.patch(`/donations/${id}`, formData);
  return response.data.data;
}

/**
 * Submit a DRAFT donation for review.
 * @param {string} id
 */
export async function submitDonation(id) {
  const response = await apiClient.post(`/donations/${id}/submit`);
  return response.data.data;
}

/**
 * Cancel a donation.
 * @param {string} id
 * @param {string} [reason]
 */
export async function cancelDonation(id, reason = '') {
  const response = await apiClient.post(`/donations/${id}/cancel`, { reason });
  return response.data.data;
}

/**
 * Get the authenticated donor's own donations.
 * @param {object} params - { page, limit }
 */
export async function getMyDonations(params = {}) {
  const response = await apiClient.get('/donations/my/donations', { params });
  return response.data.data;
}

/**
 * List all categories.
 */
export async function listCategories() {
  const response = await apiClient.get('/categories');
  return response.data.data;
}
