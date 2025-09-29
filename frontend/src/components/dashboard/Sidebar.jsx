// components/dashboard/Sidebar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Calendar, 
  FileText, 
  Heart, 
  Settings, 
  Target,
  Activity,
  Pill,
  X,
  Leaf
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/dashboard/profile', icon: User }, // Fixed: Added /dashboard prefix
    { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar }, // Fixed: Added /dashboard prefix
    { name: 'Medical Records', href: '/dashboard/medical-records', icon: FileText }, // Fixed: Added /dashboard prefix
    { name: 'Dosha Profile', href: '/dashboard/dosha-profile', icon: Target }, // Fixed: Added /dashboard prefix
    { name: 'Wellness Journey', href: '/dashboard/wellness', icon: Activity }, // Fixed: Added /dashboard prefix
    { name: 'Prescriptions', href: '/dashboard/prescriptions', icon: Pill }, // Fixed: Added /dashboard prefix
    { name: 'Health Reports', href: '/dashboard/reports', icon: Heart }, // Fixed: Added /dashboard prefix
    { name: 'Settings', href: '/dashboard/settings', icon: Settings }, // Fixed: Added /dashboard prefix
  ];

  const handleLinkClick = () => {
    // Close sidebar on mobile when link is clicked
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo and Close Button */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <NavLink to="/dashboard" className="flex items-center space-x-2" onClick={handleLinkClick}>
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AyurSutra</span>
          </NavLink>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={handleLinkClick}
                  className={({ isActive }) => `
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive
                      ? 'bg-green-100 text-green-700 border-r-2 border-green-500'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`
                    mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200
                    ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}
                  `} />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Quick Actions */}
        <div className="mt-8 px-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <NavLink 
                to="/dashboard/appointments" 
                onClick={handleLinkClick}
                className="block w-full text-left text-sm text-green-700 hover:text-green-800 py-1 rounded transition-colors"
              >
                📅 Book Appointment
              </NavLink>
              <NavLink 
                to="/dashboard/prescriptions" 
                onClick={handleLinkClick}
                className="block w-full text-left text-sm text-green-700 hover:text-green-800 py-1 rounded transition-colors"
              >
                💊 View Prescriptions
              </NavLink>
              <NavLink 
                to="/dashboard/reports" 
                onClick={handleLinkClick}
                className="block w-full text-left text-sm text-green-700 hover:text-green-800 py-1 rounded transition-colors"
              >
                📊 Health Summary
              </NavLink>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Need Help?</h4>
            <p className="text-xs text-gray-600 mb-2">
              Contact our support team for assistance
            </p>
            <button 
              onClick={() => {
                // Add support functionality here
                console.log('Support clicked');
              }}
              className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              Get Support →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;