import React from 'react';
import { Calendar, Clock, Thermometer, Heart } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useDashboardStore } from '../../stores/dashboardStore';

const WelcomeSection = () => {
  const { user } = useAuthStore();
  const { upcomingAppointments, quickStats } = useDashboardStore();

  const nextAppointment = upcomingAppointments[0];
  const currentHour = new Date().getHours();
  
  const getGreeting = () => {
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getDoshaColor = (dosha) => {
    switch (dosha?.toLowerCase()) {
      case 'vata': return 'text-blue-600 bg-blue-100';
      case 'pitta': return 'text-red-600 bg-red-100';
      case 'kapha': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 md:p-8 text-white">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        {/* Welcome Message */}
        <div className="mb-6 lg:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {getGreeting()}, {user?.firstName}! 🌿
          </h1>
          <p className="text-black mb-4">
            Continue your wellness journey with personalized Ayurvedic care
          </p>
          
          {/* Dosha Info */}
          {user?.doshaAssessment?.primaryDosha && (
            <div className="flex items-center space-x-3">
              <span className="text-black">Your Primary Dosha:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDoshaColor(user.doshaAssessment.primaryDosha)} text-gray-800`}>
                {user.doshaAssessment.primaryDosha}
              </span>
            </div>
          )}
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:w-auto">
          {/* Next Appointment */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-black" />
            <div className="text-xs text-black">Next Appointment</div>
            <div className="font-semibold text-sm text-zinc-500">
              {nextAppointment ? (
                new Date(nextAppointment.dateTime).toLocaleDateString()
              ) : (
                'None scheduled'
              )}
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-black" />
            <div className="text-xs text-black">Today's Tasks</div>
            <div className="font-semibold text-sm text-zinc-500">{quickStats.pendingTasks}</div>
          </div>

          {/* Health Score */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
            <Heart className="w-6 h-6 mx-auto mb-2 text-black" />
            <div className="text-xs text-black ">Health Score</div>
            <div className="font-semibold text-sm text-zinc-500">85%</div>
          </div>

          {/* Wellness Days */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
            <Thermometer className="w-6 h-6 mx-auto mb-2 text-black" />
            <div className="text-xs text-black">Journey Days</div>
            <div className="font-semibold text-sm text-zinc-500">
              {user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Wellness Tip */}
      <div className="mt-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
        <h3 className="font-medium text-black mb-2">💡 Today's Wellness Tip</h3>
        <p className="text-sm text-zinc-600 ">
          Start your day with warm water and lemon to stimulate digestion and balance your doshas. 
          This simple practice aligns with Ayurvedic principles for optimal health.
        </p>
      </div>
    </div>
  );
};

export default WelcomeSection;