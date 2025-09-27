// src/components/common/AuthProvider.jsx
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore.js';
import { LoadingScreen } from './Loader';

const AuthProvider = ({ children }) => {
  const { checkAuthStatus, isInitialized } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Run synchronous auth check
    checkAuthStatus();
    setMounted(true);
  }, []);

  if (!mounted || !isInitialized) {
    return <LoadingScreen />;
  }

  return children;
};

export default AuthProvider;