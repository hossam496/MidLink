import { useState, useEffect } from 'react';

/**
 * useOnlineStatus — tracks the browser's online/offline state.
 *
 * Returns { isOnline: boolean }.
 * Updates reactively when the connection changes.
 *
 * Note: navigator.onLine is unreliable in some environments
 * (it can be true even when the server is unreachable).
 * This hook reflects what the browser reports — sufficient for UX feedback.
 * Sensitive operations always validate server-side.
 */
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    function handleOnline()  { setIsOnline(true);  }
    function handleOffline() { setIsOnline(false); }

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}

export default useOnlineStatus;
