import React, { useState } from 'react';
import { Menu, Bell, Search, User, Settings, LogOut, Smartphone } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useDashboardStore } from '../../stores/dashboardStore';
import Button from '../common/Button';

const Header = ({ onMenuClick }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user, logout } = useAuthStore();
  const { notifications, quickStats } = useDashboardStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 lg:border-l lg:border-l-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            icon={Menu}
            onClick={onMenuClick}
            className="lg:hidden"
          />
          
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Search bar - hidden on mobile */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments, records, or prescriptions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Quick Stats - visible on larger screens */}
          <div className="hidden xl:flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="font-semibold text-green-600">{quickStats.todaysAppointments}</div>
              <div className="text-gray-500">Today's Appointments</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">{quickStats.pendingTasks}</div>
              <div className="text-gray-500">Pending Tasks</div>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              icon={Bell}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification, index) => (
                      <div key={index} className={`p-4 border-b border-gray-100 ${!notification.read ? 'bg-blue-50' : ''}`}>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {notification.type === 'appointment' && <Bell className="w-5 h-5 text-blue-500" />}
                            {notification.type === 'health_alert' && <Smartphone className="w-5 h-5 text-red-500" />}
                            {notification.type === 'message' && <User className="w-5 h-5 text-green-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No notifications yet
                    </div>
                  )}
                </div>
                {notifications.length > 5 && (
                  <div className="p-4 border-t border-gray-200">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Notifications
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.primaryDosha || 'Patient'}
                </div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
                <div className="py-2">
                  <a
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-3" />
                    View Profile
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;