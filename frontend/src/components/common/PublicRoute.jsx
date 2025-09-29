// src/components/common/PublicRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isInitialized, isLoading } = useAuthStore();

  console.log('PublicRoute check:', {
    isInitialized,
    isLoading,
    isAuthenticated
  });

  // Wait for auth to be initialized
  if (!isInitialized || isLoading) {
    console.log('PublicRoute: Waiting for auth initialization');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    console.log('PublicRoute: User authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('PublicRoute: User not authenticated, rendering public content');
  return children;
};

export default PublicRoute;