import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore.js';
import Button from '../common/Button';
import Input from '../common/Input';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const { resetPassword, isLoading } = useAuthStore();

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const onSubmit = async (data) => {
    if (!token) {
      setTokenValid(false);
      return;
    }

    const result = await resetPassword({
      token,
      newPassword: data.password,
      confirmPassword: data.confirmPassword,
    });

    if (result.success) {
      setResetSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: 'gray' };
    
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^A-Za-z0-9]/.test(password),
    };

    strength = Object.values(checks).filter(Boolean).length;

    const strengthMap = {
      0: { label: 'Very Weak', color: 'red' },
      1: { label: 'Weak', color: 'red' },
      2: { label: 'Fair', color: 'yellow' },
      3: { label: 'Good', color: 'blue' },
      4: { label: 'Strong', color: 'green' },
      5: { label: 'Very Strong', color: 'green' },
    };

    return { strength, ...strengthMap[strength] };
  };

  const passwordStrength = getPasswordStrength(password);

  if (!tokenValid) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
        <p className="text-gray-600 mb-6">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Button
          onClick={() => navigate('/forgot-password')}
          variant="primary"
          size="lg"
          className="w-full"
        >
          Request New Reset Link
        </Button>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your password has been successfully reset. You will be redirected to the login page shortly.
        </p>
        <Button
          onClick={() => navigate('/login')}
          variant="primary"
          size="lg"
          className="w-full"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
        <p className="text-gray-600">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            leftIcon={Lock}
            rightIcon={showPassword ? EyeOff : Eye}
            onRightIconClick={() => setShowPassword(!showPassword)}
            placeholder="Enter new password"
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
          
          {password && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Password strength</span>
                <span className={`font-medium text-${passwordStrength.color}-600`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-${passwordStrength.color}-500 transition-all duration-300`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm New Password"
          type={showConfirmPassword ? 'text' : 'password'}
          leftIcon={Lock}
          rightIcon={showConfirmPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
          placeholder="Confirm new password"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) =>
              value === password || 'Passwords do not match',
          })}
          error={errors.confirmPassword?.message}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Password Requirements:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li className={password?.length >= 8 ? 'text-green-600' : ''}>
              • At least 8 characters long
            </li>
            <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
              • Contains lowercase letter
            </li>
            <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
              • Contains uppercase letter
            </li>
            <li className={/\d/.test(password) ? 'text-green-600' : ''}>
              • Contains number
            </li>
            <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : ''}>
              • Contains special character
            </li>
          </ul>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;