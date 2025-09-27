// controller/auth.controller.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import Patient from '../models/auth.model.js';
import emailService from '../utils/emailService.js';
import smsService from '../utils/smsService.js';

/*
  IMPORTANT:
  - Ensure cookie-parser is mounted in your app/server file:
      import cookieParser from 'cookie-parser';
      app.use(cookieParser());

  - If frontend is on a different origin, enable CORS with credentials:
      import cors from 'cors';
      app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

  - For cross-site cookies, set:
      process.env.NODE_ENV='production'
      process.env.COOKIE_SAMESITE='none'
      and use HTTPS so 'secure' cookies can be sent.
*/

// Top-level helpers to avoid `this` binding issues
const calcDoshaScores = (questionnaire = []) => {
  let vataScore = 0;
  let pittaScore = 0;
  let kaphaScore = 0;

  questionnaire.forEach((answer) => {
    switch (answer.doshaType) {
      case 'vata':
        vataScore += answer.points || 1;
        break;
      case 'pitta':
        pittaScore += answer.points || 1;
        break;
      case 'kapha':
        kaphaScore += answer.points || 1;
        break;
      default:
        break;
    }
  });

  const total = vataScore + pittaScore + kaphaScore || 1;
  return {
    vataScore: Math.round((vataScore / total) * 100),
    pittaScore: Math.round((pittaScore / total) * 100),
    kaphaScore: Math.round((kaphaScore / total) * 100),
  };
};

const pickDoshas = (vataScore, pittaScore, kaphaScore) => {
  const scores = [
    { name: 'Vata', score: vataScore },
    { name: 'Pitta', score: pittaScore },
    { name: 'Kapha', score: kaphaScore },
  ];
  scores.sort((a, b) => b.score - a.score);
  const primaryDosha = scores[0].name;
  const secondaryDosha = scores[1].score > 25 ? scores[1].name : 'None';

  // Balanced constitution
  if (
    Math.abs(scores[0].score - scores[1].score) < 10 &&
    Math.abs(scores[1].score - scores[2].score) < 10
  ) {
    return { primaryDosha: 'Tridosha', secondaryDosha: 'None' };
  }

  // Dual dosha constitution
  if (Math.abs(scores[0].score - scores[1].score) < 15) {
    return { primaryDosha: `${primaryDosha}-${scores[1].name}`, secondaryDosha: scores[2].name };
  }

  return { primaryDosha, secondaryDosha };
};

class AuthController {
  // Generate JWT Token
  generateTokens(userId) {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  // Cookie helpers
  baseCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    const sameSite = (process.env.COOKIE_SAMESITE || (isProd ? 'none' : 'lax')).toLowerCase();

    const options = {
      httpOnly: true,
      secure: isProd || sameSite === 'none', // must be true if SameSite=None
      sameSite, // 'lax' | 'strict' | 'none'
      path: '/',
    };

    if (process.env.COOKIE_DOMAIN) {
      options.domain = process.env.COOKIE_DOMAIN; // e.g. '.yourdomain.com'
    }

    return options;
  }

  cookieOptions(type = 'access') {
    const base = this.baseCookieOptions();
    const maxAge = type === 'access' ? 15 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    return { ...base, maxAge };
  }

  setAuthCookies(res, { accessToken, refreshToken }) {
    res.cookie('accessToken', accessToken, this.cookieOptions('access'));
    res.cookie('refreshToken', refreshToken, this.cookieOptions('refresh'));
  }

  clearAuthCookies(res) {
    const base = this.baseCookieOptions();
    res.clearCookie('accessToken', base);
    res.clearCookie('refreshToken', base);
  }

  // Helper function to safely convert to array
  toArray(val) {
    if (Array.isArray(val)) return val.filter((item) => item && item.toString().trim());
    if (typeof val === 'string') {
      if (val.trim() === '') return [];
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }

  // Helper function to clean undefined/null/empty values
  cleanObject(obj) {
    if (obj === null || obj === undefined) return undefined;

    if (Array.isArray(obj)) {
      const cleaned = obj.filter((item) => item !== null && item !== undefined && item !== '');
      return cleaned.length > 0 ? cleaned : undefined;
    }

    if (typeof obj === 'object') {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        const cleanedValue = this.cleanObject(value);
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
      return Object.keys(cleaned).length > 0 ? cleaned : undefined;
    }

    if (typeof obj === 'string' && obj.trim() === '') return undefined;
    return obj;
  }

  // Calculate Dosha Scores (class version, not used by registerDoshaAssessment but kept for completeness)
  calculateDoshaScores(questionnaire) {
    return calcDoshaScores(questionnaire);
  }

  // Determine Primary and Secondary Dosha (class version)
  determinePrimaryDosha(vataScore, pittaScore, kaphaScore) {
    return pickDoshas(vataScore, pittaScore, kaphaScore);
  }

  // Step 1: Personal Information Registration
  async registerPersonalInfo(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth,
        gender,
        bloodGroup,
        maritalStatus,
        occupation,
        address,
        emergencyContact,
      } = req.body;

      // Check if user already exists
      const existingPatient = await Patient.findOne({
        $or: [{ email }, { phoneNumber }],
      });

      if (existingPatient && existingPatient.registrationStep === 'completed') {
        return res.status(409).json({
          success: false,
          message: 'User already registered with this email or phone number',
        });
      }

      let patient;

      if (existingPatient) {
        // Update existing incomplete registration
        patient = await Patient.findOneAndUpdate(
          { $or: [{ email }, { phoneNumber }] },
          {
            firstName,
            lastName,
            email,
            phoneNumber: smsService.formatPhoneNumber(phoneNumber),
            dateOfBirth: new Date(dateOfBirth),
            gender,
            bloodGroup,
            maritalStatus,
            occupation,
            address: this.cleanObject(address),
            emergencyContact: this.cleanObject(emergencyContact),
            registrationStep: 'personal-info',
            'registrationData.personalInfo': req.body,
          },
          { new: true, runValidators: true }
        );
      } else {
        // Create new patient
        patient = new Patient({
          firstName,
          lastName,
          email,
          phoneNumber: smsService.formatPhoneNumber(phoneNumber),
          dateOfBirth: new Date(dateOfBirth),
          gender,
          bloodGroup,
          maritalStatus,
          occupation,
          address: this.cleanObject(address),
          emergencyContact: this.cleanObject(emergencyContact),
          password: 'temp_password', // Will be set in final step
          registrationStep: 'personal-info',
          registrationData: {
            personalInfo: req.body,
          },
        });

        await patient.save();
      }

      res.status(201).json({
        success: true,
        message: 'Personal information saved successfully',
        data: {
          patientId: patient._id,
          currentStep: 'personal-info',
          nextStep: 'medical-history',
          progress: 25,
        },
      });
    } catch (error) {
      console.error('Personal info registration error:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }

      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(409).json({
          success: false,
          message: `${field} already exists`,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to save personal information',
      });
    }
  }

  // Step 2: Medical History Registration
  async registerMedicalHistory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { email } = req.body;
      const patient = await Patient.findOne({ email });

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found. Please start with personal information.',
        });
      }

      if (patient.registrationStep !== 'personal-info') {
        return res.status(400).json({
          success: false,
          message: 'Invalid registration step',
          currentStep: patient.registrationStep,
        });
      }

      // currentHealthConcerns
      if (Array.isArray(req.body.currentHealthConcerns)) {
        const concerns = req.body.currentHealthConcerns
          .filter((c) => c && c.concern && c.concern.trim())
          .map((c) => ({
            concern: c.concern.trim(),
            severity: c.severity || undefined,
            duration: c.duration || undefined,
          }));
        if (concerns.length > 0) patient.currentHealthConcerns = concerns;
      }

      // chronicConditions
      if (req.body.chronicConditions && typeof req.body.chronicConditions === 'object') {
        const cc = req.body.chronicConditions;
        const conditions = {
          diabetes: cc.diabetes === true,
          heartDisease: cc.heartDisease === true,
          arthritis: cc.arthritis === true,
          kidneyDisease: cc.kidneyDisease === true,
          cancer: cc.cancer === true,
          thyroidDisorder: cc.thyroidDisorder === true,
          hypertension: cc.hypertension === true,
          depression: cc.depression === true,
          anxiety: cc.anxiety === true,
        };
        if (Array.isArray(cc.other)) {
          const other = cc.other.filter(Boolean);
          if (other.length > 0) conditions.other = other;
        }
        patient.chronicConditions = conditions;
      }

      // currentMedications
      if (Array.isArray(req.body.currentMedications)) {
        const meds = req.body.currentMedications
          .filter((m) => m && m.name && m.name.trim())
          .map((m) => ({
            name: m.name.trim(),
            dosage: m.dosage || undefined,
            frequency: m.frequency || undefined,
            prescribedBy: m.prescribedBy || undefined,
            startDate: m.startDate ? new Date(m.startDate) : undefined,
            notes: m.notes || undefined,
          }));
        if (meds.length > 0) patient.currentMedications = meds;
      }

      // allergies
      if (req.body.allergies && typeof req.body.allergies === 'object') {
        const raw = req.body.allergies;
        const allergies = {};
        ['food', 'drug', 'environmental', 'seasonal', 'other'].forEach((type) => {
          if (Array.isArray(raw[type])) {
            const list = raw[type].filter(Boolean);
            if (list.length > 0) allergies[type] = list;
          }
        });
        if (Object.keys(allergies).length > 0) patient.allergies = allergies;
      }

      // previousSurgeries
      if (Array.isArray(req.body.previousSurgeries)) {
        const surgeries = req.body.previousSurgeries
          .filter((s) => s && s.surgery && s.surgery.trim())
          .map((s) => ({
            surgery: s.surgery.trim(),
            date: s.date ? new Date(s.date) : undefined,
            hospital: s.hospital || undefined,
            notes: s.notes || undefined,
          }));
        if (surgeries.length > 0) patient.previousSurgeries = surgeries;
      }

      // recentHospitalizations
      if (Array.isArray(req.body.recentHospitalizations)) {
        const hosps = req.body.recentHospitalizations
          .filter((h) => h && h.reason && h.reason.trim())
          .map((h) => ({
            reason: h.reason.trim(),
            hospital: h.hospital || undefined,
            admissionDate: h.admissionDate ? new Date(h.admissionDate) : undefined,
            dischargeDate: h.dischargeDate ? new Date(h.dischargeDate) : undefined,
            notes: h.notes || undefined,
          }));
        if (hosps.length > 0) patient.recentHospitalizations = hosps;
      }

      // familyMedicalHistory
      if (req.body.familyMedicalHistory && typeof req.body.familyMedicalHistory === 'object') {
        const f = req.body.familyMedicalHistory;
        const familyHistory = {
          diabetes: f.diabetes === true,
          heartDisease: f.heartDisease === true,
          cancer: f.cancer === true,
          hypertension: f.hypertension === true,
          mentalHealth: f.mentalHealth === true,
        };
        if (Array.isArray(f.other)) {
          const other = f.other.filter(Boolean);
          if (other.length > 0) familyHistory.other = other;
        }
        if (f.notes && f.notes.trim()) {
          familyHistory.notes = f.notes.trim();
        }
        patient.familyMedicalHistory = familyHistory;
      }

      // lifestyle
      if (req.body.lifestyle && typeof req.body.lifestyle === 'object') {
        patient.lifestyle = patient.lifestyle || {};

        // smoking
        if (req.body.lifestyle.smoking) {
          patient.lifestyle.smoking = {
            status: req.body.lifestyle.smoking.status || 'Never',
            ...(req.body.lifestyle.smoking.details ? { details: req.body.lifestyle.smoking.details } : {}),
          };
        }

        // alcohol
        if (req.body.lifestyle.alcohol) {
          patient.lifestyle.alcohol = {
            frequency: req.body.lifestyle.alcohol.frequency || 'Never',
            ...(req.body.lifestyle.alcohol.amount ? { amount: req.body.lifestyle.alcohol.amount } : {}),
          };
        }

        // exercise — normalize if it arrives as a string
        if (req.body.lifestyle.exercise !== undefined) {
          let exerciseInput = req.body.lifestyle.exercise;

          if (typeof exerciseInput === 'string') {
            // Try parsing stringified JSON. If user sends single quotes, fix them.
            try {
              const normalized = exerciseInput
                .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // quote keys if missing
                .replace(/'/g, '"'); // single -> double quotes
              exerciseInput = JSON.parse(normalized);
            } catch {
              exerciseInput = [];
            }
          }

          if (!Array.isArray(exerciseInput)) exerciseInput = [];

          const exerciseArray = [];
          for (const ex of exerciseInput) {
            if (!ex || typeof ex !== 'object') continue;
            const entry = {};

            if (ex.frequency) entry.frequency = ex.frequency;

            if (Array.isArray(ex.type)) {
              entry.type = ex.type.filter((t) => t && typeof t === 'string' && t.trim());
            } else if (typeof ex.type === 'string') {
              entry.type = ex.type.split(',').map((s) => s.trim()).filter(Boolean);
            } else {
              entry.type = [];
            }

            if (ex.duration && typeof ex.duration === 'string' && ex.duration.trim()) {
              entry.duration = ex.duration.trim();
            } else if (typeof ex.duration === 'number') {
              entry.duration = String(ex.duration);
            }

            if (entry.frequency || entry.type.length > 0 || entry.duration) {
              exerciseArray.push(entry);
            }
          }

          patient.lifestyle.exercise = exerciseArray;
        }

        // diet
        if (req.body.lifestyle.diet) {
          const d = req.body.lifestyle.diet;
          patient.lifestyle.diet = {};
          if (d.type) patient.lifestyle.diet.type = d.type;
          if (Array.isArray(d.preferences)) {
            const prefs = d.preferences.filter(Boolean);
            if (prefs.length > 0) patient.lifestyle.diet.preferences = prefs;
          }
          if (Array.isArray(d.restrictions)) {
            const restr = d.restrictions.filter(Boolean);
            if (restr.length > 0) patient.lifestyle.diet.restrictions = restr;
          }
        }

        // sleep
        if (req.body.lifestyle.sleep) {
          const s = req.body.lifestyle.sleep;
          patient.lifestyle.sleep = {};
          if (s.averageHours !== undefined) patient.lifestyle.sleep.averageHours = Number(s.averageHours);
          if (s.quality) patient.lifestyle.sleep.quality = s.quality;
          if (Array.isArray(s.issues)) {
            const issues = s.issues.filter(Boolean);
            if (issues.length > 0) patient.lifestyle.sleep.issues = issues;
          } else if (typeof s.issues === 'string') {
            const issues = s.issues.split(',').map((x) => x.trim()).filter(Boolean);
            if (issues.length > 0) patient.lifestyle.sleep.issues = issues;
          }
        }

        // stress
        if (req.body.lifestyle.stress) {
          const st = req.body.lifestyle.stress;
          patient.lifestyle.stress = {};
          if (st.level) patient.lifestyle.stress.level = st.level;
          if (Array.isArray(st.managementTechniques)) {
            const techniques = st.managementTechniques.filter(Boolean);
            if (techniques.length > 0) patient.lifestyle.stress.managementTechniques = techniques;
          } else if (typeof st.managementTechniques === 'string') {
            const techniques = st.managementTechniques.split(',').map((x) => x.trim()).filter(Boolean);
            if (techniques.length > 0) patient.lifestyle.stress.managementTechniques = techniques;
          }
        }
      }

      // ayurvedicExperience
      if (req.body.ayurvedicExperience !== undefined) {
        patient.ayurvedicExperience = req.body.ayurvedicExperience === true;
      }

      // steps + registrationData
      patient.registrationStep = 'medical-history';
      patient.registrationData = patient.registrationData || {};
      patient.registrationData.medicalHistory = req.body;

      // Optional log
      console.log(
        'About to save patient with lifestyle.exercise:',
        JSON.stringify(patient.lifestyle?.exercise || [], null, 2)
      );

      const savedPatient = await patient.save();

      res.status(200).json({
        success: true,
        message: 'Medical history saved successfully',
        data: {
          patientId: savedPatient._id,
          currentStep: 'medical-history',
          nextStep: 'dosha-assessment',
          progress: 50,
        },
      });
    } catch (error) {
      console.error('Medical history registration error:', error);
      console.error('Error stack:', error.stack);

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map((e) => e.message),
        });
      }

      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Data format error',
          details: `Invalid data format for field: ${error.path}`,
          value: error.value,
        });
      }

      res.status(500).json({ success: false, message: 'Failed to save medical history' });
    }
  }

  // Step 3: Dosha Assessment Registration
  async registerDoshaAssessment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { email, questionnaire = [] } = req.body;
      const patient = await Patient.findOne({ email });

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found',
        });
      }

      if (patient.registrationStep !== 'medical-history') {
        return res.status(400).json({
          success: false,
          message: 'Invalid registration step',
          currentStep: patient.registrationStep,
        });
      }

      // Use top-level helpers (no reliance on `this`)
      const { vataScore, pittaScore, kaphaScore } = calcDoshaScores(questionnaire);
      const { primaryDosha, secondaryDosha } = pickDoshas(vataScore, pittaScore, kaphaScore);

      const doshaAssessment = {
        vataScore,
        pittaScore,
        kaphaScore,
        primaryDosha,
        secondaryDosha,
        assessmentDate: new Date(),
        questionnaire,
      };

      const updatedPatient = await Patient.findByIdAndUpdate(
        patient._id,
        {
          doshaAssessment,
          registrationStep: 'dosha-assessment',
          'registrationData.doshaAssessment': req.body,
        },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        message: 'Dosha assessment completed successfully',
        data: {
          patientId: updatedPatient._id,
          currentStep: 'dosha-assessment',
          nextStep: 'complete-registration',
          progress: 75,
          doshaResults: {
            vataScore,
            pittaScore,
            kaphaScore,
            primaryDosha,
            secondaryDosha,
          },
        },
      });
    } catch (error) {
      console.error('Dosha assessment registration error:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to save dosha assessment',
      });
    }
  }

  // Step 4: Complete Registration
  async completeRegistration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { email, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match',
        });
      }

      const patient = await Patient.findOne({ email });

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found',
        });
      }

      if (patient.registrationStep !== 'dosha-assessment') {
        return res.status(400).json({
          success: false,
          message: 'Invalid registration step',
          currentStep: patient.registrationStep,
        });
      }

      // Generate SMS verification code
      const verificationCode = smsService.generateVerificationCode();
      const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Use save() so pre-save hashing runs
      patient.password = password;
      patient.smsVerificationCode = verificationCode;
      patient.smsCodeExpires = codeExpires;
      patient.smsAttempts = 0;
      patient.lastSMSSent = new Date();
      patient.registrationStep = 'sms-verification';
      await patient.save();

      // Send SMS verification
      try {
        await smsService.sendSMSVerification(patient.phoneNumber, verificationCode, patient.firstName);

        res.status(200).json({
          success: true,
          message: 'Registration completed. SMS verification code sent.',
          data: {
            patientId: patient._id,
            currentStep: 'sms-verification',
            progress: 90,
            phoneNumber: patient.phoneNumber,
            maskedPhone: patient.phoneNumber.replace(/(\+\d{2})(\d{4})(\d{5})/, '$1****$3'),
          },
        });
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);

        res.status(200).json({
          success: true,
          message: 'Registration completed but SMS failed. You can request a new code.',
          data: {
            patientId: patient._id,
            currentStep: 'sms-verification',
            progress: 90,
            phoneNumber: patient.phoneNumber,
            smsError: true,
          },
        });
      }
    } catch (error) {
      console.error('Complete registration error:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to complete registration',
      });
    }
  }

  // SMS Verification
  async verifySMS(req, res) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: 'Email and verification code are required',
        });
      }

      const patient = await Patient.findOne({ email });

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      if (patient.registrationStep !== 'sms-verification') {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification step',
        });
      }

      // Check if code is expired
      if (patient.smsCodeExpires < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired. Please request a new one.',
          expired: true,
        });
      }

      // Check if code matches
      if (patient.smsVerificationCode !== code) {
        // Increment attempts
        await Patient.findByIdAndUpdate(patient._id, {
          $inc: { smsAttempts: 1 },
        });

        return res.status(400).json({
          success: false,
          message: 'Invalid verification code',
          attemptsRemaining: Math.max(0, 3 - (patient.smsAttempts + 1)),
        });
      }

      // Verification successful
      const verifiedPatient = await Patient.findByIdAndUpdate(
        patient._id,
        {
          isPhoneVerified: true,
          isActive: true,
          registrationStep: 'completed',
          $unset: {
            smsVerificationCode: 1,
            smsCodeExpires: 1,
            smsAttempts: 1,
            registrationData: 1,
          },
        },
        { new: true }
      ).select('-password');

      // Generate tokens and set as cookies
      const tokens = this.generateTokens(verifiedPatient._id);
      this.setAuthCookies(res, tokens);

      // Send welcome email and SMS
      try {
        await Promise.all([
          emailService.sendWelcomeEmail(patient.email, patient.firstName),
          smsService.sendWelcomeSMS(patient.phoneNumber, patient.firstName),
        ]);
      } catch (error) {
        console.error('Welcome messages failed:', error);
        // Don't fail the verification for this
      }

      res.status(200).json({
        success: true,
        message: 'Phone number verified successfully! Welcome to AyurSutra Wellness.',
        data: {
          patient: {
            id: verifiedPatient._id,
            firstName: verifiedPatient.firstName,
            lastName: verifiedPatient.lastName,
            email: verifiedPatient.email,
            phoneNumber: verifiedPatient.phoneNumber,
            primaryDosha: verifiedPatient.doshaAssessment?.primaryDosha,
            isPhoneVerified: verifiedPatient.isPhoneVerified,
          },
          // tokens are set in cookies; not returned in body
        },
      });
    } catch (error) {
      console.error('SMS verification error:', error);
      res.status(500).json({
        success: false,
        message: 'SMS verification failed',
      });
    }
  }

  // Resend SMS Code
  async resendSMSCode(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }

      const patient = await Patient.findOne({ email });

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      if (patient.registrationStep !== 'sms-verification') {
        return res.status(400).json({
          success: false,
          message: 'SMS verification not required for this account',
        });
      }

      // Check rate limiting
      const lastSMSSent = patient.lastSMSSent;
      const now = new Date();
      const timeDiff = now - lastSMSSent;
      const minInterval = 60 * 1000; // 1 minute between SMS

      if (timeDiff < minInterval) {
        const waitTime = Math.ceil((minInterval - timeDiff) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitTime} seconds before requesting another code`,
          waitTime,
        });
      }

      // Check daily SMS limit
      if (patient.smsAttempts >= 5) {
        return res.status(429).json({
          success: false,
          message: 'Daily SMS limit reached. Please try again tomorrow.',
        });
      }

      // Generate new code
      const verificationCode = smsService.generateVerificationCode();
      const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await Patient.findByIdAndUpdate(patient._id, {
        smsVerificationCode: verificationCode,
        smsCodeExpires: codeExpires,
        lastSMSSent: now,
        $inc: { smsAttempts: 1 },
      });

      // Send SMS
      await smsService.sendSMSVerification(patient.phoneNumber, verificationCode, patient.firstName);

      res.status(200).json({
        success: true,
        message: 'New verification code sent successfully',
        data: {
          phoneNumber: patient.phoneNumber,
          maskedPhone: patient.phoneNumber.replace(/(\+\d{2})(\d{4})(\d{5})/, '$1****$3'),
          attemptsRemaining: Math.max(0, 5 - patient.smsAttempts),
        },
      });
    } catch (error) {
      console.error('Resend SMS error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification code',
      });
    }
  }

  // Login
  // controller/auth.controller.js - UPDATED METHODS

  // Login method - UPDATED
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find patient
      const patient = await Patient.findOne({ email });

      if (!patient) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check if account is locked
      if (patient.isLocked) {
        const lockTimeRemaining = Math.ceil((patient.lockUntil - Date.now()) / 60000);
        return res.status(423).json({
          success: false,
          message: `Account is locked. Try again in ${lockTimeRemaining} minutes.`,
        });
      }

      // Check if account is active
      if (!patient.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.',
        });
      }

      // Check registration completion
      if (patient.registrationStep !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Registration is incomplete',
          registrationStep: patient.registrationStep,
          requiresCompletion: true,
        });
      }

      // Verify password
      const isPasswordValid = await patient.comparePassword(password);

      if (!isPasswordValid) {
        await patient.incLoginAttempts();
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check phone verification
      if (!patient.isPhoneVerified) {
        return res.status(403).json({
          success: false,
          message: 'Phone number verification required',
          requiresPhoneVerification: true,
        });
      }

      // Reset login attempts on successful login
      await patient.resetLoginAttempts();

      // Update last login
      await Patient.findByIdAndUpdate(patient._id, {
        lastLogin: new Date(),
      });

      // Generate tokens and set cookies
      const tokens = this.generateTokens(patient._id);
      this.setAuthCookies(res, tokens);

      // Return success response WITH tokens for localStorage
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          patient: {
            id: patient._id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            phoneNumber: patient.phoneNumber,
            primaryDosha: patient.doshaAssessment?.primaryDosha,
            isPhoneVerified: patient.isPhoneVerified,
            lastLogin: new Date(),
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
      });
    }
  }

  // SMS Verification - UPDATED
  async verifySMS(req, res) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: 'Email and verification code are required',
        });
      }

      const patient = await Patient.findOne({ email });

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      if (patient.registrationStep !== 'sms-verification') {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification step',
        });
      }

      // Check if code is expired
      if (patient.smsCodeExpires < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired. Please request a new one.',
          expired: true,
        });
      }

      // Check if code matches
      if (patient.smsVerificationCode !== code) {
        // Increment attempts
        await Patient.findByIdAndUpdate(patient._id, {
          $inc: { smsAttempts: 1 },
        });

        return res.status(400).json({
          success: false,
          message: 'Invalid verification code',
          attemptsRemaining: Math.max(0, 3 - (patient.smsAttempts + 1)),
        });
      }

      // Verification successful
      const verifiedPatient = await Patient.findByIdAndUpdate(
        patient._id,
        {
          isPhoneVerified: true,
          isActive: true,
          registrationStep: 'completed',
          $unset: {
            smsVerificationCode: 1,
            smsCodeExpires: 1,
            smsAttempts: 1,
            registrationData: 1,
          },
        },
        { new: true }
      ).select('-password');

      // Generate tokens and set as cookies
      const tokens = this.generateTokens(verifiedPatient._id);
      this.setAuthCookies(res, tokens);

      // Send welcome email and SMS
      try {
        await Promise.all([
          emailService.sendWelcomeEmail(patient.email, patient.firstName),
          smsService.sendWelcomeSMS(patient.phoneNumber, patient.firstName),
        ]);
      } catch (error) {
        console.error('Welcome messages failed:', error);
        // Don't fail the verification for this
      }

      res.status(200).json({
        success: true,
        message: 'Phone number verified successfully! Welcome to AyurSutra Wellness.',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          patient: {
            id: verifiedPatient._id,
            firstName: verifiedPatient.firstName,
            lastName: verifiedPatient.lastName,
            email: verifiedPatient.email,
            phoneNumber: verifiedPatient.phoneNumber,
            primaryDosha: verifiedPatient.doshaAssessment?.primaryDosha,
            isPhoneVerified: verifiedPatient.isPhoneVerified,
          },
        },
      });
    } catch (error) {
      console.error('SMS verification error:', error);
      res.status(500).json({
        success: false,
        message: 'SMS verification failed',
      });
    }
  }

  // Biometric Login - UPDATED
  async biometricLogin(req, res) {
    try {
      const { credentialId, signature, challenge } = req.body;

      if (!credentialId || !signature || !challenge) {
        return res.status(400).json({
          success: false,
          message: 'Missing biometric authentication data',
        });
      }

      // Find patient with the biometric credential
      const patient = await Patient.findOne({
        'biometricData.credentialId': credentialId,
        isActive: true,
        isPhoneVerified: true,
      });

      if (!patient) {
        return res.status(401).json({
          success: false,
          message: 'Invalid biometric credentials',
        });
      }

      // In a real implementation, verify the biometric signature here

      // Update last login
      await Patient.findByIdAndUpdate(patient._id, {
        lastLogin: new Date(),
      });

      // Generate tokens and set cookies
      const tokens = this.generateTokens(patient._id);
      this.setAuthCookies(res, tokens);

      res.status(200).json({
        success: true,
        message: 'Biometric login successful',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          patient: {
            id: patient._id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            phoneNumber: patient.phoneNumber,
            primaryDosha: patient.doshaAssessment?.primaryDosha,
            lastLogin: new Date(),
          },
        },
      });
    } catch (error) {
      console.error('Biometric login error:', error);
      res.status(500).json({
        success: false,
        message: 'Biometric login failed',
      });
    }
  }

  // Refresh Token - UPDATED
  async refreshToken(req, res) {
    try {
      // Try to get refresh token from request body first (for localStorage), then from cookies
      const refreshTokenFromBody = req.body?.refreshToken;
      const refreshTokenFromCookie = req.cookies?.refreshToken;
      const refreshToken = refreshTokenFromBody || refreshTokenFromCookie;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required',
        });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const patient = await Patient.findById(decoded.id);

      if (!patient || !patient.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      const tokens = this.generateTokens(patient._id);
      this.setAuthCookies(res, tokens);

      res.status(200).json({
        success: true,
        message: 'Token refreshed',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }
  }

  // Get Patient Profile
  async getProfile(req, res) {
    try {
      const patient = await Patient.findById(req.user.id)
        .select('-password -smsVerificationCode -resetPasswordToken')
        .lean();

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      res.status(200).json({
        success: true,
        data: { patient },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
      });
    }
  }

  // Update Patient Profile
  async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const allowedUpdates = [
        'firstName',
        'lastName',
        'phoneNumber',
        'dateOfBirth',
        'gender',
        'bloodGroup',
        'maritalStatus',
        'occupation',
        'address',
        'emergencyContact',
        'currentHealthConcerns',
        'chronicConditions',
        'currentMedications',
        'allergies',
        'previousSurgeries',
        'familyMedicalHistory',
        'lifestyle',
      ];

      const updates = {};
      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      // If phone number is being updated, require verification
      if (updates.phoneNumber && updates.phoneNumber !== req.user.phoneNumber) {
        updates.phoneNumber = smsService.formatPhoneNumber(updates.phoneNumber);
        updates.isPhoneVerified = false;
      }

      const updatedPatient = await Patient.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
        select: '-password -smsVerificationCode -resetPasswordToken',
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { patient: updatedPatient },
      });
    } catch (error) {
      console.error('Update profile error:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }

      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(409).json({
          success: false,
          message: `${field} already exists`,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
      });
    }
  }

  // Change Password
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'New passwords do not match',
        });
      }

      const patient = await Patient.findById(req.user.id);

      // Verify current password
      const isCurrentPasswordValid = await patient.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      // Update password
      patient.password = newPassword;
      await patient.save();

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
      });
    }
  }

  // Forgot Password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }

      const patient = await Patient.findOne({ email });

      if (!patient) {
        // Don't reveal if email exists or not
        return res.status(200).json({
          success: true,
          message: 'If the email exists, a password reset link has been sent.',
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await Patient.findByIdAndUpdate(patient._id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpires,
      });

      // Send reset email
      try {
        await emailService.sendPasswordResetEmail(email, resetToken, patient.firstName);

        res.status(200).json({
          success: true,
          message: 'Password reset link sent to your email',
        });
      } catch (emailError) {
        console.error('Password reset email failed:', emailError);

        // Clear the reset token since email failed
        await Patient.findByIdAndUpdate(patient._id, {
          $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
        });

        res.status(500).json({
          success: false,
          message: 'Failed to send password reset email',
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request',
      });
    }
  }

  // Reset Password
  async resetPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { token, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match',
        });
      }

      const patient = await Patient.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!patient) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token',
        });
      }

      // Update password and clear reset token
      patient.password = newPassword;
      patient.resetPasswordToken = undefined;
      patient.resetPasswordExpires = undefined;

      await patient.save();

      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password',
      });
    }
  }

  // Refresh Token - now reads from cookie and sets new cookies
  async refreshToken(req, res) {
    try {
      const refreshTokenCookie = req.cookies?.refreshToken;

      if (!refreshTokenCookie) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required',
        });
      }

      const decoded = jwt.verify(refreshTokenCookie, process.env.JWT_SECRET);
      const patient = await Patient.findById(decoded.id);

      if (!patient || !patient.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      const tokens = this.generateTokens(patient._id);
      this.setAuthCookies(res, tokens);

      res.status(200).json({
        success: true,
        message: 'Token refreshed',
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }
  }

  // Logout - clear cookies
  async logout(req, res) {
    try {
      this.clearAuthCookies(res);
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  }

  // Register Biometric
  async registerBiometric(req, res) {
    try {
      const { credentialId, publicKey, deviceType } = req.body;

      if (!credentialId || !publicKey || !deviceType) {
        return res.status(400).json({
          success: false,
          message: 'Missing biometric registration data',
        });
      }

      const patient = await Patient.findById(req.user.id);

      // Check if credential already exists
      const existingCredential = patient.biometricData.find(
        (device) => device.credentialId === credentialId
      );

      if (existingCredential) {
        return res.status(409).json({
          success: false,
          message: 'Biometric device already registered',
        });
      }

      // Add new biometric device
      patient.biometricData.push({
        credentialId,
        publicKey,
        counter: 0,
        deviceType,
        registeredAt: new Date(),
      });

      await patient.save();

      res.status(201).json({
        success: true,
        message: 'Biometric device registered successfully',
        data: {
          deviceType,
          registeredAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Biometric registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register biometric device',
      });
    }
  }

  // Biometric Login - set cookies
  async biometricLogin(req, res) {
    try {
      const { credentialId, signature, challenge } = req.body;

      if (!credentialId || !signature || !challenge) {
        return res.status(400).json({
          success: false,
          message: 'Missing biometric authentication data',
        });
      }

      // Find patient with the biometric credential
      const patient = await Patient.findOne({
        'biometricData.credentialId': credentialId,
        isActive: true,
        isPhoneVerified: true,
      });

      if (!patient) {
        return res.status(401).json({
          success: false,
          message: 'Invalid biometric credentials',
        });
      }

      // In a real implementation, verify the biometric signature here

      // Update last login
      await Patient.findByIdAndUpdate(patient._id, {
        lastLogin: new Date(),
      });

      // Generate tokens and set cookies
      const tokens = this.generateTokens(patient._id);
      this.setAuthCookies(res, tokens);

      res.status(200).json({
        success: true,
        message: 'Biometric login successful',
        data: {
          patient: {
            id: patient._id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            phoneNumber: patient.phoneNumber,
            primaryDosha: patient.doshaAssessment?.primaryDosha,
            lastLogin: new Date(),
          },
          // tokens in cookies
        },
      });
    } catch (error) {
      console.error('Biometric login error:', error);
      res.status(500).json({
        success: false,
        message: 'Biometric login failed',
      });
    }
  }
}

export default new AuthController();