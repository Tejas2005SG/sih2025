import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const doctorSchema = new mongoose.Schema({
  role: { type: String, enum: ['doctor'], default: 'doctor' },
  firstName: { type: String, required: true, trim: true, maxlength: 50 },
  lastName: { type: String, required: true, trim: true, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 },

  // Optional professional fields
  specialization: { type: String, trim: true },
  registrationNumber: { type: String, trim: true },
  qualifications: [String],
  yearsOfExperience: Number,

  // Account status
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },

  // Security
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,

  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

doctorSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

doctorSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

doctorSchema.methods.incLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $unset: { lockUntil: 1 }, $set: { loginAttempts: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 };
  }
  return this.updateOne(updates);
};

doctorSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({ $unset: { loginAttempts: 1, lockUntil: 1 } });
};

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

export default Doctor;