import React from 'react';
import { X } from 'lucide-react';

export default function Modal({
  visible,
  title,
  onClose,
  children,
  size = 'md',
}) {
  if (!visible) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`
            relative bg-white rounded-xl shadow-xl w-full
            ${sizeClasses[size]}
            animate-fade-in
          `}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-gray-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
