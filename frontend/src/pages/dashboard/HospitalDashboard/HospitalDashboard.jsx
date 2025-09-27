import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { 
  Users, 
  Calendar, 
  Activity, 
  TrendingUp, 
  Stethoscope,
  BedDouble,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const HospitalDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    todayAppointments: 0,
    bedOccupancy: 0,
    revenue: 0,
    emergencyCases: 0
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'appointment',
      message: 'New appointment scheduled with Dr. Smith',
      time: '2 minutes ago',
      status: 'info'
    },
    {
      id: 2,
      type: 'admission',
      message: 'Patient John Doe admitted to ICU',
      time: '15 minutes ago',
      status: 'warning'
    },
    {
      id: 3,
      type: 'discharge',
      message: 'Patient Mary Johnson discharged',
      time: '1 hour ago',
      status: 'success'
    }
  ]);

  useEffect(() => {
    // Simulate API call to fetch hospital stats
    setStats({
      totalDoctors: 45,
      totalPatients: 1250,
      todayAppointments: 78,
      bedOccupancy: 85,
      revenue: 125000,
      emergencyCases: 12
    });
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl text-white p-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.hospitalName || 'Hospital Admin'}!
        </h1>
        <p className="text-blue-100">
          Here's what's happening at your hospital today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Doctors"
          value={stats.totalDoctors}
          icon={Stethoscope}
          color="bg-blue-500"
          change={8}
        />
        <StatCard
          title="Total Patients"
          value={stats.totalPatients.toLocaleString()}
          icon={Users}
          color="bg-green-500"
          change={12}
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={Calendar}
          color="bg-purple-500"
          change={-5}
        />
        <StatCard
          title="Bed Occupancy"
          value={`${stats.bedOccupancy}%`}
          icon={BedDouble}
          color="bg-orange-500"
          change={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className={`p-2 rounded-full ${
                    activity.status === 'info' ? 'bg-blue-100' :
                    activity.status === 'warning' ? 'bg-yellow-100' :
                    'bg-green-100'
                  }`}>
                    {activity.status === 'info' && <Activity className="h-4 w-4 text-blue-600" />}
                    {activity.status === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                    {activity.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👨‍⚕️</span>
                  <div>
                    <div className="font-medium text-gray-900">Add New Doctor</div>
                    <div className="text-sm text-gray-600">Register a new doctor</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <div className="font-medium text-gray-900">Manage Schedules</div>
                    <div className="text-sm text-gray-600">Doctor schedules & shifts</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="font-medium text-gray-900">View Reports</div>
                    <div className="text-sm text-gray-600">Hospital analytics</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Emergency Status */}
          <div className="bg-red-50 rounded-xl border border-red-200 p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4">🚨 Emergency Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-red-700">Active Cases</span>
                <span className="text-sm font-medium text-red-900">{stats.emergencyCases}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-red-700">ICU Beds Available</span>
                <span className="text-sm font-medium text-red-900">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-red-700">Emergency Room</span>
                <span className="text-sm font-medium text-green-700">Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;