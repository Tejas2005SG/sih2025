import React, { useState, useEffect } from 'react';
import { Fingerprint, Smartphone, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore.js';
import Button from '../common/Button';
import Modal from '../common/Modal';

const BiometricLogin = ({ onClose }) => {
  const [step, setStep] = useState('detect'); // detect, authenticate, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { biometricLogin } = useAuthStore();

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = () => {
    if (!window.navigator.credentials || !window.PublicKeyCredential) {
      setStep('error');
      setErrorMessage('Biometric authentication is not supported on this device');
      return;
    }
    
    setStep('authenticate');
  };

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported');
      }

      // Create credential request options
      const publicKeyCredentialRequestOptions = {
        challenge: new Uint8Array(32),
        allowCredentials: [],
        timeout: 60000,
        userVerification: 'required'
      };

      // Request credential
      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });

      if (credential) {
        // Mock biometric data (in real implementation, this would be processed)
        const biometricData = {
          credentialId: credential.id,
          signature: 'mock_signature',
          challenge: 'mock_challenge'
        };

        const result = await biometricLogin(biometricData);
        
        if (result.success) {
          setStep('success');
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setStep('error');
          setErrorMessage(result.error || 'Biometric authentication failed');
        }
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      setStep('error');
      
      if (error.name === 'NotAllowedError') {
        setErrorMessage('Biometric authentication was cancelled');
      } else if (error.name === 'NotSupportedError') {
        setErrorMessage('Biometric authentication is not supported');
      } else {
        setErrorMessage('Authentication failed. Please try again.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'detect':
        return (
          <div className="text-center py-6">
            <div className="animate-pulse">
              <Smartphone className="w-16 h-16 text-green-600 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Detecting Biometric Support
            </h3>
            <p className="text-gray-600">
              Checking if your device supports biometric authentication...
            </p>
          </div>
        );

      case 'authenticate':
        return (
          <div className="text-center py-6">
            <div className={`${isAuthenticating ? 'animate-pulse' : ''}`}>
              <Fingerprint className="w-16 h-16 text-green-600 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Biometric Authentication
            </h3>
            <p className="text-gray-600 mb-6">
              Use your fingerprint, face recognition, or device PIN to sign in
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={handleBiometricAuth}
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isAuthenticating}
                icon={Fingerprint}
              >
                {isAuthenticating ? 'Authenticating...' : 'Authenticate Now'}
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                size="md"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Authentication Successful!
            </h3>
            <p className="text-gray-600">
              Redirecting to your dashboard...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Authentication Failed
            </h3>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            
            <div className="space-y-3">
              <Button
                onClick={() => setStep('authenticate')}
                variant="primary"
                size="md"
                className="w-full"
              >
                Try Again
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                size="md"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Biometric Login"
      size="sm"
    >
      {renderContent()}
    </Modal>
  );
};

export default BiometricLogin;