import React from 'react';

export default function Card({
  title,
  extra,
  children,
  className = '',
  hover = true,
  ...props
}) {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-md p-6
        ${hover ? 'transition-all duration-200 hover:shadow-lg' : ''}
        ${className}
      `}
      {...props}
    >
      {(title || extra) && (
        <div className="flex justify-between items-center mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          )}
          {extra && <div>{extra}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
