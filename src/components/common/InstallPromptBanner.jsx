import useInstallPrompt from '@/hooks/useInstallPrompt';

function InstallPromptBanner() {
  const { canInstall, promptInstall, dismissInstall } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <div
      role="complementary"
      aria-label="تثبيت ميدلينك"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/95 backdrop-blur-sm px-4 py-4 shadow-elevated animate-slide-up"
    >
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">ثبّت ميدلينك</p>
            <p className="text-xs text-gray-500">
              أضفه إلى شاشتك الرئيسية للوصول السريع — يعمل بدون إنترنت أيضاً.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={dismissInstall}
            className="btn-ghost py-2 px-3 text-xs"
            aria-label="تجاهل"
          >
            ليس الآن
          </button>
          <button
            type="button"
            onClick={promptInstall}
            className="btn-primary py-2 px-5 text-xs"
          >
            تثبيت
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallPromptBanner;
