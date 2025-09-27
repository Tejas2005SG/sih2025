import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';

// Components and Pages
import AuthProvider from './components/common/AuthProvider';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';

// Dashboard Components
import WelcomeSection from './components/dashboard/WelcomeSection';
import QuickStats from './components/dashboard/QuickStats';
import RecentActivity from './components/dashboard/RecentActivity';
import WellnessJourney from './components/dashboard/WellnessJourney';
import DoshaProfile from './components/dashboard/DoshaProfile';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import NotFound from './pages/NotFound';
import HomePage from './pages/Homepage/Homepage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Main Dashboard Component
const Dashboard = () => {
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
        </div>

        {/* Right Column - Takes 1/3 width */}
        <div className="space-y-8">
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

// Create simplified page components that don't wrap themselves in DashboardLayout
const ProfilePage = () => {
  const { user } = useAuthStore();
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <p className="text-gray-900">{user?.firstName} {user?.lastName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <p className="text-gray-900">{user?.phoneNumber || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Dosha</label>
            <p className="text-gray-900">{user?.doshaAssessment?.primaryDosha || 'Not assessed'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppointmentsPage = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Appointments</h1>
      <p className="text-gray-600">Your appointment management will be displayed here.</p>
    </div>
  </div>
);

const MedicalRecordsPage = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Medical Records</h1>
      <p className="text-gray-600">Your medical records will be displayed here.</p>
    </div>
  </div>
);

const PrescriptionsPage = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Prescriptions</h1>
      <p className="text-gray-600">Your prescriptions will be displayed here.</p>
    </div>
  </div>
);

const HealthReportsPage = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Health Reports</h1>
      <p className="text-gray-600">Your health reports will be displayed here.</p>
    </div>
  </div>
);

const SettingsPage = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
      <p className="text-gray-600">Your account settings will be displayed here.</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public home page route */}
              <Route path="/" element={<HomePage />} />
              
              {/* Public auth routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register/*" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/forgot-password" 
                element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/reset-password" 
                element={
                  <PublicRoute>
                    <ResetPasswordPage />
                  </PublicRoute>
                } 
              />

              {/* Protected dashboard routes with nested layout */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* Nested routes that will render inside DashboardLayout */}
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="appointments" element={<AppointmentsPage />} />
                <Route path="medical-records" element={<MedicalRecordsPage />} />
                <Route path="dosha-profile" element={<DoshaProfile />} />
                <Route path="wellness" element={<WellnessJourney />} />
                <Route path="prescriptions" element={<PrescriptionsPage />} />
                <Route path="reports" element={<HealthReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Redirect authenticated users from root to dashboard */}
              <Route 
                path="/home" 
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                } 
              />

              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#111827',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;