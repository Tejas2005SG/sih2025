import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp,
  MessageSquare,
  Pill,
  FileText,
  Activity
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    consultationsCompleted: 0,
    pendingReports: 0,
    nextAppointment: null
  });

  const [todaySchedule, setTodaySchedule] = useState([
    {
      id: 1,
      time: '09:00 AM',
      patient: 'John Smith',
      type: 'Consultation',
      status: 'completed'
    },
    {
      id: 2,
      time: '10:30 AM',
      patient: 'Maria Garcia',
      type: 'Follow-up',
      status: 'in-progress'
    },
    {
      id: 3,
      time: '02:00 PM',
      patient: 'David Johnson',
      type: 'New Patient',
      status: 'scheduled'
    },
    {
      id: 4,
      time: '03:30 PM',
      patient: 'Sarah Wilson',
      type: 'Consultation',
      status: 'scheduled'
    }
  ]);

  useEffect(() => {
    // Simulate API call to fetch doctor stats
    setStats({
      todayAppointments: 8,
      totalPatients: 245,
      consultationsCompleted: 156,
      pendingReports: 12,
      nextAppointment: '10:30 AM - Maria Garcia'
    });
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl text-white p-8">
        <h1 className="text-3xl font-bold mb-2">
          Good morning, Dr. {user?.firstName} {user?.lastName}!
        </h1>
        <p className="text-purple-100">
          You have {stats.todayAppointments} appointments scheduled for today.
        </p>
        {stats.nextAppointment && (
          <div className="mt-4 bg-purple-700 bg-opacity-50 rounded-lg p-4">
            <p className="text-sm text-purple-100">Next Appointment</p>
            <p className="font-medium">{stats.nextAppointment}</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={Calendar}
          color="bg-purple-500"
          description="3 remaining"
        />
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={Users}
          color="bg-blue-500"
          description="Under your care"
        />
        <StatCard
          title="Consultations"
          value={stats.consultationsCompleted}
          icon={MessageSquare}
          color="bg-green-500"
          description="This month"
        />
        <StatCard
          title="Pending Reports"
          value={stats.pendingReports}
          icon={FileText}
          color="bg-orange-500"
          description="Need review"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
            <div className="space-y-4">
              {todaySchedule.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{appointment.time}</div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.patient}</p>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button className="w-full py-2 text-center text-purple-600 hover:text-purple-700 font-medium">
                View Full Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <div className="font-medium text-gray-900">Write Prescription</div>
                    <div className="text-sm text-gray-600">Create new prescription</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👥</span>
                  <div>
                    <div className="font-medium text-gray-900">Patient Records</div>
                    <div className="text-sm text-gray-600">View patient history</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="font-medium text-gray-900">Lab Reports</div>
                    <div className="text-sm text-gray-600">Review test results</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Patient Insights */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Patient Insights</h3>
            <div className="space-y-3">
              <div className="bg-white bg-opacity-70 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  <strong>Trend Alert:</strong> 15% increase in respiratory consultations this week.
                </p>
              </div>
              <div className="bg-white bg-opacity-70 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  <strong>Follow-up Required:</strong> 8 patients due for check-ups.
                </p>
              </div>
              <div className="bg-white bg-opacity-70 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  <strong>Lab Results:</strong> 5 reports pending your review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;