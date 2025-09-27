import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  FileText, 
  Pill, 
  Heart, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Filter
} from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';
import Button from '../common/Button';

const RecentActivity = () => {
  const { recentActivity, fetchDashboardData } = useDashboardStore();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Mock data for demonstration
  const mockActivities = [
    {
      id: 1,
      type: 'appointment',
      title: 'Consultation Completed',
      description: 'Initial consultation with Dr. Sharma',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'completed',
      details: {
        doctor: 'Dr. Rajesh Sharma',
        duration: '45 minutes',
        notes: 'Discussed wellness plan and dietary recommendations'
      }
    },
    {
      id: 2,
      type: 'prescription',
      title: 'New Prescription Added',
      description: 'Triphala tablets prescribed for digestion',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      status: 'active',
      details: {
        medication: 'Triphala',
        dosage: '2 tablets daily',
        duration: '30 days'
      }
    },
    {
      id: 3,
      type: 'assessment',
      title: 'Dosha Assessment Completed',
      description: 'Your constitution analysis is ready',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      status: 'completed',
      details: {
        primaryDosha: 'Vata',
        secondaryDosha: 'Pitta',
        accuracy: '92%'
      }
    },
    {
      id: 4,
      type: 'health_record',
      title: 'Health Metrics Updated',
      description: 'Blood pressure and weight recorded',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: 'completed',
      details: {
        bloodPressure: '120/80 mmHg',
        weight: '70 kg',
        notes: 'Normal readings'
      }
    },
    {
      id: 5,
      type: 'appointment',
      title: 'Upcoming Appointment',
      description: 'Follow-up consultation scheduled',
      timestamp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      status: 'scheduled',
      details: {
        doctor: 'Dr. Priya Patel',
        type: 'Video consultation',
        duration: '30 minutes'
      }
    },
    {
      id: 6,
      type: 'lifestyle',
      title: 'Wellness Goal Achieved',
      description: 'Completed 7-day morning yoga routine',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      status: 'completed',
      details: {
        goal: 'Morning Yoga',
        streak: '7 days',
        achievement: 'Consistency Badge'
      }
    }
  ];

  const activities = recentActivity.length > 0 ? recentActivity : mockActivities;

  const getActivityIcon = (type) => {
    const iconMap = {
      appointment: Calendar,
      prescription: Pill,
      health_record: Heart,
      assessment: FileText,
      lifestyle: User,
      message: Info
    };
    return iconMap[type] || Info;
  };

  const getActivityColor = (type, status) => {
    if (status === 'completed') return 'text-green-600 bg-green-100';
    if (status === 'scheduled') return 'text-blue-600 bg-blue-100';
    if (status === 'pending') return 'text-yellow-600 bg-yellow-100';
    if (status === 'cancelled') return 'text-red-600 bg-red-100';
    
    const colorMap = {
      appointment: 'text-blue-600 bg-blue-100',
      prescription: 'text-purple-600 bg-purple-100',
      health_record: 'text-red-600 bg-red-100',
      assessment: 'text-green-600 bg-green-100',
      lifestyle: 'text-indigo-600 bg-indigo-100',
      message: 'text-gray-600 bg-gray-100'
    };
    return colorMap[type] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (diff < 0) {
      const futureDays = Math.floor(-diff / 86400000);
      const futureHours = Math.floor(-diff / 3600000);
      if (futureDays > 0) return `in ${futureDays} day${futureDays > 1 ? 's' : ''}`;
      if (futureHours > 0) return `in ${futureHours} hour${futureHours > 1 ? 's' : ''}`;
      return 'upcoming';
    }

    if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return timestamp.toLocaleDateString();
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.timestamp) - new Date(a.timestamp);
    if (sortBy === 'type') return a.type.localeCompare(b.type);
    return 0;
  });

  const filterOptions = [
    { value: 'all', label: 'All Activities' },
    { value: 'appointment', label: 'Appointments' },
    { value: 'prescription', label: 'Prescriptions' },
    { value: 'health_record', label: 'Health Records' },
    { value: 'assessment', label: 'Assessments' },
    { value: 'lifestyle', label: 'Lifestyle' }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <Button
            variant="outline"
            size="sm"
            icon={Filter}
            onClick={() => {/* Handle filter modal */}}
          >
            Filter
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                filter === option.value
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-200">
        {sortedActivities.length > 0 ? (
          sortedActivities.slice(0, 10).map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const colorClasses = getActivityColor(activity.type, activity.status);
            
            return (
              <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${colorClasses}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(activity.status)}
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {activity.description}
                    </p>

                    {/* Activity Details */}
                    {activity.details && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {Object.entries(activity.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-500 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <span className="text-gray-900 font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 mt-3">
                      {activity.type === 'appointment' && activity.status === 'scheduled' && (
                        <>
                          <button className="text-xs text-green-600 hover:text-green-700 font-medium">
                            Join Call
                          </button>
                          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                            Reschedule
                          </button>
                        </>
                      )}
                      {activity.type === 'prescription' && (
                        <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                          View Details
                        </button>
                      )}
                      {activity.type === 'health_record' && (
                        <button className="text-xs text-red-600 hover:text-red-700 font-medium">
                          View Record
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
            <p className="text-gray-600">
              Your recent health activities will appear here as you use the platform.
            </p>
          </div>
        )}
      </div>

      {/* View All Button */}
      {sortedActivities.length > 10 && (
        <div className="p-4 border-t border-gray-200 text-center">
          <Button variant="outline" size="sm">
            View All Activities ({sortedActivities.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;