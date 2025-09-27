// src/models/auth.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Explicit sub-schema for exercise entries
const exerciseSchema = new mongoose.Schema(
  {
    frequency: {
      type: String,
      enum: ['Never', '1-2 times/week', '3-4 times/week', '5+ times/week', 'Daily'],
      default: 'Never',
    },
    // Array of strings for categories/activities, "type" is okay as a child field
    type: {
      type: [String],
      default: [],
    },
    duration: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    // Personal Information
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    },
    maritalStatus: {
      type: String,
      enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Prefer not to say'],
    },
    occupation: {
      type: String,
      trim: true,
      maxlength: [100, 'Occupation cannot exceed 100 characters'],
    },

    // Address Information
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pinCode: {
        type: String,
        match: [/^\d{6}$/, 'Please enter a valid PIN code'],
      },
      country: { type: String, default: 'India' },
    },

    // Emergency Contact
    emergencyContact: {
      name: { type: String, trim: true },
      phone: {
        type: String,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
      },
      relationship: { type: String, trim: true },
    },

    // Medical Information
    currentHealthConcerns: [
      {
        concern: String,
        severity: {
          type: String,
          enum: ['Mild', 'Moderate', 'Severe'],
        },
        duration: String,
      },
    ],

    chronicConditions: {
      diabetes: { type: Boolean, default: false },
      heartDisease: { type: Boolean, default: false },
      arthritis: { type: Boolean, default: false },
      kidneyDisease: { type: Boolean, default: false },
      cancer: { type: Boolean, default: false },
      thyroidDisorder: { type: Boolean, default: false },
      hypertension: { type: Boolean, default: false },
      depression: { type: Boolean, default: false },
      anxiety: { type: Boolean, default: false },
      other: [String],
    },

    currentMedications: [
      {
        name: { type: String, required: true },
        dosage: String,
        frequency: String,
        prescribedBy: String,
        startDate: Date,
        notes: String,
      },
    ],

    allergies: {
      food: [String],
      drug: [String],
      environmental: [String],
      seasonal: [String],
      other: [String],
    },

    previousSurgeries: [
      {
        surgery: String,
        date: Date,
        hospital: String,
        notes: String,
      },
    ],

    recentHospitalizations: [
      {
        reason: String,
        hospital: String,
        admissionDate: Date,
        dischargeDate: Date,
        notes: String,
      },
    ],

    familyMedicalHistory: {
      diabetes: { type: Boolean, default: false },
      heartDisease: { type: Boolean, default: false },
      cancer: { type: Boolean, default: false },
      hypertension: { type: Boolean, default: false },
      mentalHealth: { type: Boolean, default: false },
      other: [String],
      notes: String,
    },

    // Lifestyle Information
    lifestyle: {
      smoking: {
        status: { type: String, enum: ['Never', 'Former', 'Current', 'Occasional'] },
        details: String,
      },
      alcohol: {
        frequency: { type: String, enum: ['Never', 'Rarely', 'Occasionally', 'Regularly', 'Daily'] },
        amount: String,
      },
      // This is the important part — array of subdocuments, not array of arrays
      exercise: {
        type: [exerciseSchema],
        default: [],
      },
      diet: {
        type: { type: String, enum: ['Vegetarian', 'Non-vegetarian', 'Vegan', 'Jain', 'Other'] },
        preferences: [String],
        restrictions: [String],
      },
      sleep: {
        averageHours: Number,
        quality: { type: String, enum: ['Poor', 'Fair', 'Good', 'Excellent'] },
        issues: [String],
      },
      stress: {
        level: { type: String, enum: ['Low', 'Moderate', 'High', 'Very High'] },
        managementTechniques: [String],
      },
    },

    ayurvedicExperience: {
      type: Boolean,
      default: false,
    },

    // Dosha Assessment
    doshaAssessment: {
      vataScore: { type: Number, min: 0, max: 100 },
      pittaScore: { type: Number, min: 0, max: 100 },
      kaphaScore: { type: Number, min: 0, max: 100 },
      primaryDosha: {
        type: String,
        enum: ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha', 'Tridosha'],
      },
      secondaryDosha: {
        type: String,
        enum: ['Vata', 'Pitta', 'Kapha', 'None'],
      },
      assessmentDate: { type: Date, default: Date.now },
      questionnaire: [
        {
          question: String,
          answer: String,
          doshaType: String,
          points: Number,
        },
      ],
    },

    // Authentication
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },

    // Biometric Data
    biometricData: [
      {
        type: String,
        credentialId: String,
        publicKey: String,
        counter: Number,
        deviceType: String,
        registeredAt: { type: Date, default: Date.now },
      },
    ],

    // Account Status
    isActive: { type: Boolean, default: true },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },

    // Password Reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // SMS Verification
    smsVerificationCode: String,
    smsCodeExpires: Date,
    smsAttempts: { type: Number, default: 0 },
    lastSMSSent: Date,

    // Registration Progress
    registrationStep: {
      type: String,
      enum: ['personal-info', 'medical-history', 'dosha-assessment', 'sms-verification', 'completed'],
      default: 'personal-info',
    },
    registrationData: {
      personalInfo: { type: mongoose.Schema.Types.Mixed },
      medicalHistory: { type: mongoose.Schema.Types.Mixed },
      doshaAssessment: { type: mongoose.Schema.Types.Mixed },
    },

    // Timestamps
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
patientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
patientSchema.virtual('age').get(function () {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return null;
});
patientSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save password hashing
patientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Methods
patientSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
patientSchema.methods.incLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 };
  }
  return this.updateOne(updates);
};
patientSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({ $unset: { loginAttempts: 1, lockUntil: 1 } });
};

// Indexes
patientSchema.index({ 'address.pinCode': 1 });
patientSchema.index({ createdAt: -1 });

// Avoid OverwriteModelError on dev restarts
const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);

export default Patient;