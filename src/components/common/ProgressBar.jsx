import React from 'react';

export default function ProgressBar({
  value,
  max = 100,
  color = 'bg-primary',
  showLabel = false,
  height = 'h-2',
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      <div className={`w-full ${height} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-text-secondary">
          <span>{value}</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}
