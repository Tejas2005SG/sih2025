import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './authStore';
import toast from 'react-hot-toast';

export const useUserStore = create(
  persist(
    (set, get) => ({
      // State
      profile: null,
      healthRecords: [],
      prescriptions: [],
      labReports: [],
      doshaProfile: null,
      preferences: {
        language: 'en',
        notifications: {
          email: true,
          sms: true,
          push: true,
          appointments: true,
          medications: true,
          wellness: true
        },
        privacy: {
          shareHealthData: false,
          anonymousUsage: true
        }
      },
      isLoading: false,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      
      setProfile: (profile) => set({ profile }),
      
      setHealthRecords: (records) => set({ healthRecords: records }),
      
      setPrescriptions: (prescriptions) => set({ prescriptions }),
      
      setLabReports: (reports) => set({ labReports: reports }),
      
      setDoshaProfile: (doshaProfile) => set({ doshaProfile }),
      
      updatePreferences: (preferences) => set((state) => ({
        preferences: { ...state.preferences, ...preferences }
      })),

      // API Methods
      fetchProfile: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/auth/profile');
          if (response.data.success) {
            set({ profile: response.data.data.patient, isLoading: false });
            return { success: true, data: response.data.data.patient };
          }
        } catch (error) {
          set({ isLoading: false });
          const errorMessage = error.response?.data?.message || 'Failed to fetch profile';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.put('/auth/profile', data);
          if (response.data.success) {
            set({ profile: response.data.data.patient, isLoading: false });
            toast.success('Profile updated successfully!');
            return { success: true, data: response.data.data.patient };
          }
        } catch (error) {
          set({ isLoading: false });
          const errorMessage = error.response?.data?.message || 'Failed to update profile';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      fetchHealthRecords: async () => {
        try {
          const response = await api.get('/health/records');
          if (response.data.success) {
            set({ healthRecords: response.data.data });
            return { success: true, data: response.data.data };
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch health records';
          console.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      addHealthRecord: async (record) => {
        try {
          const response = await api.post('/health/records', record);
          if (response.data.success) {
            const newRecord = response.data.data;
            set((state) => ({
              healthRecords: [...state.healthRecords, newRecord]
            }));
            toast.success('Health record added successfully!');
            return { success: true, data: newRecord };
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to add health record';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      updateHealthRecord: async (id, record) => {
        try {
          const response = await api.put(`/health/records/${id}`, record);
          if (response.data.success) {
            const updatedRecord = response.data.data;
            set((state) => ({
              healthRecords: state.healthRecords.map(r => 
                r._id === id ? updatedRecord : r
              )
            }));
            toast.success('Health record updated successfully!');
            return { success: true, data: updatedRecord };
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to update health record';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      deleteHealthRecord: async (id) => {
        try {
          const response = await api.delete(`/health/records/${id}`);
          if (response.data.success) {
            set((state) => ({
              healthRecords: state.healthRecords.filter(r => r._id !== id)
            }));
            toast.success('Health record deleted successfully!');
            return { success: true };
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to delete health record';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      fetchPrescriptions: async () => {
        try {
          const response = await api.get('/health/prescriptions');
          if (response.data.success) {
            set({ prescriptions: response.data.data });
            return { success: true, data: response.data.data };
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch prescriptions';
          console.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      fetchLabReports: async () => {
        try {
          const response = await api.get('/health/lab-reports');
          if (response.data.success) {
            set({ labReports: response.data.data });
            return { success: true, data: response.data.data };
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch lab reports';
          console.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      uploadDocument: async (formData) => {
        try {
          const response = await api.post('/health/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (response.data.success) {
            toast.success('Document uploaded successfully!');
            return { success: true, data: response.data.data };
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to upload document';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      fetchDoshaProfile: async () => {
        try {
          const response = await api.get('/dosha/profile');
          if (response.data.success) {
            set({ doshaProfile: response.data.data });
            return { success: true, data: response.data.data };
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch dosha profile';
          console.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      retakeDoshaAssessment: async (data) => {
        try {
          const response = await api.post('/dosha/retake-assessment', data);
          if (response.data.success) {
            set({ doshaProfile: response.data.data });
            toast.success('Dosha assessment completed successfully!');
            return { success: true, data: response.data.data };
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to complete dosha assessment';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      savePreferences: async (preferences) => {
        try {
          const response = await api.put('/user/preferences', preferences);
          if (response.data.success) {
            set((state) => ({
              preferences: { ...state.preferences, ...preferences }
            }));
            toast.success('Preferences saved successfully!');
            return { success: true };
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to save preferences';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      clearUserData: () => set({
        profile: null,
        healthRecords: [],
        prescriptions: [],
        labReports: [],
        doshaProfile: null,
        isLoading: false
      }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);