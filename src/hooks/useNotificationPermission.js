import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/services/apiClient';

/**
 * useNotificationPermission — manages Web Push permission and subscription.
 *
 * Fetches the VAPID public key from the server, requests permission from
 * the browser, registers a service worker push subscription, and POSTs
 * it to the server.
 *
 * Returns:
 *   permission   — 'default' | 'granted' | 'denied'
 *   isSubscribed — true once the subscription is saved server-side
 *   requestPermission() — call this when the user explicitly opts in
 *   unsubscribe()        — removes the subscription
 */
function useNotificationPermission() {
  const [permission,    setPermission]    = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isSubscribed,  setIsSubscribed]  = useState(false);
  const [isLoading,     setIsLoading]     = useState(false);

  // Sync permission state if the user changes it externally.
  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    setPermission(Notification.permission);
    if (Notification.permission === 'granted') {
      checkExistingSubscription();
    }
  }, []);

  async function checkExistingSubscription() {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg          = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch {}
  }

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined' || !('serviceWorker' in navigator)) return;
    setIsLoading(true);

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      if (permission !== 'granted') return;

      // Fetch VAPID public key from our server.
      const { data: { vapidPublicKey } } = await apiClient.get('/notifications/vapid-public-key')
        .then(r => r.data);

      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Save subscription on the server.
      await apiClient.post('/notifications/subscribe', { subscription });
      setIsSubscribed(true);
    } catch (err) {
      console.warn('Push subscription failed:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg          = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) await subscription.unsubscribe();
      await apiClient.delete('/notifications/subscribe');
      setIsSubscribed(false);
    } catch {}
  }, []);

  return { permission, isSubscribed, isLoading, requestPermission, unsubscribe };
}

// Converts the base64url VAPID key string to a Uint8Array for the Web Push API.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default useNotificationPermission;
