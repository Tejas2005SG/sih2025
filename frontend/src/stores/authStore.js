// authStore.js - UPDATED
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

const getAccessToken = () => {
  try { return localStorage.getItem('ayursutra_access_token'); } catch { return null; }
};
const getRefreshToken = () => {
  try { return localStorage.getItem('ayursutra_refresh_token'); } catch { return null; }
};
const setAccessToken = (token) => {
  try { token ? localStorage.setItem('ayursutra_access_token', token) : localStorage.removeItem('ayursutra_access_token'); } catch {}
};
const setRefreshToken = (token) => {
  try { token ? localStorage.setItem('ayursutra_refresh_token', token) : localStorage.removeItem('ayursutra_refresh_token'); } catch {}
};
const clearAllTokens = () => {
  try {
    localStorage.removeItem('ayursutra_access_token');
    localStorage.removeItem('ayursutra_refresh_token');
    localStorage.removeItem('ayursutra_user');
  } catch {}
};
const storeTokens = (accessToken, refreshToken) => {
  if (accessToken) setAccessToken(accessToken);
  if (refreshToken) setRefreshToken(refreshToken);
};

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !isPublicEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (isPublicEndpoint(originalRequest?.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await api.post('/auth/refresh-token', { refreshToken });
        const newAccessToken = response.data?.data?.accessToken;
        const newRefreshToken = response.data?.data?.refreshToken;

        if (!newAccessToken) throw new Error('No access token in refresh response');

        setAccessToken(newAccessToken);
        if (newRefreshToken) setRefreshToken(newRefreshToken);

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAllTokens();
        const store = useAuthStore.getState();
        store.handleAuthFailure();
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

const processFormData = (data) => {
  if (!data || typeof data !== 'object') return data;
  const processed = JSON.parse(JSON.stringify(data));
  Object.keys(processed).forEach((key) => {
    const value = processed[key];
    if (value === null || value === undefined) delete processed[key];
    else if (typeof value === 'string' && value.trim() === '') delete processed[key];
    else if (Array.isArray(value) && value.length === 0) delete processed[key];
  });
  return processed;
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Core auth state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Registration state (form progress)
      registrationData: {
        step: 'personal-info',
        personalInfo: null,
        medicalHistory: null,
        doshaAssessment: null,
        progress: 0,
      },

      // Registration stats fetched from backend
      registrationStats: null,
      registrationStatsLoading: false,
      registrationStatsError: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading, error: null }),
      setError: (error) => set({ error, isLoading: false }),
      clearError: () => set({ error: null }),

      setUser: (user) => {
        try {
          localStorage.setItem('ayursutra_user', JSON.stringify(user));
          set({ user, isAuthenticated: true, isLoading: false, isInitialized: true, error: null });
        } catch {
          set({ error: 'Failed to save user data', isLoading: false });
        }
      },

      clearUser: () => {
        clearAllTokens();
        set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true, error: null });
      },

      handleAuthFailure: () => {
        clearAllTokens();
        set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true, error: null });
        get().clearRegistrationData();
        set({ registrationStats: null, registrationStatsLoading: false, registrationStatsError: null });
      },

      // Registration data management (form)
      updateRegistrationStep: (step, progress) =>
        set((state) => ({ registrationData: { ...state.registrationData, step, progress } })),

      updateRegistrationData: (type, data) =>
        set((state) => ({ registrationData: { ...state.registrationData, [type]: data } })),

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

      // Fetch registration stats from backend (exact data)
      fetchRegistrationStats: async (params = { scope: 'me' }) => {
        set({ registrationStatsLoading: true, registrationStatsError: null });
        try {
          const res = await api.get('/auth/registration-stats', { params });
          if (!res.data?.success) throw new Error(res.data?.message || 'Failed to fetch registration stats');
          set({ registrationStats: res.data.data, registrationStatsLoading: false, registrationStatsError: null });
          return { success: true, data: res.data.data };
        } catch (error) {
          const msg = error.response?.data?.message || error.message || 'Failed to fetch registration stats';
          set({ registrationStatsLoading: false, registrationStatsError: msg });
          return { success: false, error: msg };
        }
      },

      // Registration flow
      registerPersonalInfo: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const cleanData = processFormData(data);
          const response = await api.post('/auth/register/personal-info', cleanData);
          if (response.data.success) {
            get().updateRegistrationData('personalInfo', cleanData);
            get().updateRegistrationStep('medical-history', 25);
            set({ isLoading: false, error: null });
            toast.success('Personal information saved!');
            // Refresh stats
            get().fetchRegistrationStats({ scope: 'me' });
            return { success: true, data: response.data.data };
          }
          throw new Error(response.data.message || 'Registration failed');
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      registerMedicalHistory: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const processedData = { ...data };
          if (!processedData.email) throw new Error('Email is required for medical history registration');
          const response = await api.post('/auth/register/medical-history', processedData);
          if (response.data.success) {
            get().updateRegistrationData('medicalHistory', processedData);
            get().updateRegistrationStep('dosha-assessment', 50);
            set({ isLoading: false, error: null });
            toast.success('Medical history saved!');
            // Refresh stats since counts may change
            get().fetchRegistrationStats({ scope: 'me' });
            return { success: true, data: response.data.data };
          }
          throw new Error(response.data.message || 'Medical history save failed');
        } catch (error) {
          let errorMessage = error.response?.data?.message || error.message || 'Medical history save failed';
          if (error.response?.data?.errors) {
            const details = error.response.data.errors.map((e) => e.message || e).join(', ');
            errorMessage += `: ${details}`;
          }
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage, details: error.response?.data };
        }
      },

      registerDoshaAssessment: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const cleanData = processFormData(data);
          const response = await api.post('/auth/register/dosha-assessment', cleanData);
          if (response.data.success) {
            get().updateRegistrationData('doshaAssessment', cleanData);
            get().updateRegistrationStep('complete-registration', 75);
            set({ isLoading: false, error: null });
            toast.success('Dosha assessment completed!');
            // Refresh stats since dosha impacts charts/score
            get().fetchRegistrationStats({ scope: 'me' });
            return { success: true, data: response.data.data };
          }
          throw new Error(response.data.message || 'Dosha assessment failed');
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Dosha assessment failed';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      completeRegistration: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const cleanData = processFormData(data);
          const response = await api.post('/auth/register/complete', cleanData);
          if (response.data.success) {
            get().updateRegistrationStep('sms-verification', 90);
            set({ isLoading: false, error: null });
            toast.success('Registration completed! Verify your phone.');
            return { success: true, data: response.data.data };
          }
          throw new Error(response.data.message || 'Registration completion failed');
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Registration completion failed';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      verifySMS: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/verify-sms', data);
          const responseData = response.data.data;
          if (!responseData) throw new Error('Invalid response format');

          const accessToken = responseData.accessToken;
          const refreshToken = responseData.refreshToken;
          const patient = responseData.patient;
          if (!accessToken || !refreshToken || !patient) {
            throw new Error('SMS verification response missing required data');
          }

          storeTokens(accessToken, refreshToken);
          get().setUser(patient);
          get().clearRegistrationData();

          // Refresh stats post verification
          get().fetchRegistrationStats({ scope: 'me' });

          toast.success('Welcome to AyurSutra Wellness!');
          return { success: true, user: patient };
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'SMS verification failed';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      checkAuthStatus: () => {
        try {
          const storedUser = localStorage.getItem('ayursutra_user');
          const accessToken = getAccessToken();
          if (storedUser && accessToken) {
            try {
              const user = JSON.parse(storedUser);
              set({ user, isAuthenticated: true, isLoading: false, isInitialized: true, error: null });
              // Refresh stats when app initializes and user is authenticated
              get().fetchRegistrationStats({ scope: 'me' });
              return { authenticated: true };
            } catch {
              clearAllTokens();
            }
          }
          set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true, error: null });
          return { authenticated: false };
        } catch {
          clearAllTokens();
          set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true, error: 'Authentication check failed' });
          return { authenticated: false };
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          clearAllTokens();
          const response = await api.post('/auth/login', credentials);
          const data = response.data.data;
          if (!data) throw new Error('Invalid response format');

          const accessToken = data.accessToken;
          const refreshToken = data.refreshToken;
          const patient = data.patient;
          if (!accessToken || !refreshToken || !patient) {
            throw new Error('Login response missing required data');
          }

          storeTokens(accessToken, refreshToken);
          get().setUser(patient);
          toast.success('Login successful!');

          // Fetch stats right after login
          get().fetchRegistrationStats({ scope: 'me' });

          return { success: true, user: patient };
        } catch (error) {
          clearAllTokens();
          const errorMessage = error.response?.data?.message || error.message || 'Login failed';
          set({ isLoading: false, isInitialized: true, error: errorMessage });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/auth/logout');
        } catch {}
        clearAllTokens();
        get().clearRegistrationData();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: null,
          registrationStats: null,
          registrationStatsLoading: false,
          registrationStatsError: null,
        });
        toast.success('Logged out successfully');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      },
    }),
    {
      name: 'ayursutra-auth',
      partialize: (state) => ({
        registrationData: state.registrationData, // keep form progress only
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.user = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          state.isInitialized = false;
          state.error = null;
          state.registrationStats = null;
          state.registrationStatsLoading = false;
          state.registrationStatsError = null;
        }
      },
    }
  )
);

export { api };