/**
 * Button — maps variant prop to Tailwind button classes defined in index.css.
 * Loading state shows a spinner and disables the button to prevent double-submit.
 */
function Button({
  children,
  variant  = 'primary',
  isLoading = false,
  className = '',
  type      = 'button',
  ...props
}) {
  const variantClass = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    danger:    'btn-danger',
    ghost:     'btn-ghost',
  }[variant] ?? 'btn-primary';

  return (
    <button
      type={type}
      disabled={isLoading || props.disabled}
      className={`${variantClass} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className="me-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export default Button;
