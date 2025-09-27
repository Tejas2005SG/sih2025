import { create } from 'zustand';
import { api } from './authStore';
import toast from 'react-hot-toast';

export const useDashboardStore = create((set, get) => ({
  // State
  appointments: [],
  upcomingAppointments: [],
  recentActivity: [],
  healthStats: {
    totalAppointments: 0,
    completedConsultations: 0,
    activePrescriptions: 0,
    healthScore: 0,
    wellnessJourneyDays: 0
  },
  notifications: [],
  quickStats: {
    todaysAppointments: 0,
    pendingTasks: 0,
    unreadMessages: 0,
    healthAlerts: 0
  },
  wellnessJourney: {
    currentPhase: 'Assessment',
    completedMilestones: [],
    nextMilestone: null,
    progressPercentage: 0
  },
  isLoading: false,
  lastUpdated: null,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  
  setAppointments: (appointments) => set({ appointments }),
  
  setUpcomingAppointments: (appointments) => set({ upcomingAppointments: appointments }),
  
  setRecentActivity: (activity) => set({ recentActivity: activity }),
  
  setHealthStats: (stats) => set({ healthStats: stats }),
  
  setNotifications: (notifications) => set({ notifications }),
  
  setQuickStats: (stats) => set({ quickStats: stats }),
  
  setWellnessJourney: (journey) => set({ wellnessJourney: journey }),

  // API Methods
  fetchDashboardData: async () => {
    set({ isLoading: true });
    try {
      const [
        appointmentsRes,
        activityRes,
        statsRes,
        notificationsRes
      ] = await Promise.allSettled([
        api.get('/appointments'),
        api.get('/dashboard/recent-activity'),
        api.get('/dashboard/health-stats'),
        api.get('/notifications')
      ]);

      // Process appointments
      if (appointmentsRes.status === 'fulfilled' && appointmentsRes.value.data.success) {
        const appointments = appointmentsRes.value.data.data;
        const upcoming = appointments.filter(apt => 
          new Date(apt.dateTime) > new Date() && apt.status !== 'cancelled'
        ).slice(0, 5);
        
        set({ 
          appointments,
          upcomingAppointments: upcoming
        });
      }

      // Process recent activity
      if (activityRes.status === 'fulfilled' && activityRes.value.data.success) {
        set({ recentActivity: activityRes.value.data.data });
      }

      // Process health stats
      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        set({ healthStats: statsRes.value.data.data });
      }

      // Process notifications
      if (notificationsRes.status === 'fulfilled' && notificationsRes.value.data.success) {
        set({ notifications: notificationsRes.value.data.data });
      }

      // Update quick stats
      get().updateQuickStats();
      
      set({ 
        isLoading: false,
        lastUpdated: new Date()
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch dashboard data:', error);
      return { success: false, error: error.message };
    }
  },

  updateQuickStats: () => {
    const { appointments, notifications, recentActivity } = get();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.dateTime);
      return aptDate >= today && aptDate < tomorrow && apt.status !== 'cancelled';
    }).length;

    const unreadMessages = notifications.filter(notif => 
      !notif.read && notif.type === 'message'
    ).length;

    const healthAlerts = notifications.filter(notif => 
      !notif.read && notif.type === 'health_alert'
    ).length;

    const pendingTasks = recentActivity.filter(activity => 
      activity.status === 'pending'
    ).length;

    set({
      quickStats: {
        todaysAppointments,
        pendingTasks,
        unreadMessages,
        healthAlerts
      }
    });
  },

  fetchAppointments: async () => {
    try {
      const response = await api.get('/appointments');
      if (response.data.success) {
        const appointments = response.data.data;
        const upcoming = appointments.filter(apt => 
          new Date(apt.dateTime) > new Date() && apt.status !== 'cancelled'
        ).slice(0, 5);
        
        set({ 
          appointments,
          upcomingAppointments: upcoming
        });
        
        return { success: true, data: appointments };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch appointments';
      console.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  bookAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      if (response.data.success) {
        const newAppointment = response.data.data;
        set((state) => ({
          appointments: [...state.appointments, newAppointment]
        }));
        
        // Update upcoming appointments
        get().fetchAppointments();
        
        toast.success('Appointment booked successfully!');
        return { success: true, data: newAppointment };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to book appointment';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  cancelAppointment: async (appointmentId) => {
    try {
      const response = await api.delete(`/appointments/${appointmentId}`);
      if (response.data.success) {
        set((state) => ({
          appointments: state.appointments.filter(apt => apt._id !== appointmentId),
          upcomingAppointments: state.upcomingAppointments.filter(apt => apt._id !== appointmentId)
        }));
        
        toast.success('Appointment cancelled successfully!');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel appointment';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  rescheduleAppointment: async (appointmentId, newDateTime) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}`, {
        dateTime: newDateTime
      });
      if (response.data.success) {
        const updatedAppointment = response.data.data;
        set((state) => ({
          appointments: state.appointments.map(apt => 
            apt._id === appointmentId ? updatedAppointment : apt
          ),
          upcomingAppointments: state.upcomingAppointments.map(apt => 
            apt._id === appointmentId ? updatedAppointment : apt
          )
        }));
        
        toast.success('Appointment rescheduled successfully!');
        return { success: true, data: updatedAppointment };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reschedule appointment';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      if (response.data.success) {
        set((state) => ({
          notifications: state.notifications.map(notif => 
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        }));
        
        get().updateQuickStats();
        return { success: true };
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return { success: false, error: error.message };
    }
  },

  clearAllNotifications: async () => {
    try {
      const response = await api.put('/notifications/mark-all-read');
      if (response.data.success) {
        set((state) => ({
          notifications: state.notifications.map(notif => ({ ...notif, read: true }))
        }));
        
        get().updateQuickStats();
        toast.success('All notifications marked as read');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to clear notifications';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  updateWellnessJourney: async (milestoneId) => {
    try {
      const response = await api.post('/wellness/complete-milestone', { milestoneId });
      if (response.data.success) {
        set({ wellnessJourney: response.data.data });
        toast.success('Milestone completed! 🎉');
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update wellness journey';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  refreshDashboard: () => {
    get().fetchDashboardData();
  },

  clearDashboardData: () => set({
    appointments: [],
    upcomingAppointments: [],
    recentActivity: [],
    healthStats: {
      totalAppointments: 0,
      completedConsultations: 0,
      activePrescriptions: 0,
      healthScore: 0,
      wellnessJourneyDays: 0
    },
    notifications: [],
    quickStats: {
      todaysAppointments: 0,
      pendingTasks: 0,
      unreadMessages: 0,
      healthAlerts: 0
    },
    wellnessJourney: {
      currentPhase: 'Assessment',
      completedMilestones: [],
      nextMilestone: null,
      progressPercentage: 0
    },
    isLoading: false,
    lastUpdated: null
  }),
}));