import jwt from 'jsonwebtoken';
import Patient from '../models/auth.model.js';
import rateLimit from 'express-rate-limit';

// JWT Authentication Middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const patient = await Patient.findById(decoded.id).select('-password');

    if (!patient) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    if (!patient.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    req.user = patient;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Phone Verification Check Middleware
export const requirePhoneVerification = (req, res, next) => {
  if (!req.user.isPhoneVerified) {
    return res.status(403).json({
      success: false,
      message: 'Phone verification required',
      requiresVerification: true
    });
  }
  next();
};

// Account Lock Check Middleware
export const checkAccountLock = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ email: req.body.email });
    
    if (patient && patient.isLocked) {
      const lockTimeRemaining = Math.ceil((patient.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account is locked. Try again in ${lockTimeRemaining} minutes.`,
        lockUntil: patient.lockUntil
      });
    }
    
    next();
  } catch (error) {
    console.error('Account lock check error:', error);
    next(error);
  }
};

// Login Rate Limiting
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// SMS Rate Limiting - COMPLETELY FIXED
export const smsLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: {
    success: false,
    message: 'Too many SMS requests. Please try again in 10 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false
  // Removed keyGenerator completely to use default IP handling
});

// Password Reset Rate Limiting
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again in 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Registration Rate Limiting
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Biometric Authentication Middleware
export const authenticateBiometric = async (req, res, next) => {
  try {
    const { credentialId, signature, challenge } = req.body;

    if (!credentialId || !signature || !challenge) {
      return res.status(400).json({
        success: false,
        message: 'Missing biometric authentication data'
      });
    }

    const patient = await Patient.findOne({
      'biometricData.credentialId': credentialId,
      isActive: true
    });

    if (!patient) {
      return res.status(401).json({
        success: false,
        message: 'Invalid biometric credentials'
      });
    }

    const biometricDevice = patient.biometricData.find(
      device => device.credentialId === credentialId
    );

    if (!biometricDevice) {
      return res.status(401).json({
        success: false,
        message: 'Biometric device not found'
      });
    }

    req.user = patient;
    req.biometricDevice = biometricDevice;
    next();
  } catch (error) {
    console.error('Biometric authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Biometric authentication failed'
    });
  }
};

// Role-based Access Control
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role || 'patient';
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Validate Request Body
export const validateRequired = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }

    next();
  };
};

// Check Registration Step
export const checkRegistrationStep = (requiredStep) => {
  return async (req, res, next) => {
    try {
      const { email } = req.body;
      const patient = await Patient.findOne({ email });

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      const stepOrder = ['personal-info', 'medical-history', 'dosha-assessment', 'sms-verification', 'completed'];
      const currentStepIndex = stepOrder.indexOf(patient.registrationStep);
      const requiredStepIndex = stepOrder.indexOf(requiredStep);

      if (currentStepIndex < requiredStepIndex - 1) {
        return res.status(400).json({
          success: false,
          message: 'Previous registration steps must be completed first',
          currentStep: patient.registrationStep,
          requiredStep
        });
      }

      req.patient = patient;
      next();
    } catch (error) {
      console.error('Registration step check error:', error);
      next(error);
    }
  };
};

export default {
  authenticateToken,
  requirePhoneVerification,
  checkAccountLock,
  loginLimiter,
  smsLimiter,
  passwordResetLimiter,
  registrationLimiter,
  authenticateBiometric,
  requireRole,
  validateRequired,
  checkRegistrationStep
};