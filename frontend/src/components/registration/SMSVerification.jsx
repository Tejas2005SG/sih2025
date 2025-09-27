// src/components/registration/SMSVerification.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, RefreshCw, CheckCircle, Timer } from 'lucide-react';
import OtpInput from 'react-otp-input';
import { useAuthStore } from '../../stores/authStore';
import Button from '../common/Button';
import RegistrationLayout from './RegistrationLayout';

const SMSVerification = () => {
  const navigate = useNavigate();
  const { verifySMS, resendSMSCode, registrationData, isLoading } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmitOTP = async () => {
    if (otp.length !== 6) return;

    const email = registrationData.personalInfo?.email;
    const result = await verifySMS({ email, code: otp });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setAttempts((prev) => prev + 1);
      setOtp('');

      if (attempts >= 2) {
        setCanResend(true);
      }
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    const email = registrationData.personalInfo?.email;
    const result = await resendSMSCode({ email });

    if (result.success) {
      setTimeLeft(600);
      setCanResend(false);
      setAttempts(0);
      setOtp('');
    }
    setResendLoading(false);
  };

  const phoneNumber = registrationData.personalInfo?.phoneNumber;
  const maskedPhone = phoneNumber?.replace(/(\+\d{2})(\d{4})(\d{5})/, '$1****$3');

  return (
    <RegistrationLayout currentStep="sms-verification">
      <div className="text-center space-y-6 max-w-md mx-auto">
        <div>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Phone Number</h2>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to <br />
            <span className="font-medium text-gray-900">{maskedPhone}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Enter Verification Code
            </label>
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              // v3 prop
              renderSeparator={<span className="mx-2">-</span>}
              // v2 prop (harmless for v3)
              separator={<span className="mx-2">-</span>}
              // Required in v3; optional in v2
              renderInput={(inputProps, index) => (
                <input
                  {...inputProps}
                  key={index}
                  // keep styles in case library ignores inputStyle
                  style={{
                    width: '48px',
                    height: '48px',
                    margin: '0 4px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    outline: 'none',
                    textAlign: 'center',
                  }}
                />
              )}
              // Styling props (supported in v2, retained in v3 for backward-compat in many builds)
              inputStyle={{
                width: '48px',
                height: '48px',
                margin: '0 4px',
                fontSize: '20px',
                fontWeight: 'bold',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                backgroundColor: '#ffffff',
                color: '#374151',
                outline: 'none',
                transition: 'all 0.2s ease-in-out',
              }}
              focusStyle={{
                borderColor: '#10b981',
                boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)',
              }}
              // v3
              inputType="tel"
              // v2 (harmless for v3)
              isInputNum
              shouldAutoFocus
            />
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center space-x-2">
            <Timer className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {timeLeft > 0 ? (
                <>Code expires in {formatTime(timeLeft)}</>
              ) : (
                <span className="text-red-600">Code has expired</span>
              )}
            </span>
          </div>

          {/* Attempts Warning */}
          {attempts > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                {attempts === 1
                  ? 'Incorrect code. Please try again.'
                  : `Incorrect code. ${Math.max(0, 3 - attempts)} attempts remaining.`}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button
            onClick={handleSubmitOTP}
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            disabled={otp.length !== 6}
          >
            Verify & Complete Registration
          </Button>

          <div className="flex items-center justify-center space-x-4">
            <span className="text-sm text-gray-600">Didn't receive the code?</span>
            <Button
              onClick={handleResendCode}
              variant="ghost"
              size="sm"
              isLoading={resendLoading}
              disabled={!canResend}
              icon={RefreshCw}
            >
              {canResend ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
            </Button>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Having trouble?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Check your SMS inbox and spam folder</li>
            <li>• Ensure you have good network coverage</li>
            <li>• The code is valid for 10 minutes</li>
            <li>• Contact support if you continue having issues</li>
          </ul>
        </div>

        {/* Back Option */}
        <div className="pt-4">
          <Button onClick={() => navigate('/register/review-submit')} variant="outline" size="sm">
            Back to Review
          </Button>
        </div>
      </div>
    </RegistrationLayout>
  );
};

export default SMSVerification;