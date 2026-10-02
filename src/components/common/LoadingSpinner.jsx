/**
 * LoadingSpinner — full-page or inline loading indicator.
 * fullPage=true centres it in the viewport (used during initial auth check).
 */
function LoadingSpinner({ fullPage = false, size = 'md', label = 'جاري التحميل...' }) {
  const sizeClass = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }[size];

  const spinner = (
    <div role="status" aria-label={label} className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg
          className={`animate-spin text-primary-600 ${sizeClass}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-20"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="3"
          />
          <path
            className="opacity-80"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>
      {size !== 'sm' && (
        <span className="text-xs font-medium text-gray-400">{label}</span>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;
