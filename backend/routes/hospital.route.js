import express from 'express';
import { body } from 'express-validator';
import {
  registerHospital,
  loginHospital,
  getHospitalProfile,
  updateHospitalProfile
} from '../controller/hospital.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation rules for hospital registration
const hospitalRegistrationValidation = [
  body('hospitalName')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Hospital name must be between 2 and 120 characters'),
  
  body('adminFirstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Admin first name must be between 2 and 50 characters'),
  
  body('adminLastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Admin last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phoneNumber')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  // Optional fields validation
  body('registrationNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Registration number must be between 1 and 50 characters'),
  
  body('gstin')
    .optional()
    .trim()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Please provide a valid GSTIN'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  
  body('address.pinCode')
    .optional()
    .matches(/^\d{6}$/)
    .withMessage('Please provide a valid 6-digit PIN code'),
];

// Validation rules for hospital login
const hospitalLoginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Validation rules for profile update
const hospitalProfileUpdateValidation = [
  body('hospitalName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Hospital name must be between 2 and 120 characters'),
  
  body('adminFirstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Admin first name must be between 2 and 50 characters'),
  
  body('adminLastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Admin last name must be between 2 and 50 characters'),
  
  body('phoneNumber')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
  
  body('registrationNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Registration number must be between 1 and 50 characters'),
  
  body('gstin')
    .optional()
    .trim()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Please provide a valid GSTIN'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  
  body('address.pinCode')
    .optional()
    .matches(/^\d{6}$/)
    .withMessage('Please provide a valid 6-digit PIN code'),
];

// Routes
router.post('/register', hospitalRegistrationValidation, registerHospital);
router.post('/login', hospitalLoginValidation, loginHospital);
router.get('/profile', authenticateToken, getHospitalProfile);
router.put('/profile', authenticateToken, hospitalProfileUpdateValidation, updateHospitalProfile);

export default router;