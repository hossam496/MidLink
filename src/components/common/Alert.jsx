/**
 * Alert — inline feedback message for form-level errors and success states.
 */
const VARIANT_STYLES = {
  error:   'bg-danger-50 border-danger-200 text-danger-700',
  success: 'bg-success-50 border-success-200 text-success-700',
  warning: 'bg-warning-50 border-warning-200 text-warning-700',
  info:    'bg-primary-50 border-primary-200 text-primary-700',
};

// Tailwind needs full class strings — it can't construct them dynamically.
// Defining them statically here avoids purging issues.
const ICON_PATHS = {
  error:   'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
  success: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  info:    'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
};

function Alert({ variant = 'error', message, className = '' }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm animate-fade-in
                  ${VARIANT_STYLES[variant]} ${className}`}
    >
      <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[variant]} />
      </svg>
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}

export default Alert;
