import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  const location = useLocation();

  // Wait for auth to be initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !user.isPhoneVerified) {
    return <Navigate to="/register/verify-sms" replace />;
  }

  return children;
};

export default ProtectedRoute;