import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore.js';
import Button from '../common/Button';
import Input from '../common/Input';

const ForgotPassword = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const { forgotPassword, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const result = await forgotPassword(data.email);
    if (result.success) {
      setSubmittedEmail(data.email);
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600">
            We've sent a password reset link to{' '}
            <span className="font-medium text-gray-900">{submittedEmail}</span>
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-green-900 mb-2">What's next?</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Check your email inbox and spam folder</li>
            <li>• Click the reset link in the email</li>
            <li>• Create a new secure password</li>
            <li>• Sign in with your new password</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => setEmailSent(false)}
            variant="outline"
            size="lg"
            className="w-full"
            icon={Mail}
          >
            Send to Different Email
          </Button>
          
          <a
            href="/login"
            className="inline-flex items-center justify-center w-full text-sm text-green-600 hover:text-green-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
        <p className="text-gray-600">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          leftIcon={Mail}
          placeholder="Enter your email address"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email address',
            },
          })}
          error={errors.email?.message}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Send Reset Link
        </Button>
      </form>

      <div className="mt-8 text-center">
        <a
          href="/login"
          className="inline-flex items-center text-sm text-green-600 hover:text-green-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </a>
      </div>
    </div>
  );
};

export default ForgotPassword;