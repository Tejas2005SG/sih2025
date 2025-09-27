import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Heart,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Bell
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Profile = () => {
  const { user } = useAuthStore();
  const { profile, updateProfile, isLoading } = useUserStore();
  const [activeTab, setActiveTab] = useState('personal');
  const [editMode, setEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: user || {}
  });

  useEffect(() => {
    if (user) {
      reset(user);
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      setEditMode(false);
    }
  };

  const handleCancel = () => {
    reset(user);
    setEditMode(false);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'medical', label: 'Medical Info', icon: Heart },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Bell }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors duration-200">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>Age: {calculateAge(user?.dateOfBirth)} years</span>
                <span>•</span>
                <span>Blood Group: {user?.bloodGroup || 'Not specified'}</span>
                <span>•</span>
                <span>Primary Dosha: {user?.doshaAssessment?.primaryDosha || 'Not assessed'}</span>
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.isPhoneVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user?.isPhoneVerified ? '✓ Phone Verified' : '⚠ Phone Not Verified'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user?.isActive ? '✓ Active Account' : '⚠ Inactive Account'}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            <div>
              {editMode ? (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    variant="primary"
                    size="sm"
                    icon={Save}
                    isLoading={isLoading}
                    disabled={!isDirty}
                  >
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    icon={X}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setEditMode(true)}
                  variant="outline"
                  size="sm"
                  icon={Edit3}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-xl border border-gray-200">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center py-4 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'personal' && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="First Name"
                      leftIcon={User}
                      disabled={!editMode}
                      {...register('firstName', {
                        required: 'First name is required',
                        minLength: { value: 2, message: 'Minimum 2 characters required' }
                      })}
                      error={errors.firstName?.message}
                    />

                    <Input
                      label="Last Name"
                      leftIcon={User}
                      disabled={!editMode}
                      {...register('lastName', {
                        required: 'Last name is required',
                        minLength: { value: 2, message: 'Minimum 2 characters required' }
                      })}
                      error={errors.lastName?.message}
                    />

                    <Input
                      label="Email"
                      type="email"
                      leftIcon={Mail}
                      disabled={!editMode}
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
                      disabled={!editMode}
                      {...register('phoneNumber', {
                        required: 'Phone number is required'
                      })}
                      error={errors.phoneNumber?.message}
                    />

                    <Input
                      label="Date of Birth"
                      type="date"
                      leftIcon={Calendar}
                      disabled={!editMode}
                      {...register('dateOfBirth')}
                      error={errors.dateOfBirth?.message}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                        disabled={!editMode}
                        {...register('gender')}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Group
                      </label>
                      <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                        disabled={!editMode}
                        {...register('bloodGroup')}
                      >
                        <option value="">Select blood group</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Occupation"
                      disabled={!editMode}
                      {...register('occupation')}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-green-600" />
                    Address Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Input
                        label="Street Address"
                        disabled={!editMode}
                        {...register('address.street')}
                      />
                    </div>

                    <Input
                      label="City"
                      disabled={!editMode}
                      {...register('address.city')}
                    />

                    <Input
                      label="State"
                      disabled={!editMode}
                      {...register('address.state')}
                    />

                    <Input
                      label="PIN Code"
                      disabled={!editMode}
                      {...register('address.pinCode', {
                        pattern: {
                          value: /^\d{6}$/,
                          message: 'PIN code must be 6 digits'
                        }
                      })}
                      error={errors.address?.pinCode?.message}
                    />

                    <Input
                      label="Country"
                      disabled={!editMode}
                      {...register('address.country')}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Emergency Contact</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                      label="Contact Name"
                      disabled={!editMode}
                      {...register('emergencyContact.name')}
                    />

                    <Input
                      label="Contact Phone"
                      type="tel"
                      disabled={!editMode}
                      {...register('emergencyContact.phone')}
                    />

                    <Input
                      label="Relationship"
                      disabled={!editMode}
                      {...register('emergencyContact.relationship')}
                    />
                  </div>
                </div>
              </form>
            )}

            {activeTab === 'medical' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Medical Information</h3>
                
                {/* Current Health Concerns */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Current Health Concerns</h4>
                  {user?.currentHealthConcerns?.length > 0 ? (
                    <div className="space-y-2">
                      {user.currentHealthConcerns.map((concern, index) => (
                        <div key={index} className="bg-white rounded p-3 border border-gray-200">
                          <div className="flex justify-between items-start">
                            <span className="font-medium">{concern.concern}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              concern.severity === 'Severe' ? 'bg-red-100 text-red-700' :
                              concern.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {concern.severity}
                            </span>
                          </div>
                          {concern.duration && (
                            <p className="text-sm text-gray-600 mt-1">Duration: {concern.duration}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No current health concerns recorded.</p>
                  )}
                </div>

                {/* Chronic Conditions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Chronic Conditions</h4>
                  {user?.chronicConditions ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(user.chronicConditions).map(([condition, hasCondition]) => (
                        hasCondition && (
                          <span key={condition} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                            {condition.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        )
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No chronic conditions recorded.</p>
                  )}
                </div>

                {/* Current Medications */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Current Medications</h4>
                  {user?.currentMedications?.length > 0 ? (
                    <div className="space-y-3">
                      {user.currentMedications.map((med, index) => (
                        <div key={index} className="bg-white rounded p-3 border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Medication:</span>
                              <p>{med.name}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Dosage:</span>
                              <p>{med.dosage}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Frequency:</span>
                              <p>{med.frequency}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Prescribed by:</span>
                              <p>{med.prescribedBy}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No current medications recorded.</p>
                  )}
                </div>

                {/* Dosha Information */}
                {user?.doshaAssessment && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-medium text-gray-900 mb-3">Dosha Constitution</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{user.doshaAssessment.vataScore}%</div>
                        <div className="text-sm text-gray-600">Vata</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{user.doshaAssessment.pittaScore}%</div>
                        <div className="text-sm text-gray-600">Pitta</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">{user.doshaAssessment.kaphaScore}%</div>
                        <div className="text-sm text-gray-600">Kapha</div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                        Primary: {user.doshaAssessment.primaryDosha}
                      </span>
                      {user.doshaAssessment.secondaryDosha && user.doshaAssessment.secondaryDosha !== 'None' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 ml-2">
                          Secondary: {user.doshaAssessment.secondaryDosha}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                
                {/* Password Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Password</h4>
                      <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable 2FA
                    </Button>
                  </div>
                </div>

                {/* Biometric Authentication */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Biometric Authentication</h4>
                      <p className="text-sm text-gray-600">Use fingerprint or face recognition to sign in</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Setup Biometric
                    </Button>
                  </div>
                </div>

                {/* Login Activity */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Recent Login Activity</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium">Current Session</p>
                        <p className="text-xs text-gray-600">Chrome on Windows • Your location</p>
                      </div>
                      <span className="text-xs text-green-600">Active now</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium">Mobile App</p>
                        <p className="text-xs text-gray-600">iPhone • Mumbai, India</p>
                      </div>
                      <span className="text-xs text-gray-600">2 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
                
                {/* Notification Preferences */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Notification Preferences</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700">Email Notifications</div>
                        <div className="text-sm text-gray-600">Receive updates via email</div>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700">SMS Notifications</div>
                        <div className="text-sm text-gray-600">Receive important updates via SMS</div>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700">Appointment Reminders</div>
                        <div className="text-sm text-gray-600">Get reminded about upcoming appointments</div>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700">Wellness Tips</div>
                        <div className="text-sm text-gray-600">Receive daily wellness and health tips</div>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                  </div>
                </div>

                {/* Language Preferences */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Language & Region</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500">
                        <option value="en">English</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                        <option value="mr">मराठी (Marathi)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500">
                        <option value="Asia/Kolkata">India Standard Time (IST)</option>
                        <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Privacy Preferences */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Privacy Settings</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700">Share Health Data for Research</div>
                        <div className="text-sm text-gray-600">Help improve Ayurvedic treatments (anonymized)</div>
                      </div>
                      <input type="checkbox" className="toggle" />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700">Marketing Communications</div>
                        <div className="text-sm text-gray-600">Receive promotional offers and updates</div>
                      </div>
                      <input type="checkbox" className="toggle" />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;