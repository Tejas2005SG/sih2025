import React from 'react';

const ProgressBar = ({ 
  progress, 
  max = 100, 
  size = 'md', 
  color = 'green',
  showLabel = true,
  className = ''
}) => {
  const percentage = Math.min((progress / max) * 100, 100);
  
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  const colors = {
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full ${sizes[size]}`}>
        <div
          className={`${colors[color]} ${sizes[size]} rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;