import React, { forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  className = '', 
  showPasswordToggle = false,
  isPasswordVisible = false,
  onPasswordToggle,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  ...props 
}, ref) => {
  
  const inputType = type === 'password' && isPasswordVisible ? 'text' : type;
  const isPassword = type === 'password';
  const hasLeftIcon = !!LeftIcon;
  const hasRightIcon = !!RightIcon && !isPassword;
  const hasPasswordToggle = isPassword && showPasswordToggle;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Left Icon */}
        {hasLeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        
        {/* Input Field */}
        <input
          ref={ref}
          type={inputType}
          className={`
            block w-full rounded-lg border border-gray-300 px-3 py-3 text-sm
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-all duration-200
            ${hasLeftIcon ? 'pl-10' : 'pl-3'}
            ${(hasRightIcon || hasPasswordToggle) ? 'pr-10' : 'pr-3'}
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        
        {/* Password Toggle Button */}
        {hasPasswordToggle && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={onPasswordToggle}
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
        
        {/* Right Icon (non-password) */}
        {hasRightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <RightIcon className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;