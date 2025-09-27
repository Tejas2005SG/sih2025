import React from 'react';
import ForgotPassword from '../../components/auth/ForgotPassword';

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ForgotPassword />
    </div>
  );
};

export default ForgotPasswordPage;