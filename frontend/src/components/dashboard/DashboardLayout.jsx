// components/dashboard/DashboardLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useDashboardStore } from "../../stores/dashboardStore";
import { useAuthStore } from "../../stores/authStore";
import LoadingSpinner from "../common/Loader";
// import ErrorBoundary from "../../";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { fetchDashboardData, isLoading, error } = useDashboardStore();
  const { user, isAuthenticated } = useAuthStore();

  // Fetch dashboard data when component mounts or user changes
  useEffect(() => {
    if (user && isAuthenticated) {
      fetchDashboardData();
    }
  }, [user, isAuthenticated, fetchDashboardData]);

  // Close sidebar when clicking outside on mobile
  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  // Handle menu click from header
  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  // Show loading state while fetching initial data
  if (isLoading && !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show error state if there's an authentication error
  if (error && !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="lg:flex h-full">
        {/* Sidebar Component */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={handleSidebarClose}
        />

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300"
            onClick={handleSidebarClose}
            aria-hidden="true"
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full lg:ml-0">
          {/* Header Component */}
          <Header 
            onMenuClick={handleMenuClick}
            user={user}
          />

          {/* Main Content with Error Boundary */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-4 lg:p-6 h-full">
              {/* <ErrorBoundary> */}
                {/* This is where nested route components will render */}
                <Outlet />
              {/* </ErrorBoundary> */}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;