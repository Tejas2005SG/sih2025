// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, isInitialized, isLoading } = useAuthStore();
  const location = useLocation();

  console.log('ProtectedRoute check:', {
    isInitialized,
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    pathname: location.pathname
  });

  // Wait for auth to be initialized
  if (!isInitialized || isLoading) {
    console.log('ProtectedRoute: Waiting for auth initialization');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check phone verification
  if (user && !user.isPhoneVerified) {
    console.log('ProtectedRoute: Phone not verified, redirecting to verification');
    return <Navigate to="/register/verify-sms" replace />;
  }

  console.log('ProtectedRoute: All checks passed, rendering children');
  return children;
};

export default ProtectedRoute;