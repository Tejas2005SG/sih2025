import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useDashboardStore } from "../../stores/dashboardStore";
import { useAuthStore } from "../../stores/authStore";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { fetchDashboardData } = useDashboardStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="lg:flex h-full">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col h-full">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 p-4 lg:p-6 bg-gray-50 overflow-y-auto">
            {/* Render child pages or Outlet for routing */}
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;