import React from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Heart, 
  TrendingUp, 
  Activity,
  Pill,
  Users
} from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useAuthStore } from '../../stores/authStore';

const QuickStats = () => {
  const { healthStats, quickStats, upcomingAppointments } = useDashboardStore();
  const { user } = useAuthStore();

  const stats = [
    {
      name: 'Total Appointments',
      value: healthStats.totalAppointments || 0,
      change: '+12%',
      changeType: 'increase',
      icon: Calendar,
      color: 'blue',
      description: 'Consultations booked'
    },
    {
      name: 'Health Score',
      value: `${healthStats.healthScore || 85}%`,
      change: '+5%',
      changeType: 'increase',
      icon: Heart,
      color: 'green',
      description: 'Overall wellness rating'
    },
    {
      name: 'Active Prescriptions',
      value: healthStats.activePrescriptions || 0,
      change: 'No change',
      changeType: 'neutral',
      icon: Pill,
      color: 'purple',
      description: 'Current medications'
    },
    {
      name: 'Wellness Journey',
      value: `${healthStats.wellnessJourneyDays || 0} days`,
      change: 'Since start',
      changeType: 'neutral',
      icon: TrendingUp,
      color: 'yellow',
      description: 'On your wellness path'
    }
  ];

  const todayStats = [
    {
      name: "Today's Appointments",
      value: quickStats.todaysAppointments,
      icon: Clock,
      color: 'bg-blue-500'
    },
    {
      name: 'Pending Tasks',
      value: quickStats.pendingTasks,
      icon: FileText,
      color: 'bg-orange-500'
    },
    {
      name: 'Unread Messages',
      value: quickStats.unreadMessages,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      name: 'Health Alerts',
      value: quickStats.healthAlerts,
      icon: Activity,
      color: 'bg-red-500'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200'
    };
    return colorMap[color] || colorMap.green;
  };

  const getChangeColor = (changeType) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <p className={`ml-2 text-sm font-medium ${getChangeColor(stat.changeType)}`}>
                        {stat.change}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Quick Stats */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {todayStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-600">{stat.name}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Appointments Preview */}
      {upcomingAppointments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
            <a href="/appointments" className="text-sm text-green-600 hover:text-green-700 font-medium">
              View all →
            </a>
          </div>
          <div className="space-y-3">
            {upcomingAppointments.slice(0, 3).map((appointment, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {appointment.doctorName || 'Dr. Ayurveda Specialist'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.dateTime).toLocaleDateString()} at{' '}
                    {new Date(appointment.dateTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    appointment.type === 'video' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {appointment.type || 'In-person'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Metrics Chart Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Health Trends (Last 30 Days)</h3>
        <div className="h-64 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Health metrics visualization</p>
            <p className="text-sm text-gray-500">Track your wellness progress over time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;