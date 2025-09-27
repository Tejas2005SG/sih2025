import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Eye, EyeOff, ArrowLeft, Stethoscope } from 'lucide-react';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const { doctorLogin, isLoading, error } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    hospitalId: '', // Optional for independent doctors
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await doctorLogin(formData);
    
    if (result.success) {
      navigate('/doctor/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <Link 
          to="/auth/select-role"
          className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to role selection
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Doctor Login</h1>
            <p className="text-gray-600 mt-2">Access your practice management tools</p>
          </div>

          {/* Info Message */}
          <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded-lg mb-6">
            <p className="text-sm">
              <strong>Note:</strong> Doctor accounts are created by hospitals. Contact your hospital administrator if you don't have login credentials.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Doctor Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                placeholder="doctor@hospital.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Hospital ID (Optional) */}
            <div>
              <label htmlFor="hospitalId" className="block text-sm font-medium text-gray-700 mb-2">
                Hospital ID <span className="text-sm text-gray-500">(Optional)</span>
              </label>
              <input
                id="hospitalId"
                name="hospitalId"
                type="text"
                value={formData.hospitalId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                placeholder="Enter hospital ID if applicable"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank if you're an independent practitioner
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In to Practice Dashboard'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-4">
            <Link
              to="/forgot-password"
              className="text-purple-600 hover:text-purple-700 text-sm transition-colors duration-200"
            >
              Forgot your password?
            </Link>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Need a doctor account?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Doctor registrations are handled by hospitals. Please contact:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your hospital's IT department</li>
                  <li>• Hospital administrator</li>
                  <li>• AyurSutra support for independent practice</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 AyurSutra Wellness. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;