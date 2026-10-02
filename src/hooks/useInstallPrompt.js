import { useState, useEffect } from 'react';

/**
 * useInstallPrompt — captures the browser's beforeinstallprompt event so we
 * can show a custom install banner at the right moment rather than relying
 * on the browser's default prompt timing.
 *
 * Returns:
 *   canInstall   — true when the app is installable and the prompt is ready.
 *   promptInstall() — triggers the browser's install dialog.
 *   dismissInstall() — user dismissed our banner; suppress for this session.
 */
function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall,     setCanInstall]     = useState(false);
  const [isDismissed,    setIsDismissed]    = useState(
    () => sessionStorage.getItem('pwa-install-dismissed') === 'true'
  );

  useEffect(() => {
    function handleBeforeInstallPrompt(e) {
      // Prevent the browser from showing its own mini-infobar immediately.
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    }

    function handleAppInstalled() {
      // App was installed — hide our banner.
      setCanInstall(false);
      setDeferredPrompt(null);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled',        handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled',        handleAppInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  }

  function dismissInstall() {
    sessionStorage.setItem('pwa-install-dismissed', 'true');
    setIsDismissed(true);
    setCanInstall(false);
  }

  return {
    canInstall: canInstall && !isDismissed,
    promptInstall,
    dismissInstall,
  };
}

export default useInstallPrompt;
