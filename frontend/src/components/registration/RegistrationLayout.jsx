import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import ProgressBar from '../common/ProgressBar';

const RegistrationLayout = ({ children, currentStep }) => {
  const { registrationData } = useAuthStore();

  const steps = [
    { key: 'personal-info', label: 'Personal Info', progress: 25 },
    { key: 'medical-history', label: 'Medical History', progress: 50 },
    { key: 'dosha-assessment', label: 'Dosha Assessment', progress: 75 },
    { key: 'complete-registration', label: 'Complete', progress: 90 },
    { key: 'sms-verification', label: 'Verification', progress: 100 },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 text-green-600">🌿</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join AyurSutra Wellness
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Complete your profile to get personalized Ayurvedic recommendations
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${index <= currentStepIndex
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {index + 1}
                </div>
                <span
                  className={`
                    ml-2 text-sm font-medium hidden sm:block
                    ${index <= currentStepIndex ? 'text-green-600' : 'text-gray-500'}
                  `}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`
                      w-8 sm:w-16 h-0.5 mx-2 sm:mx-4
                      ${index < currentStepIndex ? 'bg-green-600' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
          
          <ProgressBar
            progress={registrationData.progress}
            className="max-w-md mx-auto"
            showLabel={false}
          />
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
            {children}
          </div>
        </div>

        {/* Help Section */}
        <div className="max-w-2xl mx-auto mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a href="mailto:support@ayursutra.com" className="text-green-600 hover:text-green-500">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationLayout;