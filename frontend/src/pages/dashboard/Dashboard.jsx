// Dashboard.jsx - Updated with error fixes
import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useDashboardStore } from '../../stores/dashboardStore';

// Import components with error handling
const ComponentWrapper = ({ children, fallback = null }) => {
  try {
    return children;
  } catch (error) {
    console.error('Component render error:', error);
    return fallback || <div className="p-4 text-gray-500">Component failed to load</div>;
  }
};

// Lazy load components to handle missing imports
const WelcomeSection = React.lazy(() => 
  import('../../components/dashboard/WelcomeSection').catch(() => ({
    default: () => <div className="bg-white p-6 rounded-xl">Welcome Section Loading...</div>
  }))
);

const QuickStats = React.lazy(() => 
  import('../../components/dashboard/QuickStats').catch(() => ({
    default: () => <div className="bg-white p-6 rounded-xl">Quick Stats Loading...</div>
  }))
);

const RecentActivity = React.lazy(() => 
  import('../../components/dashboard/RecentActivity').catch(() => ({
    default: () => <div className="bg-white p-6 rounded-xl">Recent Activity Loading...</div>
  }))
);

const WellnessJourney = React.lazy(() => 
  import('../../components/dashboard/WellnessJourney').catch(() => ({
    default: () => <div className="bg-white p-6 rounded-xl">Wellness Journey Loading...</div>
  }))
);

const DoshaProfile = React.lazy(() => 
  import('../../components/dashboard/DoshaProfile').catch(() => ({
    default: () => <div className="bg-white p-6 rounded-xl">Dosha Profile Loading...</div>
  }))
);

const Dashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { 
    fetchDashboardData, 
    isLoading, 
    hasError, 
    errorMessage, 
    clearError,
    dashboardData 
  } = useDashboardStore();
  
  const hasFetched = useRef(false);
  const [componentError, setComponentError] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('Dashboard component mounted:', {
      user: !!user,
      isAuthenticated,
      isPhoneVerified: user?.isPhoneVerified,
      hasFetched: hasFetched.current
    });
  }, [user, isAuthenticated]);

  // Fetch dashboard data
  useEffect(() => {
    const shouldFetch = user && 
                       isAuthenticated && 
                       user.isPhoneVerified && 
                       !hasFetched.current && 
                       !isLoading;

    console.log('Dashboard fetch check:', {
      shouldFetch,
      user: !!user,
      isAuthenticated,
      isPhoneVerified: user?.isPhoneVerified,
      hasFetched: hasFetched.current,
      isLoading
    });

    if (shouldFetch) {
      console.log('Fetching dashboard data...');
      hasFetched.current = true;
      clearError();
      
      fetchDashboardData().catch(error => {
        console.error('Dashboard fetch error:', error);
        hasFetched.current = false; // Allow retry
      });
    }
  }, [user, isAuthenticated, user?.isPhoneVerified, isLoading, fetchDashboardData, clearError]);

  // Reset fetch flag when user changes
  useEffect(() => {
    if (!user || !user.isPhoneVerified || !isAuthenticated) {
      console.log('Resetting fetch flag due to user/auth change');
      hasFetched.current = false;
    }
  }, [user?.id, user?.isPhoneVerified, isAuthenticated]);

  // Error boundary for component errors
  const handleComponentError = (error) => {
    console.error('Dashboard component error:', error);
    setComponentError(error.message);
  };

  // Show loading state
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

  // Show error state
  if (hasError && errorMessage) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <button
            onClick={() => {
              clearError();
              hasFetched.current = false;
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

  // Show component error
  if (componentError) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Component Error</h3>
          <p className="text-yellow-600 mb-4">{componentError}</p>
          <button
            onClick={() => setComponentError(null)}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show user verification required
  if (user && !user.isPhoneVerified) {
    return (
      <div className="text-center py-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Phone Verification Required</h3>
          <p className="text-blue-600 mb-4">
            Please verify your phone number to access the dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/register/verify-sms'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Verify Phone
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <React.Suspense fallback={<div className="h-48 bg-gray-100 rounded-xl animate-pulse"></div>}>
        <ComponentWrapper fallback={<div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">Welcome section unavailable</div>}>
          <WelcomeSection />
        </ComponentWrapper>
      </React.Suspense>

      <React.Suspense fallback={<div className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>}>
        <ComponentWrapper fallback={<div className="h-24 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">Quick stats unavailable</div>}>
          <QuickStats />
        </ComponentWrapper>
      </React.Suspense>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Takes 2/3 width */}
        <div className="xl:col-span-2 space-y-8">
          <React.Suspense fallback={<div className="h-96 bg-gray-100 rounded-xl animate-pulse"></div>}>
            <ComponentWrapper fallback={<div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">Recent activity unavailable</div>}>
              <RecentActivity />
            </ComponentWrapper>
          </React.Suspense>
          
          <React.Suspense fallback={<div className="h-96 bg-gray-100 rounded-xl animate-pulse"></div>}>
            <ComponentWrapper fallback={<div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">Wellness journey unavailable</div>}>
              <WellnessJourney />
            </ComponentWrapper>
          </React.Suspense>
        </div>

        {/* Right Column - Takes 1/3 width */}
        <div className="space-y-8">
          <React.Suspense fallback={<div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>}>
            <ComponentWrapper fallback={<div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">Dosha profile unavailable</div>}>
              <DoshaProfile />
            </ComponentWrapper>
          </React.Suspense>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => console.log('Book appointment clicked')}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <div className="font-medium text-gray-900">Book Appointment</div>
                    <div className="text-sm text-gray-600">Schedule a consultation</div>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => console.log('View prescriptions clicked')}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💊</span>
                  <div>
                    <div className="font-medium text-gray-900">View Prescriptions</div>
                    <div className="text-sm text-gray-600">Check current medications</div>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => console.log('Health reports clicked')}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="font-medium text-gray-900">Health Reports</div>
                    <div className="text-sm text-gray-600">View latest reports</div>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => console.log('Update goals clicked')}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors duration-200"
              >
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