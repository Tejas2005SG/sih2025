import React from 'react';
import { Leaf } from 'lucide-react';

const Loader = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin text-green-600 ${sizes[size]}`}>
        <Leaf className="w-full h-full" />
      </div>
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
};

// Loading Screen Component
export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-green-600 w-16 h-16 mx-auto mb-4">
          <Leaf className="w-full h-full" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          AyurSutra Wellness
        </h2>
        <div className="flex space-x-1 justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-green-600 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <p className="mt-6 text-gray-600">Loading your wellness journey...</p>
      </div>
    </div>
  );
};

export default Loader;