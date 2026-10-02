// Central configuration constants for the MedLink client.
// All environment-specific values come from Vite's import.meta.env,
// which reads from .env files at build time.

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api';

export const APP_NAME = 'MedLink';

// Map defaults — OpenStreetMap via Leaflet.
// Coordinates default to a central point; will be overridden by user location in Phase 7.
export const MAP_DEFAULTS = {
  center: [20.0, 0.0],
  zoom: 2,
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

// Donation search radius options (kilometres).
export const SEARCH_RADIUS_OPTIONS = [5, 10, 25, 50, 100];

// Roles — must match the server-side role enum exactly.
export const ROLES = Object.freeze({
  DONOR: 'donor',
  BENEFICIARY: 'beneficiary',
  NGO: 'ngo',
  ADMIN: 'admin',
});

// Donation lifecycle statuses — mirrors server-side enum.
// Used for display logic only; transitions are always server-authorised.
export const DONATION_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  AVAILABLE: 'AVAILABLE',
  REQUESTED: 'REQUESTED',
  RESERVED: 'RESERVED',
  DISTRIBUTED: 'DISTRIBUTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  FLAGGED: 'FLAGGED',
});
