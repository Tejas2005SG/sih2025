import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-lg mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-green-200 mb-4">404</div>
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            The page you're looking for seems to have wandered off on its own wellness journey. 
            Let's get you back on track!
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-medium text-blue-900 mb-1">What you can do:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Check the URL for any typos</li>
                  <li>• Go back to the previous page</li>
                  <li>• Visit our homepage</li>
                  <li>• Contact support if you need help</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            icon={Home}
            onClick={() => navigate('/dashboard')}
            size="lg"
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
            size="lg"
          >
            Go Back
          </Button>
        </div>

        {/* Help Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Still can't find what you're looking for?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@ayursutra.com"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Contact Support
            </a>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <a
              href="/help"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Help Center
            </a>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <a
              href="/help/faq"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              FAQ
            </a>
          </div>
        </div>

        {/* Wellness Quote */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 italic">
            "Even in confusion, there is an opportunity to find clarity." 
            <span className="block text-xs text-green-600 mt-1">— Ayurvedic Wisdom</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;