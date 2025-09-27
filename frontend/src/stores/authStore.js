// authStore.js - COMPLETE UPDATED VERSION
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/biometric-login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/register/personal-info',
  '/auth/register/medical-history',
  '/auth/register/dosha-assessment',
  '/auth/register/complete',
  '/auth/verify-sms',
  '/auth/resend-sms-code',
];

const isPublicEndpoint = (url = '') => PUBLIC_ENDPOINTS.some((p) => url.includes(p));

// Token management functions
const getAccessToken = () => {
  try {
    return localStorage.getItem('ayursutra_access_token');
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

const getRefreshToken = () => {
  try {
    return localStorage.getItem('ayursutra_refresh_token');
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

const setAccessToken = (token) => {
  try {
    if (token) {
      localStorage.setItem('ayursutra_access_token', token);
    } else {
      localStorage.removeItem('ayursutra_access_token');
    }
  } catch (error) {
    console.error('Error setting access token:', error);
  }
};

const setRefreshToken = (token) => {
  try {
    if (token) {
      localStorage.setItem('ayursutra_refresh_token', token);
    } else {
      localStorage.removeItem('ayursutra_refresh_token');
    }
  } catch (error) {
    console.error('Error setting refresh token:', error);
  }
};

const clearAllTokens = () => {
  try {
    localStorage.removeItem('ayursutra_access_token');
    localStorage.removeItem('ayursutra_refresh_token');
    localStorage.removeItem('ayursutra_user');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

const storeTokens = (accessToken, refreshToken) => {
  if (accessToken) setAccessToken(accessToken);
  if (refreshToken) setRefreshToken(refreshToken);
};

// Axios instance configuration
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Keep cookies for additional security
  timeout: 15000, // 15 second timeout
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Token refresh queue management
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors for protected endpoints
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !isPublicEndpoint(originalRequest.url)
    ) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Attempt to refresh token
        const response = await api.post('/auth/refresh-token', {
          refreshToken: refreshToken
        });

        // Extract new tokens from response
        const newAccessToken = response.data?.data?.accessToken;
        const newRefreshToken = response.data?.data?.refreshToken;
        
        if (!newAccessToken) {
          throw new Error('No access token in refresh response');
        }

        // Store new tokens
        setAccessToken(newAccessToken);
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }
        
        // Process queued requests
        processQueue(null, newAccessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Process queue with error
        processQueue(refreshError, null);
        
        // Clear all auth data
        clearAllTokens();
        const store = useAuthStore.getState();
        store.handleAuthFailure();
        
        // Redirect to login if not already there
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to clean form data
const processFormData = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const processed = JSON.parse(JSON.stringify(data));
  
  Object.keys(processed).forEach((key) => {
    if (processed[key] === null || processed[key] === undefined || processed[key] === '') {
      delete processed[key];
    } else if (Array.isArray(processed[key])) {
      if (processed[key].length === 0) {
        delete processed[key];
      }
    } else if (typeof processed[key] === 'object' && processed[key] !== null) {
      const cleaned = processFormData(processed[key]);
      if (Object.keys(cleaned).length === 0) {
        delete processed[key];
      } else {
        processed[key] = cleaned;
      }
    }
  });
  
  return processed;
};

// Create Zustand store with persist middleware
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Registration state
      registrationData: {
        step: 'personal-info',
        personalInfo: null,
        medicalHistory: null,
        doshaAssessment: null,
        progress: 0,
      },

      // Basic actions
      setLoading: (loading) => set({ isLoading: loading, error: null }),
      
      setError: (error) => set({ error, isLoading: false }),
      
      clearError: () => set({ error: null }),

      setUser: (user) => {
        try {
          localStorage.setItem('ayursutra_user', JSON.stringify(user));
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
            error: null,
          });
        } catch (error) {
          console.error('Error setting user:', error);
          set({ error: 'Failed to save user data' });
        }
      },

      clearUser: () => {
        clearAllTokens();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      },

      handleAuthFailure: () => {
        clearAllTokens();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
        get().clearRegistrationData();
      },

      // Authentication status check (synchronous)
      checkAuthStatus: () => {
        try {
          const storedUser = localStorage.getItem('ayursutra_user');
          const accessToken = getAccessToken();
          
          if (storedUser && accessToken) {
            try {
              const user = JSON.parse(storedUser);
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
                error: null,
              });
              return { authenticated: true };
            } catch (parseError) {
              console.error('Error parsing stored user:', parseError);
              clearAllTokens();
            }
          }
          
          // No valid stored data
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: null,
          });
          return { authenticated: false };
          
        } catch (error) {
          console.error('Auth check error:', error);
          clearAllTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: 'Authentication check failed',
          });
          return { authenticated: false };
        }
      },

      // Registration data management
      updateRegistrationStep: (step, progress) =>
        set((state) => ({
          registrationData: {
            ...state.registrationData,
            step,
            progress,
          },
        })),

      updateRegistrationData: (type, data) =>
        set((state) => ({
          registrationData: {
            ...state.registrationData,
            [type]: data,
          },
        })),

      clearRegistrationData: () =>
        set({
          registrationData: {
            step: 'personal-info',
            personalInfo: null,
            medicalHistory: null,
            doshaAssessment: null,
            progress: 0,
          },
        }),

      // Login function
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Attempting login...');
          
          // Clear any existing tokens
          clearAllTokens();
          
          const response = await api.post('/auth/login', credentials);
          console.log('Login response:', response.data);

          const data = response.data.data;
          
          if (!data) {
            throw new Error('Invalid response format');
          }

          // Extract tokens and user data
          const accessToken = data.accessToken;
          const refreshToken = data.refreshToken;
          const patient = data.patient;

          // Validate required data
          if (!accessToken || !refreshToken || !patient) {
            console.error('Missing required data:', { 
              hasAccessToken: !!accessToken, 
              hasRefreshToken: !!refreshToken, 
              hasPatient: !!patient 
            });
            throw new Error('Login response missing required data');
          }

          // Store tokens
          storeTokens(accessToken, refreshToken);
          
          // Set user in store
          get().setUser(patient);
          
          console.log('Login successful, tokens and user stored');
          toast.success('Login successful!');
          return { success: true, user: patient };

        } catch (error) {
          console.error('Login error:', error);
          clearAllTokens();
          
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'Login failed';
          
          set({ 
            isLoading: false, 
            isInitialized: true, 
            error: errorMessage 
          });
          
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Biometric login function
      biometricLogin: async (biometricData) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Attempting biometric login...');
          
          clearAllTokens();
          
          const response = await api.post('/auth/biometric-login', biometricData);
          console.log('Biometric login response:', response.data);
          
          const data = response.data.data;
          
          if (!data) {
            throw new Error('Invalid response format');
          }

          const accessToken = data.accessToken;
          const refreshToken = data.refreshToken;
          const patient = data.patient;

          if (!accessToken || !refreshToken || !patient) {
            console.error('Missing required data:', { 
              hasAccessToken: !!accessToken, 
              hasRefreshToken: !!refreshToken, 
              hasPatient: !!patient 
            });
            throw new Error('Biometric login response missing required data');
          }

          storeTokens(accessToken, refreshToken);
          get().setUser(patient);
          
          console.log('Biometric login successful');
          toast.success('Biometric login successful!');
          return { success: true, user: patient };

        } catch (error) {
          console.error('Biometric login error:', error);
          clearAllTokens();
          
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'Biometric login failed';
          
          set({ 
            isLoading: false, 
            isInitialized: true, 
            error: errorMessage 
          });
          
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Registration step 1: Personal Information
      registerPersonalInfo: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const cleanData = processFormData(data);
          const response = await api.post('/auth/register/personal-info', cleanData);
          
          if (response.data.success) {
            get().updateRegistrationData('personalInfo', cleanData);
            get().updateRegistrationStep('medical-history', 25);
            toast.success('Personal information saved!');
            return { success: true, data: response.data.data };
          } else {
            throw new Error(response.data.message || 'Registration failed');
          }
        } catch (error) {
          console.error('Personal info registration error:', error);
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'Registration failed';
          
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Registration step 2: Medical History
      registerMedicalHistory: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const processedData = processFormData(data);
          const response = await api.post('/auth/register/medical-history', processedData);
          
          if (response.data.success) {
            get().updateRegistrationData('medicalHistory', processedData);
            get().updateRegistrationStep('dosha-assessment', 50);
            toast.success('Medical history saved!');
            return { success: true, data: response.data.data };
          } else {
            throw new Error(response.data.message || 'Medical history save failed');
          }
        } catch (error) {
          console.error('Medical history registration error:', error);
          
          let errorMessage = 'Medical history save failed';
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          }
          if (error.response?.data?.errors) {
            errorMessage += ': ' + error.response.data.errors.map((e) => e.message || e).join(', ');
          }
          
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { 
            success: false, 
            error: errorMessage, 
            details: error.response?.data 
          };
        }
      },

      // Registration step 3: Dosha Assessment
      registerDoshaAssessment: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const cleanData = processFormData(data);
          const response = await api.post('/auth/register/dosha-assessment', cleanData);
          
          if (response.data.success) {
            get().updateRegistrationData('doshaAssessment', cleanData);
            get().updateRegistrationStep('complete-registration', 75);
            toast.success('Dosha assessment completed!');
            return { success: true, data: response.data.data };
          } else {
            throw new Error(response.data.message || 'Dosha assessment failed');
          }
        } catch (error) {
          console.error('Dosha assessment error:', error);
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'Dosha assessment failed';
          
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Registration step 4: Complete Registration
      completeRegistration: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const cleanData = processFormData(data);
          const response = await api.post('/auth/register/complete', cleanData);
          
          if (response.data.success) {
            get().updateRegistrationStep('sms-verification', 90);
            toast.success('Registration completed! Verify your phone.');
            return { success: true, data: response.data.data };
          } else {
            throw new Error(response.data.message || 'Registration completion failed');
          }
        } catch (error) {
          console.error('Complete registration error:', error);
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'Registration completion failed';
          
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // SMS Verification
      verifySMS: async (data) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Attempting SMS verification...');
          
          const response = await api.post('/auth/verify-sms', data);
          console.log('SMS verification response:', response.data);
          
          const responseData = response.data.data;
          
          if (!responseData) {
            throw new Error('Invalid response format');
          }

          const accessToken = responseData.accessToken;
          const refreshToken = responseData.refreshToken;
          const patient = responseData.patient;

          if (!accessToken || !refreshToken || !patient) {
            console.error('Missing required data:', { 
              hasAccessToken: !!accessToken, 
              hasRefreshToken: !!refreshToken, 
              hasPatient: !!patient 
            });
            throw new Error('SMS verification response missing required data');
          }

          // Store tokens and user
          storeTokens(accessToken, refreshToken);
          get().setUser(patient);
          get().clearRegistrationData();
          
          console.log('SMS verification successful');
          toast.success('Welcome to AyurSutra Wellness!');
          return { success: true, user: patient };

        } catch (error) {
          console.error('SMS verification error:', error);
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'SMS verification failed';
          
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Resend SMS Code
      resendSMSCode: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/resend-sms-code', data);
          
          if (response.data.success) {
            set({ isLoading: false });
            toast.success('New verification code sent!');
            return { success: true, data: response.data.data };
          } else {
            throw new Error(response.data.message || 'Failed to resend code');
          }
        } catch (error) {
          console.error('Resend SMS error:', error);
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'Failed to resend code';
          
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Forgot Password
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/forgot-password', { email });
          
          if (response.data.success) {
            set({ isLoading: false });
            toast.success('Password reset link sent to your email!');
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Failed to send reset email');
          }
        } catch (error) {
          console.error('Forgot password error:', error);
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'Failed to send reset email';
          
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Reset Password
      resetPassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/reset-password', data);
          
          if (response.data.success) {
            set({ isLoading: false });
            toast.success('Password reset successfully!');
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Password reset failed');
          }
        } catch (error) {
          console.error('Reset password error:', error);
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'Password reset failed';
          
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Update Profile
      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const cleanData = processFormData(data);
          const response = await api.put('/auth/profile', cleanData);
          
          if (response.data.success) {
            const updatedUser = response.data.data.patient || response.data.data.user;
            get().setUser(updatedUser);
            toast.success('Profile updated successfully!');
            return { success: true, user: updatedUser };
          } else {
            throw new Error(response.data.message || 'Profile update failed');
          }
        } catch (error) {
          console.error('Update profile error:', error);
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'Profile update failed';
          
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Change Password
      changePassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/change-password', data);
          
          if (response.data.success) {
            set({ isLoading: false });
            toast.success('Password changed successfully!');
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Password change failed');
          }
        } catch (error) {
          console.error('Change password error:', error);
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'Password change failed';
          
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          // Call logout endpoint (don't fail if it errors)
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout API error:', error);
          // Continue with logout even if API call fails
        }
        
        // Clear all local data
        clearAllTokens();
        get().clearRegistrationData();
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
        
        // Clear dashboard data if available
        try {
          const { useDashboardStore } = await import('./dashboardStore.js');
          const dashboardStore = useDashboardStore.getState();
          if (dashboardStore?.clearDashboardData) {
            dashboardStore.clearDashboardData();
          }
        } catch (error) {
          console.error('Error clearing dashboard data:', error);
        }
        
        toast.success('Logged out successfully');
        
        // Redirect to login
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      },
    }),
    {
      name: 'ayursutra-auth',
      // Only persist registration data and user preference settings
      partialize: (state) => ({
        registrationData: state.registrationData,
      }),
      // Reset state on storage rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Don't persist auth state - always check localStorage
          state.user = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          state.isInitialized = false;
          state.error = null;
        }
      },
    }
  )
);

// Export the api instance for use in other parts of the app
export { api };