import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Award, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Circle,
  Star,
  Trophy,
  Clock,
  Flame
} from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useAuthStore } from '../../stores/authStore';
import Button from '../common/Button';

const WellnessJourney = () => {
  const { wellnessJourney, updateWellnessJourney } = useDashboardStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('progress');

  // Mock wellness journey data
  const mockJourneyData = {
    currentPhase: 'Foundation Building',
    progressPercentage: 65,
    daysSinceStart: user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 30,
    streak: 7,
    totalGoals: 12,
    completedGoals: 8,
    badges: [
      { id: 1, name: 'Early Bird', description: '7 days of waking up before 6 AM', earned: true, icon: '🌅' },
      { id: 2, name: 'Yoga Warrior', description: '30 minutes daily yoga for 14 days', earned: true, icon: '🧘' },
      { id: 3, name: 'Mindful Eater', description: 'Eating mindfully for 1 week', earned: true, icon: '🍽️' },
      { id: 4, name: 'Hydration Hero', description: 'Drinking 8 glasses water daily', earned: false, icon: '💧' },
      { id: 5, name: 'Sleep Champion', description: 'Consistent sleep schedule for 2 weeks', earned: false, icon: '🌙' }
    ],
    milestones: [
      {
        id: 1,
        title: 'Complete Initial Assessment',
        description: 'Finish your comprehensive health evaluation',
        completed: true,
        completedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        points: 100
      },
      {
        id: 2,
        title: 'Establish Morning Routine',
        description: 'Create and follow a consistent morning routine for 7 days',
        completed: true,
        completedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        points: 150
      },
      {
        id: 3,
        title: 'Dietary Adjustment Phase',
        description: 'Successfully implement dosha-specific dietary changes',
        completed: true,
        completedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        points: 200
      },
      {
        id: 4,
        title: 'Build Exercise Habit',
        description: 'Maintain regular exercise routine for 2 weeks',
        completed: false,
        progress: 75,
        target: 14,
        current: 10,
        points: 250
      },
      {
        id: 5,
        title: 'Stress Management Mastery',
        description: 'Practice daily meditation and stress reduction techniques',
        completed: false,
        progress: 40,
        target: 21,
        current: 8,
        points: 300
      },
      {
        id: 6,
        title: 'Complete Transformation',
        description: 'Achieve optimal balance in all areas of wellness',
        completed: false,
        progress: 0,
        points: 500
      }
    ],
    currentGoals: [
      {
        id: 1,
        title: 'Daily Pranayama',
        description: '10 minutes of breathing exercises',
        progress: 80,
        target: 7,
        current: 6,
        streak: 6,
        category: 'mindfulness'
      },
      {
        id: 2,
        title: 'Herbal Tea Routine',
        description: 'Drink dosha-specific herbal tea twice daily',
        progress: 60,
        target: 14,
        current: 8,
        streak: 4,
        category: 'nutrition'
      },
      {
        id: 3,
        title: 'Oil Pulling',
        description: 'Practice oil pulling every morning',
        progress: 90,
        target: 10,
        current: 9,
        streak: 9,
        category: 'detox'
      }
    ]
  };

  const journeyData = wellnessJourney.progressPercentage ? wellnessJourney : mockJourneyData;

  const tabs = [
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'milestones', label: 'Milestones', icon: Target },
    { id: 'goals', label: 'Current Goals', icon: CheckCircle },
    { id: 'badges', label: 'Achievements', icon: Award }
  ];

  const getCategoryColor = (category) => {
    const colorMap = {
      mindfulness: 'bg-purple-100 text-purple-700',
      nutrition: 'bg-green-100 text-green-700',
      exercise: 'bg-blue-100 text-blue-700',
      detox: 'bg-yellow-100 text-yellow-700',
      sleep: 'bg-indigo-100 text-indigo-700'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-700';
  };

  const handleMilestoneComplete = async (milestoneId) => {
    const result = await updateWellnessJourney(milestoneId);
    if (result.success) {
      // Update local state or refetch data
    }
  };

  return (
    <div className="space-y-6">
      {/* Journey Overview */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Summary */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-2">Your Wellness Journey</h2>
            <p className="text-green-100 mb-4">
              Current Phase: <span className="font-semibold">{journeyData.currentPhase}</span>
            </p>
            
            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Overall Progress</span>
                <span className="text-sm font-semibold">{journeyData.progressPercentage}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
                <div 
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${journeyData.progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{journeyData.daysSinceStart}</div>
                <div className="text-xs text-green-100">Days on Journey</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{journeyData.completedGoals}</div>
                <div className="text-xs text-green-100">Goals Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold flex items-center justify-center">
                  <Flame className="w-6 h-6 mr-1" />
                  {journeyData.streak}
                </div>
                <div className="text-xs text-green-100">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Achievement Summary */}
          <div className="text-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-300" />
              <h3 className="font-semibold mb-2">Total Achievements</h3>
              <div className="text-2xl font-bold mb-1">
                {journeyData.badges?.filter(b => b.earned).length || 0}
              </div>
              <div className="text-xs text-green-100">Badges Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Journey Information */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Journey Timeline</h3>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                  
                  {/* Timeline items */}
                  <div className="space-y-6">
                    {journeyData.milestones?.slice(0, 4).map((milestone, index) => (
                      <div key={milestone.id} className="relative flex items-center">
                        <div className={`
                          absolute left-0 w-8 h-8 rounded-full border-4 border-white z-10
                          ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'}
                        `}>
                          {milestone.completed && (
                            <CheckCircle className="w-4 h-4 text-white absolute top-0.5 left-0.5" />
                          )}
                        </div>
                        <div className="ml-12 flex-1">
                          <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                          <p className="text-sm text-gray-600">{milestone.description}</p>
                          {milestone.completed ? (
                            <p className="text-xs text-green-600 mt-1">
                              Completed {milestone.completedDate?.toLocaleDateString()}
                            </p>
                          ) : (
                            milestone.progress && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>Progress: {milestone.current}/{milestone.target}</span>
                                  <span>{milestone.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${milestone.progress}%` }}
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Wellness Milestones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {journeyData.milestones?.map((milestone) => (
                  <div key={milestone.id} className={`
                    border-2 rounded-lg p-4 transition-all duration-200
                    ${milestone.completed 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-white hover:border-green-300'
                    }
                  `}>
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                      {milestone.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                    
                    {!milestone.completed && milestone.progress && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{milestone.current}/{milestone.target} completed</span>
                          <span>{milestone.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">
                        +{milestone.points} points
                      </span>
                      {milestone.completed && (
                        <span className="text-xs text-green-600">
                          {milestone.completedDate?.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Current Goals</h3>
                <Button variant="outline" size="sm">
                  Add Goal
                </Button>
              </div>
              
              <div className="space-y-4">
                {journeyData.currentGoals?.map((goal) => (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">{goal.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(goal.category)}`}>
                          {goal.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">{goal.streak}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress: {goal.current}/{goal.target}</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Achievement Badges</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {journeyData.badges?.map((badge) => (
                  <div key={badge.id} className={`
                    border-2 rounded-lg p-4 text-center transition-all duration-200
                    ${badge.earned 
                      ? 'border-yellow-200 bg-yellow-50' 
                      : 'border-gray-200 bg-gray-50 opacity-60'
                    }
                  `}>
                    <div className="text-4xl mb-3">{badge.icon}</div>
                    <h4 className={`font-medium mb-2 ${badge.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                      {badge.name}
                    </h4>
                    <p className={`text-sm ${badge.earned ? 'text-gray-600' : 'text-gray-400'}`}>
                      {badge.description}
                    </p>
                    {badge.earned && (
                      <div className="mt-3">
                        <Star className="w-4 h-4 text-yellow-500 mx-auto" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WellnessJourney;