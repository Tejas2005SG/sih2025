import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, Fingerprint } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore.js';
import Button from '../common/Button';
import Input from '../common/Input';
import BiometricLogin from './BiometricLogin';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.success) {
      // Navigation will be handled by ProtectedRoute
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 text-green-600">🌿</div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to continue your wellness journey</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          leftIcon={Mail}
          placeholder="Enter your email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email address',
            },
          })}
          error={errors.email?.message}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          leftIcon={Lock}
          placeholder="Enter your password"
          rightIcon={showPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowPassword(!showPassword)}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          })}
          error={errors.password?.message}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              {...register('rememberMe')}
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          
          <a
            href="/forgot-password"
            className="text-sm text-green-600 hover:text-green-500"
          >
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Sign In
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          icon={Fingerprint}
          onClick={() => setShowBiometric(true)}
        >
          Use Biometric Login
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-green-600 hover:text-green-500 font-medium">
            Sign up here
          </a>
        </p>
      </div>

      {showBiometric && (
        <BiometricLogin onClose={() => setShowBiometric(false)} />
      )}
    </div>
  );
};

export default LoginForm;