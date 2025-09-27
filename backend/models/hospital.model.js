import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pinCode: { type: String, match: [/^\d{6}$/, 'Please enter a valid PIN code'] },
  country: { type: String, default: 'India' },
}, { _id: false });

const hospitalUserSchema = new mongoose.Schema({
  role: { type: String, enum: ['hospital'], default: 'hospital' },

  // Hospital account
  hospitalName: { type: String, required: true, trim: true, maxlength: 120 },
  legalName: { type: String, trim: true },
  website: { type: String, trim: true },
  address: addressSchema,
  registrationNumber: { type: String, trim: true },
  gstin: { type: String, trim: true },

  // Login owner for the hospital
  adminFirstName: { type: String, required: true, trim: true, maxlength: 50 },
  adminLastName: { type: String, required: true, trim: true, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true },
  phoneNumber: { type: String, required: true, unique: true },

  password: { type: String, required: true, minlength: 8 },

  // Account status
  isActive: { type: Boolean, default: true },

  // Security
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,

  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

hospitalUserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

hospitalUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

hospitalUserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

hospitalUserSchema.methods.incLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $unset: { lockUntil: 1 }, $set: { loginAttempts: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 };
  }
  return this.updateOne(updates);
};

hospitalUserSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({ $unset: { loginAttempts: 1, lockUntil: 1 } });
};

const HospitalUser = mongoose.models.HospitalUser || mongoose.model('HospitalUser', hospitalUserSchema);

export default HospitalUser;