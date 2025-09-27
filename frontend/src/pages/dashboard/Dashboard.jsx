import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useDashboardStore } from '../../stores/dashboardStore';
import WelcomeSection from '../../components/dashboard/WelcomeSection';
import QuickStats from '../../components/dashboard/QuickStats';
import RecentActivity from '../../components/dashboard/RecentActivity';
import WellnessJourney from '../../components/dashboard/WellnessJourney';
import DoshaProfile from '../../components/dashboard/DoshaProfile';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { fetchDashboardData, isLoading, hasError, errorMessage, clearError } = useDashboardStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (user && user.isPhoneVerified && !hasFetched.current) {
      hasFetched.current = true;
      clearError(); // Clear errors before fetching
      fetchDashboardData();
    }
  }, [user?.isPhoneVerified]); // Only depend on phone verification status

  // Reset the fetch flag when user changes
  useEffect(() => {
    if (!user || !user.isPhoneVerified) {
      hasFetched.current = false;
    }
  }, [user?.isPhoneVerified]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-48 bg-gray-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-xl"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (hasError && errorMessage) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <button
            onClick={() => {
              clearError();
              fetchDashboardData();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <WelcomeSection />

      {/* Quick Stats */}
      <QuickStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Takes 2/3 width */}
        <div className="xl:col-span-2 space-y-8">
          {/* Recent Activity */}
          <RecentActivity />
          
          {/* Wellness Journey */}
          <WellnessJourney />
        </div>

        {/* Right Column - Takes 1/3 width */}
        <div className="space-y-8">
          {/* Dosha Profile */}
          <DoshaProfile />

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <div className="font-medium text-gray-900">Book Appointment</div>
                    <div className="text-sm text-gray-600">Schedule a consultation</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💊</span>
                  <div>
                    <div className="font-medium text-gray-900">View Prescriptions</div>
                    <div className="text-sm text-gray-600">Check current medications</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="font-medium text-gray-900">Health Reports</div>
                    <div className="text-sm text-gray-600">View latest reports</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="font-medium text-gray-900">Update Goals</div>
                    <div className="text-sm text-gray-600">Manage wellness goals</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Health Tips Card */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">💡 Today's Health Tip</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                <strong>Morning Ritual:</strong> Start your day with warm water mixed with lemon and a pinch of ginger. This helps stimulate your digestive fire (Agni) and balances all three doshas.
              </p>
              <div className="bg-white bg-opacity-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">
                  <strong>Why it works:</strong> Warm water aids circulation, lemon provides vitamin C and aids detox, while ginger boosts metabolism and digestion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;