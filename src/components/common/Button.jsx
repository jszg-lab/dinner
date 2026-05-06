import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseClasses = 'font-medium transition-all duration-200 inline-flex items-center justify-center';

  const variantClasses = {
    primary: 'bg-primary text-white hover:shadow-lg hover:scale-105 active:scale-95',
    secondary: 'bg-secondary text-white hover:shadow-lg hover:scale-105 active:scale-95',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'text-text-secondary hover:text-primary hover:bg-primary/5',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:scale-105 active:scale-95',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded',
    md: 'px-4 py-2 rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || loading ? disabledClasses : ''}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
