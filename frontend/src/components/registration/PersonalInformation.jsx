import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, MapPin, Users } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Button from '../common/Button';
import Input from '../common/Input';
import RegistrationLayout from './RegistrationLayout';

const PersonalInformation = () => {
  const navigate = useNavigate();
  const { registerPersonalInfo, registrationData, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: registrationData.personalInfo || {}
  });

  const onSubmit = async (data) => {
    const result = await registerPersonalInfo(data);
    if (result.success) {
      navigate('/register/medical-history');
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
  const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Prefer not to say'];
  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

  return (
    <RegistrationLayout currentStep="personal-info">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
          <p className="text-gray-600">Let's start with your basic information</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              leftIcon={User}
              placeholder="Enter your first name"
              {...register('firstName', {
                required: 'First name is required',
                minLength: { value: 2, message: 'Minimum 2 characters required' },
                pattern: { value: /^[a-zA-Z\s]+$/, message: 'Only letters allowed' }
              })}
              error={errors.firstName?.message}
            />

            <Input
              label="Last Name"
              leftIcon={User}
              placeholder="Enter your last name"
              {...register('lastName', {
                required: 'Last name is required',
                minLength: { value: 2, message: 'Minimum 2 characters required' },
                pattern: { value: /^[a-zA-Z\s]+$/, message: 'Only letters allowed' }
              })}
              error={errors.lastName?.message}
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              leftIcon={Mail}
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address'
                }
              })}
              error={errors.email?.message}
            />

            <Input
              label="Phone Number"
              type="tel"
              leftIcon={Phone}
              placeholder="+91 9876543210"
              {...register('phoneNumber', {
                required: 'Phone number is required',
                pattern: {
                  value: /^(\+91|91)?[6-9]\d{9}$/,
                  message: 'Invalid Indian mobile number'
                }
              })}
              error={errors.phoneNumber?.message}
            />
          </div>

          {/* Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              leftIcon={Calendar}
              {...register('dateOfBirth', {
                required: 'Date of birth is required',
                validate: (value) => {
                  const age = new Date().getFullYear() - new Date(value).getFullYear();
                  return age >= 18 || 'Must be at least 18 years old';
                }
              })}
              error={errors.dateOfBirth?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500"
                {...register('gender', { required: 'Gender is required' })}
              >
                <option value="">Select gender</option>
                {genders.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
              {errors.gender && (
                <p className="mt-2 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Group
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500"
                {...register('bloodGroup')}
              >
                <option value="">Select blood group</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marital Status
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500"
                {...register('maritalStatus')}
              >
                <option value="">Select marital status</option>
                {maritalStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <Input
              label="Occupation"
              placeholder="Enter your occupation"
              {...register('occupation')}
            />
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-green-600" />
              Address Information
            </h3>

            <Input
              label="Street Address"
              placeholder="Enter your street address"
              {...register('address.street')}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                placeholder="Enter city"
                {...register('address.city')}
              />

              <Input
                label="State"
                placeholder="Enter state"
                {...register('address.state')}
              />

              <Input
                label="PIN Code"
                placeholder="Enter PIN code"
                {...register('address.pinCode', {
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'PIN code must be 6 digits'
                  }
                })}
                error={errors.address?.pinCode?.message}
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              Emergency Contact
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Contact Name"
                placeholder="Enter contact name"
                {...register('emergencyContact.name')}
              />

              <Input
                label="Contact Phone"
                type="tel"
                placeholder="+91 9876543210"
                {...register('emergencyContact.phone', {
                  pattern: {
                    value: /^(\+91|91)?[6-9]\d{9}$/,
                    message: 'Invalid mobile number'
                  }
                })}
                error={errors.emergencyContact?.phone?.message}
              />

              <Input
                label="Relationship"
                placeholder="e.g., Spouse, Parent"
                {...register('emergencyContact.relationship')}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              Continue to Medical History
            </Button>
          </div>
        </form>
      </div>
    </RegistrationLayout>
  );
};

export default PersonalInformation;