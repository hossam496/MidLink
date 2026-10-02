import { forwardRef } from 'react';

/**
 * Input — styled text input. Forwards all native input props and ref.
 * Sets aria-invalid when hasError is true for screen reader compatibility.
 */
const Input = forwardRef(function Input({ hasError = false, className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`${hasError ? 'input-error' : 'input'} bg-white text-gray-800 ${className}`}
      aria-invalid={hasError ? 'true' : undefined}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
