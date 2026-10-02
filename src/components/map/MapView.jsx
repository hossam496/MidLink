import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DonationStatusBadge from '@/components/donations/DonationStatusBadge';
import { MAP_DEFAULTS } from '@/config/constants';

// Fix Leaflet's default icon paths broken by bundlers.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom coloured icons for different donation states.
function createIcon(colour) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:24px;height:24px;border-radius:50% 50% 50% 0;
      background:${colour};border:2px solid #fff;
      transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.25)">
    </div>`,
    iconSize:   [24, 24],
    iconAnchor: [12, 24],
    popupAnchor:[0, -24],
  });
}

const ICONS = {
  AVAILABLE: createIcon('#22c55e'),
  REQUESTED: createIcon('#6366f1'),
  RESERVED:  createIcon('#a855f7'),
  DEFAULT:   createIcon('#14b8a6'),
};

// Imperatively flies to new centre when the prop changes.
function MapFlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1 });
  }, [center, zoom, map]);
  return null;
}

/**
 * MapView — renders a Leaflet map with donation markers and an optional
 * search radius circle around the user's location.
 *
 * Props:
 *   donations     {Donation[]}          Donations to display as markers.
 *   userLocation  {{ lat, lng } | null} User's location (for radius circle).
 *   radiusKm      {number}              Search radius in km.
 *   center        {[lat, lng]}          Map centre override.
 *   zoom          {number}
 *   height        {string}              CSS height (default: '100%').
 */
function MapView({
  donations   = [],
  userLocation = null,
  radiusKm     = 25,
  center       = MAP_DEFAULTS.center,
  zoom         = MAP_DEFAULTS.zoom,
  height       = '100%',
}) {
  const mapCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : center;

  const mapZoom = userLocation ? 11 : zoom;

  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden border border-gray-200 shadow-card">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          url={MAP_DEFAULTS.tileUrl}
          attribution={MAP_DEFAULTS.tileAttribution}
        />

        {/* Fly to user location when it changes */}
        {userLocation && (
          <MapFlyTo center={[userLocation.lat, userLocation.lng]} zoom={11} />
        )}

        {/* Search radius circle */}
        {userLocation && (
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={radiusKm * 1000}
            pathOptions={{ color: '#14b8a6', fillColor: '#14b8a6', fillOpacity: 0.06, weight: 1.5 }}
          />
        )}

        {/* Donation markers */}
        {donations.map((donation) => {
          const [lng, lat] = donation.location?.coordinates || [];
          if (!lat || !lng) return null;

          const icon  = ICONS[donation.status] || ICONS.DEFAULT;
          const title = donation.itemType === 'medicine'
            ? donation.medicine?.name
            : donation.medicalDevice?.deviceType;

          return (
            <Marker key={donation._id} position={[lat, lng]} icon={icon}>
              <Popup>
                <div className="min-w-[180px] p-1">
                  <p className="font-bold text-sm text-gray-900 mb-1.5">{title}</p>
                  <p className="text-xs text-gray-500 mb-1">{donation.category?.name}</p>
                  {donation.location?.displayLabel && (
                    <p className="text-xs text-gray-400 mb-2">{donation.location.displayLabel}</p>
                  )}
                  <DonationStatusBadge status={donation.status} />
                  <br />
                  <Link
                    to={`/donations/${donation._id}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    عرض التفاصيل
                    <svg className="h-3 w-3 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapView;
