import { useState, useCallback } from 'react';

/**
 * useGeolocation — wraps the browser Geolocation API.
 *
 * Returns { coords, isLoading, error, requestLocation }.
 * Call requestLocation() to trigger the permission prompt.
 *
 * Does not auto-request on mount — the user must explicitly trigger it
 * so we don't show a permission prompt without context.
 */
function useGeolocation() {
  const [coords,    setCoords]    = useState(null);   // { latitude, longitude, accuracy }
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('متصفحك لا يدعم تحديد الموقع الجغرافي.');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude:  position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy:  position.coords.accuracy,
        });
        setIsLoading(false);
      },
      (err) => {
        const messages = {
          1: 'تم رفض إذن الموقع. يرجى السماح بالوصول إليه من إعدادات المتصفح.',
          2: 'الموقع غير متاح. يرجى المحاولة مرة أخرى.',
          3: 'انتهت مهلة طلب الموقع. يرجى المحاولة مرة أخرى.',
        };
        setError(messages[err.code] || 'تعذّر تحديد موقعك.');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: false, // Low accuracy is sufficient for km-scale proximity.
        timeout:            10000,
        maximumAge:         5 * 60 * 1000, // Cache location for 5 minutes.
      }
    );
  }, []);

  return { coords, isLoading, error, requestLocation };
}

export default useGeolocation;
