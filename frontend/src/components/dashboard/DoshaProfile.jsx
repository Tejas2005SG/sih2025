import React, { useState, useEffect } from 'react';
import { Target, RefreshCw, Info, Lightbulb, Utensils, Activity, Moon } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore';
import Button from '../common/Button';
import Modal from '../common/Modal';

const DoshaProfile = () => {
  const { user } = useAuthStore();
  const { doshaProfile, fetchDoshaProfile } = useUserStore();
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDoshaProfile();
  }, [fetchDoshaProfile]);

  const doshaData = user?.doshaAssessment || doshaProfile;

  const getDoshaDescription = (dosha) => {
    const descriptions = {
      'Vata': {
        element: 'Air & Space',
        characteristics: 'Movement, creativity, communication',
        qualities: 'Light, dry, cold, rough, subtle, mobile',
        color: 'blue',
        emoji: '💨'
      },
      'Pitta': {
        element: 'Fire & Water',
        characteristics: 'Transformation, intelligence, metabolism',
        qualities: 'Hot, sharp, light, oily, liquid, mobile',
        color: 'red',
        emoji: '🔥'
      },
      'Kapha': {
        element: 'Earth & Water',
        characteristics: 'Structure, stability, immunity',
        qualities: 'Heavy, slow, cool, oily, smooth, stable',
        color: 'yellow',
        emoji: '🌍'
      }
    };
    return descriptions[dosha] || descriptions['Vata'];
  };

  const getDoshaRecommendations = (primaryDosha) => {
    const recommendations = {
      'Vata': {
        diet: [
          'Warm, cooked foods',
          'Sweet, sour, and salty tastes',
          'Regular meal times',
          'Avoid cold drinks and raw foods'
        ],
        lifestyle: [
          'Regular sleep schedule (10 PM - 6 AM)',
          'Gentle, grounding exercises like yoga',
          'Meditation and breathing exercises',
          'Warm oil massages'
        ],
        herbs: [
          'Ashwagandha for stress relief',
          'Brahmi for mental clarity',
          'Triphala for digestion',
          'Sesame oil for abhyanga'
        ]
      },
      'Pitta': {
        diet: [
          'Cool, refreshing foods',
          'Sweet, bitter, and astringent tastes',
          'Avoid spicy and fried foods',
          'Eat at regular times, avoid skipping meals'
        ],
        lifestyle: [
          'Moderate exercise, avoid overheating',
          'Stay cool in hot weather',
          'Practice calming meditation',
          'Avoid intense competition'
        ],
        herbs: [
          'Amla for cooling effect',
          'Neem for skin health',
          'Fennel for digestion',
          'Coconut oil for cooling'
        ]
      },
      'Kapha': {
        diet: [
          'Light, warm, spicy foods',
          'Pungent, bitter, and astringent tastes',
          'Reduce dairy and sweet foods',
          'Eat smaller portions'
        ],
        lifestyle: [
          'Vigorous exercise daily',
          'Wake up early (5-6 AM)',
          'Stay active and avoid oversleeping',
          'Dry brushing and stimulating massages'
        ],
        herbs: [
          'Ginger for metabolism',
          'Turmeric for inflammation',
          'Guggul for weight management',
          'Mustard oil for massage'
        ]
      }
    };
    return recommendations[primaryDosha] || recommendations['Vata'];
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        progress: 'bg-blue-500'
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        progress: 'bg-red-500'
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        progress: 'bg-yellow-500'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'diet', label: 'Diet', icon: Utensils },
    { id: 'lifestyle', label: 'Lifestyle', icon: Activity },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb }
  ];

  if (!doshaData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Your Dosha Assessment</h3>
        <p className="text-gray-600 mb-6">
          Discover your unique Ayurvedic constitution to get personalized wellness recommendations.
        </p>
        <Button
          onClick={() => setShowAssessmentModal(true)}
          variant="primary"
          icon={Target}
        >
          Take Dosha Assessment
        </Button>
      </div>
    );
  }

  const primaryDosha = doshaData.primaryDosha?.split('-')[0] || 'Vata';
  const primaryDesc = getDoshaDescription(primaryDosha);
  const recommendations = getDoshaRecommendations(primaryDosha);
  const primaryColors = getColorClasses(primaryDesc.color);

  return (
    <div className="space-y-6">
      {/* Dosha Profile Header */}
      <div className={`rounded-xl border-2 ${primaryColors.border} ${primaryColors.bg} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{primaryDesc.emoji}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Dosha Profile</h2>
              <p className="text-gray-600">Primary: {doshaData.primaryDosha}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => setShowAssessmentModal(true)}
          >
            Retake Assessment
          </Button>
        </div>

        {/* Dosha Scores */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Vata', score: doshaData.vataScore, color: 'blue', emoji: '💨' },
            { name: 'Pitta', score: doshaData.pittaScore, color: 'red', emoji: '🔥' },
            { name: 'Kapha', score: doshaData.kaphaScore, color: 'yellow', emoji: '🌍' }
          ].map((dosha) => {
            const colors = getColorClasses(dosha.color);
            return (
              <div key={dosha.name} className="text-center">
                <div className="text-2xl mb-2">{dosha.emoji}</div>
                <div className="text-lg font-semibold text-gray-900">{dosha.score}%</div>
                <div className="text-sm text-gray-600 mb-2">{dosha.name}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${colors.progress} transition-all duration-500`}
                    style={{ width: `${dosha.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Information */}
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {primaryDosha} Constitution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Elements</h4>
                    <p className="text-gray-600">{primaryDesc.element}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Key Characteristics</h4>
                    <p className="text-gray-600">{primaryDesc.characteristics}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-800 mb-2">Qualities</h4>
                    <p className="text-gray-600">{primaryDesc.qualities}</p>
                  </div>
                </div>
              </div>

              {doshaData.secondaryDosha && doshaData.secondaryDosha !== 'None' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Secondary Dosha</h4>
                  <p className="text-gray-600">
                    Your secondary dosha is {doshaData.secondaryDosha}, which influences your constitution and should be considered in your wellness plan.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'diet' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Dietary Recommendations for {primaryDosha}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3">✓ Recommended Foods</h4>
                  <ul className="space-y-2">
                    {recommendations.diet.map((item, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3">💡 Eating Tips</h4>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li>• Eat mindfully and without distractions</li>
                    <li>• Chew food thoroughly</li>
                    <li>• Don't drink cold water during meals</li>
                    <li>• Eat your largest meal at midday</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lifestyle' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Lifestyle Recommendations for {primaryDosha}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-3 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Exercise & Movement
                    </h4>
                    <ul className="space-y-1 text-sm text-purple-700">
                      {recommendations.lifestyle.slice(0, 2).map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h4 className="font-medium text-indigo-800 mb-3 flex items-center">
                      <Moon className="w-4 h-4 mr-2" />
                      Sleep & Rest
                    </h4>
                    <ul className="space-y-1 text-sm text-indigo-700">
                      {recommendations.lifestyle.slice(2).map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Daily Routine (Dinacharya)</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Wake up</span>
                      <span className="font-medium">5:30 - 6:00 AM</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Morning routine</span>
                      <span className="font-medium">6:00 - 8:00 AM</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Main meal</span>
                      <span className="font-medium">12:00 - 1:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Evening routine</span>
                      <span className="font-medium">6:00 - 8:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Sleep time</span>
                      <span className="font-medium">10:00 - 10:30 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Personalized Recommendations</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3">🌿 Recommended Herbs</h4>
                  <ul className="space-y-2">
                    {recommendations.herbs.map((herb, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {herb}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3">🧘 Yoga & Meditation</h4>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li>• Practice pranayama (breathing exercises)</li>
                    <li>• Include gentle asanas in your routine</li>
                    <li>• Meditate for 10-20 minutes daily</li>
                    <li>• Practice mindfulness throughout the day</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">Important Note</h4>
                    <p className="text-sm text-yellow-700">
                      These recommendations are based on your dosha assessment. For personalized treatment plans and specific health concerns, please consult with our certified Ayurvedic practitioners.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assessment Modal */}
      {showAssessmentModal && (
        <Modal
          isOpen={showAssessmentModal}
          onClose={() => setShowAssessmentModal(false)}
          title="Retake Dosha Assessment"
          size="md"
        >
          <div className="text-center py-4">
            <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Retake Dosha Assessment
            </h3>
            <p className="text-gray-600 mb-6">
              Your dosha can change over time based on lifestyle, age, and environment. 
              Retaking the assessment will give you updated recommendations.
            </p>
            <div className="flex space-x-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setShowAssessmentModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowAssessmentModal(false);
                  // Navigate to assessment
                  window.location.href = '/dosha-assessment';
                }}
              >
                Start Assessment
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoshaProfile;