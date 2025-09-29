// src/components/common/AuthProvider.jsx
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore.js';
import { LoadingScreen } from './Loader';

const AuthProvider = ({ children }) => {
  const { checkAuthStatus, isInitialized, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('AuthProvider: Initializing auth check');
    
    // Check auth status only once when component mounts
    if (!isInitialized && !isLoading) {
      checkAuthStatus();
    }
    
    setMounted(true);
  }, [checkAuthStatus, isInitialized, isLoading]);

  // Show loading while mounting or auth is being checked
  if (!mounted || !isInitialized) {
    console.log('AuthProvider: Showing loading screen', { mounted, isInitialized });
    return <LoadingScreen />;
  }

  console.log('AuthProvider: Auth initialized, rendering children');
  return children;
};

export default AuthProvider;