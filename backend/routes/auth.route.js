import express from 'express';
import { body } from 'express-validator';
import authController from '../controller/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation rules
const personalInfoValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2-50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2-50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('phoneNumber').isMobilePhone(['en-IN']).withMessage('Please provide a valid Indian mobile number'),
  body('dateOfBirth')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const age = (Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18 || age > 100) throw new Error('Age must be between 18 and 100 years');
      return true;
    }),
  body('gender')
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
    .withMessage('Please select a valid gender option'),
  body('address.pinCode').optional().matches(/^\d{6}$/).withMessage('PIN code must be 6 digits')
];

const medicalHistoryValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('currentHealthConcerns').optional().isArray().withMessage('Current health concerns must be an array'),
  body('currentMedications').optional().isArray().withMessage('Current medications must be an array'),
  // Important validations to avoid stringified arrays
  body('lifestyle.exercise').optional().isArray().withMessage('Exercise must be an array'),
  body('lifestyle.exercise.*.frequency')
    .optional()
    .isIn(['Never', '1-2 times/week', '3-4 times/week', '5+ times/week', 'Daily'])
    .withMessage('Invalid exercise frequency'),
  body('lifestyle.exercise.*.type')
    .optional()
    .custom((val) => Array.isArray(val) || typeof val === 'string')
    .withMessage('Exercise type must be an array or a comma separated string'),
  body('lifestyle.smoking.status')
    .optional()
    .isIn(['Never', 'Former', 'Current', 'Occasional'])
    .withMessage('Invalid smoking status')
];

const doshaAssessmentValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('questionnaire').isArray({ min: 1 }).withMessage('Questionnaire responses are required'),
  body('questionnaire.*.question').notEmpty().withMessage('Question text is required'),
  body('questionnaire.*.answer').notEmpty().withMessage('Answer is required'),
  body('questionnaire.*.doshaType').isIn(['vata', 'pitta', 'kapha']).withMessage('Valid dosha type is required')
];

const completeRegistrationValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword').notEmpty().withMessage('Password confirmation is required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  // Role-aware login (defaults to 'patient' if not passed)
  body('role').optional().isIn(['patient', 'doctor', 'hospital']).withMessage('Invalid role')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword').notEmpty().withMessage('Password confirmation is required')
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword').notEmpty().withMessage('Password confirmation is required')
];

// Helper to bind controller methods
const bind = (method) => method.bind(authController);

// Registration Routes (patient flow)
router.post('/register/personal-info', authMiddleware.registrationLimiter, personalInfoValidation, bind(authController.registerPersonalInfo));
router.post('/register/medical-history', authMiddleware.registrationLimiter, medicalHistoryValidation, bind(authController.registerMedicalHistory));
router.post('/register/dosha-assessment', authMiddleware.registrationLimiter, doshaAssessmentValidation, bind(authController.registerDoshaAssessment));
router.post('/register/complete', authMiddleware.registrationLimiter, completeRegistrationValidation, bind(authController.completeRegistration));

// SMS Verification Routes (patient flow)
router.post('/verify-sms', authMiddleware.smsLimiter, authMiddleware.validateRequired(['email', 'code']), bind(authController.verifySMS));
router.post('/resend-sms-code', authMiddleware.smsLimiter, authMiddleware.validateRequired(['email']), bind(authController.resendSMSCode));

// Authentication Routes (all roles)
router.post('/login', authMiddleware.loginLimiter, authMiddleware.checkAccountLock, loginValidation, bind(authController.login));
router.post('/biometric-login', authMiddleware.loginLimiter, authMiddleware.validateRequired(['credentialId', 'signature', 'challenge']), bind(authController.biometricLogin));

// IMPORTANT: Do not require refreshToken in body; controller reads cookie or body
router.post('/refresh-token', bind(authController.refreshToken));
router.post('/logout', authMiddleware.authenticateToken, bind(authController.logout));

// Profile Management Routes (patient-only protected)
router.get('/profile', authMiddleware.authenticateToken, authMiddleware.requireRole(['patient']), bind(authController.getProfile));
router.put('/profile', authMiddleware.authenticateToken, authMiddleware.requireRole(['patient']), authMiddleware.requirePhoneVerification, bind(authController.updateProfile));
router.post('/change-password', authMiddleware.authenticateToken, authMiddleware.requireRole(['patient']), authMiddleware.requirePhoneVerification, changePasswordValidation, bind(authController.changePassword));

// Password Reset Routes (patient-only)
router.post('/forgot-password', authMiddleware.passwordResetLimiter, body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'), bind(authController.forgotPassword));
router.post('/reset-password', authMiddleware.passwordResetLimiter, resetPasswordValidation, bind(authController.resetPassword));

// Biometric Routes (patient-only protected)
router.post('/register-biometric', authMiddleware.authenticateToken, authMiddleware.requireRole(['patient']), authMiddleware.requirePhoneVerification, authMiddleware.validateRequired(['credentialId', 'publicKey', 'deviceType']), bind(authController.registerBiometric));

// Test Routes (Development only)
if (process.env.NODE_ENV === 'development') {
  router.get('/test', (req, res) => {
    res.json({
      success: true,
      message: 'Auth routes are working',
      timestamp: new Date().toISOString()
    });
  });
}

export default router;