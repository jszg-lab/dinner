import React from 'react';

export default function Input({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 border rounded-lg
          focus:outline-none focus:ring-2 focus:border-transparent
          transition-all duration-200
          ${error
            ? 'border-red-500 focus:ring-red-200'
            : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
          }
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
