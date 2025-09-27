import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import HospitalUser from '../models/hospital.model.js';
import { generateTokens } from '../middleware/auth.middleware.js';

// Hospital Registration
export const registerHospital = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      hospitalName,
      legalName,
      website,
      address,
      registrationNumber,
      gstin,
      adminFirstName,
      adminLastName,
      email,
      phoneNumber,
      password,
      confirmPassword
    } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if hospital already exists
    const existingHospital = await HospitalUser.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phoneNumber }
      ]
    });

    if (existingHospital) {
      const field = existingHospital.email === email.toLowerCase() ? 'email' : 'phone number';
      return res.status(409).json({
        success: false,
        message: `Hospital with this ${field} already exists`
      });
    }

    // Create new hospital
    const hospital = new HospitalUser({
      hospitalName: hospitalName.trim(),
      legalName: legalName?.trim(),
      website: website?.trim(),
      address: address ? {
        street: address.street?.trim(),
        city: address.city?.trim(),
        state: address.state?.trim(),
        pinCode: address.pinCode?.trim(),
        country: address.country?.trim() || 'India'
      } : undefined,
      registrationNumber: registrationNumber?.trim(),
      gstin: gstin?.trim(),
      adminFirstName: adminFirstName.trim(),
      adminLastName: adminLastName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      password,
      role: 'hospital'
    });

    await hospital.save();

    // Remove password from response
    const hospitalResponse = hospital.toObject();
    delete hospitalResponse.password;
    delete hospitalResponse.resetPasswordToken;
    delete hospitalResponse.resetPasswordExpires;

    res.status(201).json({
      success: true,
      message: 'Hospital registered successfully. Account is pending verification.',
      data: {
        hospital: hospitalResponse
      }
    });

  } catch (error) {
    console.error('Hospital registration error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `Hospital with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// Hospital Login
export const loginHospital = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find hospital by email
    const hospital = await HospitalUser.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (!hospital) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (hospital.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Check if account is active
    if (!hospital.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Hospital account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await hospital.comparePassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      await hospital.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    if (hospital.loginAttempts > 0) {
      await hospital.resetLoginAttempts();
    }

    // Update last login
    hospital.lastLogin = new Date();
    await hospital.save();

    // Generate tokens using the middleware utility
    const { accessToken, refreshToken } = generateTokens(hospital._id, 'hospital');

    // Prepare hospital data for response
    const hospitalResponse = hospital.toObject();
    delete hospitalResponse.password;
    delete hospitalResponse.resetPasswordToken;
    delete hospitalResponse.resetPasswordExpires;
    delete hospitalResponse.loginAttempts;
    delete hospitalResponse.lockUntil;

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Hospital login successful',
      data: {
        accessToken,
        refreshToken,
        hospital: hospitalResponse
      }
    });

  } catch (error) {
    console.error('Hospital login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Refresh Token
export const refreshToken = async (req, res) => {
  try {
    // At this point, the user is already validated by authenticateRefreshToken middleware
    const { accessToken, refreshToken } = generateTokens(req.user._id, req.auth.role);

    // Set new refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

// Logout
export const logoutHospital = async (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// Get Hospital Profile
export const getHospitalProfile = async (req, res) => {
  try {
    const hospital = await HospitalUser.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        hospital
      }
    });

  } catch (error) {
    console.error('Get hospital profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update Hospital Profile
export const updateHospitalProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      hospitalName,
      legalName,
      website,
      address,
      registrationNumber,
      gstin,
      adminFirstName,
      adminLastName,
      phoneNumber
    } = req.body;

    const hospital = await HospitalUser.findById(req.user.id);
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // Check if phone number is being changed and if it's already taken
    if (phoneNumber && phoneNumber !== hospital.phoneNumber) {
      const existingHospital = await HospitalUser.findOne({ 
        phoneNumber, 
        _id: { $ne: req.user.id } 
      });
      
      if (existingHospital) {
        return res.status(409).json({
          success: false,
          message: 'Phone number already in use'
        });
      }
    }

    // Update hospital data
    const updateData = {};
    if (hospitalName) updateData.hospitalName = hospitalName.trim();
    if (legalName) updateData.legalName = legalName.trim();
    if (website) updateData.website = website.trim();
    if (registrationNumber) updateData.registrationNumber = registrationNumber.trim();
    if (gstin) updateData.gstin = gstin.trim();
    if (adminFirstName) updateData.adminFirstName = adminFirstName.trim();
    if (adminLastName) updateData.adminLastName = adminLastName.trim();
    if (phoneNumber) updateData.phoneNumber = phoneNumber.trim();
    
    if (address) {
      updateData.address = {
        street: address.street?.trim(),
        city: address.city?.trim(),
        state: address.state?.trim(),
        pinCode: address.pinCode?.trim(),
        country: address.country?.trim() || 'India'
      };
    }

    const updatedHospital = await HospitalUser.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');

    res.status(200).json({
      success: true,
      message: 'Hospital profile updated successfully',
      data: {
        hospital: updatedHospital
      }
    });

  } catch (error) {
    console.error('Update hospital profile error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `Hospital with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};