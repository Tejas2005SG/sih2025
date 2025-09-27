import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, CheckCircle, User, Heart, Target, Shield } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Button from '../common/Button';
import Input from '../common/Input';
import RegistrationLayout from './RegistrationLayout';

const ReviewSubmit = () => {
  const navigate = useNavigate();
  const { completeRegistration, registrationData, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    if (!acceptTerms) {
      alert('Please accept the terms and conditions');
      return;
    }

    const completeData = {
      email: registrationData.personalInfo?.email,
      password: data.password,
      confirmPassword: data.confirmPassword
    };

    const result = await completeRegistration(completeData);
    if (result.success) {
      navigate('/register/verify-sms');
    }
  };

  const getDoshaColor = (dosha) => {
    switch (dosha) {
      case 'Vata': return 'text-blue-600';
      case 'Pitta': return 'text-red-600';
      case 'Kapha': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  return (
    <RegistrationLayout currentStep="complete-registration">
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Complete Registration</h2>
          <p className="text-gray-600">Please review your information and create your password</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Personal Info Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-blue-900">Personal Info</h3>
            </div>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Name:</span> {registrationData.personalInfo?.firstName} {registrationData.personalInfo?.lastName}</p>
              <p><span className="font-medium">Email:</span> {registrationData.personalInfo?.email}</p>
              <p><span className="font-medium">Phone:</span> {registrationData.personalInfo?.phoneNumber}</p>
              <p><span className="font-medium">Age:</span> {registrationData.personalInfo?.dateOfBirth ? new Date().getFullYear() - new Date(registrationData.personalInfo.dateOfBirth).getFullYear() : 'N/A'}</p>
            </div>
          </div>

          {/* Medical Info Summary */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Heart className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="font-medium text-red-900">Medical Info</h3>
            </div>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Health Concerns:</span> {registrationData.medicalHistory?.currentHealthConcerns?.length || 0} items</p>
              <p><span className="font-medium">Medications:</span> {registrationData.medicalHistory?.currentMedications?.length || 0} items</p>
              <p><span className="font-medium">Ayurveda Experience:</span> {registrationData.medicalHistory?.ayurvedicExperience ? 'Yes' : 'No'}</p>
              <p><span className="font-medium">Diet:</span> {registrationData.medicalHistory?.lifestyle?.diet?.type || 'Not specified'}</p>
            </div>
          </div>

          {/* Dosha Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Target className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-medium text-green-900">Dosha Profile</h3>
            </div>
            {registrationData.doshaAssessment ? (
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Assessment:</span> Completed</p>
                <p><span className="font-medium">Questions:</span> {registrationData.doshaAssessment?.questionnaire?.length || 0} answered</p>
                <p className="text-xs text-green-600 mt-2">✓ Ready for personalized recommendations</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Assessment pending</p>
            )}
          </div>
        </div>

        {/* Password Creation */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Create Your Password</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                leftIcon={Lock}
                rightIcon={showPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowPassword(!showPassword)}
                placeholder="Create a secure password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Password must contain uppercase, lowercase, number and special character',
                  },
                })}
                error={errors.password?.message}
              />

              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                leftIcon={Lock}
                rightIcon={showConfirmPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                placeholder="Confirm your password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                })}
                error={errors.confirmPassword?.message}
              />
            </div>

            {password && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                    ✓ At least 8 characters
                  </div>
                  <div className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                    ✓ Uppercase letter
                  </div>
                  <div className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                    ✓ Lowercase letter
                  </div>
                  <div className={/\d/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                    ✓ Number
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div className="text-sm text-gray-700">
                <p>I agree to the <a href="/terms" className="text-green-600 hover:text-green-500">Terms of Service</a> and <a href="/privacy" className="text-green-600 hover:text-green-500">Privacy Policy</a></p>
                <p className="text-xs text-gray-500 mt-1">
                  By registering, you consent to receive SMS notifications and agree to our data processing practices.
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/register/dosha-assessment')}
            >
              Back to Assessment
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={!acceptTerms}
            >
              Complete Registration
            </Button>
          </div>
        </form>
      </div>
    </RegistrationLayout>
  );
};

export default ReviewSubmit;