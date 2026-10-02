import { cloneElement } from 'react';

/**
 * FormField — a labelled input wrapper with accessible error display.
 *
 * Keeps label + input + error message co-located so each form field
 * is one component rather than three separate elements per field.
 */
function FormField({
  id,
  label,
  error,
  hint,
  required = false,
  children,
}) {
  const hintId  = hint  ? `${id}-hint`  : undefined;
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const errorId = errorMessage ? `${id}-error` : undefined;

  // Build describedby string for screen readers.
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-gray-700"
      >
        {label}
        {required && (
          <span className="ms-1 text-danger-500" aria-hidden="true">*</span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-xs text-gray-400 -mt-0.5">
          {hint}
        </p>
      )}

      {/* Pass aria-describedby down to the child via cloneElement */}
      {describedBy
        ? (() => {
            const child = Array.isArray(children) ? children[0] : children;
            if (!child) return children;
            try {
              return cloneElement(child, {
                'aria-describedby': describedBy,
              });
            } catch { return children; }
          })()
        : children}

      {errorMessage && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1 text-xs font-medium text-danger-600 animate-fade-in"
        >
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default FormField;
