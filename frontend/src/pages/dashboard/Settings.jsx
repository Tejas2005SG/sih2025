import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Smartphone,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Save,
  RefreshCw,
  Key,
  Fingerprint,
  Database,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

const Settings = () => {
  const { user, logout, changePassword } = useAuthStore();
  const { preferences, updatePreferences, savePreferences, isLoading } = useUserStore();
  const [activeTab, setActiveTab] = useState('account');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [localPreferences, setLocalPreferences] = useState(preferences);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'language', label: 'Language & Region', icon: Globe },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ];

  const handlePreferenceChange = (category, key, value) => {
    setLocalPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSavePreferences = async () => {
    const result = await savePreferences(localPreferences);
    if (result.success) {
      updatePreferences(localPreferences);
    }
  };

  const handlePasswordChange = async (passwordData) => {
    const result = await changePassword(passwordData);
    if (result.success) {
      setShowPasswordModal(false);
    }
  };

  const handleExportData = () => {
    // Mock data export
    const exportData = {
      profile: user,
      preferences: localPreferences,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ayursutra-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure? This action cannot be undone.')) {
      // Implement account deletion logic
      console.log('Account deletion requested');
      setShowDeleteModal(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and privacy settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                        ${activeTab === tab.id
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="flex items-center space-x-3">
                            <Input
                              value={user?.email || ''}
                              disabled
                              leftIcon={Mail}
                            />
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              Verified
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <div className="flex items-center space-x-3">
                            <Input
                              value={user?.phoneNumber || ''}
                              disabled
                              leftIcon={Phone}
                            />
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              user?.isPhoneVerified 
                                ? 'text-green-600 bg-green-100' 
                                : 'text-yellow-600 bg-yellow-100'
                            }`}>
                              {user?.isPhoneVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Status
                          </label>
                          <div className="flex items-center space-x-3">
                            <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm">
                              Active
                            </span>
                            <span className="text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm">
                              Premium Member
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Member Since
                          </label>
                          <p className="text-gray-600">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Login
                          </label>
                          <p className="text-gray-600">
                            {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Primary Dosha
                          </label>
                          <p className="text-gray-600">
                            {user?.doshaAssessment?.primaryDosha || 'Not assessed'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr />

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => window.location.href = '/profile'}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => setShowPasswordModal(true)}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => window.location.href = '/dosha-assessment'}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retake Dosha Test
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                    <p className="text-gray-600 mb-6">Choose how you want to be notified about important updates.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                        <Mail className="w-5 h-5 mr-2 text-green-600" />
                        Email Notifications
                      </h3>
                      <div className="space-y-3">
                        {[
                          { key: 'email', label: 'General email notifications', description: 'Receive updates about your account and services' },
                          { key: 'appointments', label: 'Appointment reminders', description: 'Get reminded about upcoming appointments' },
                          { key: 'medications', label: 'Medication reminders', description: 'Reminders to take your prescribed medications' },
                          { key: 'wellness', label: 'Wellness tips', description: 'Daily health and wellness recommendations' }
                        ].map((item) => (
                          <label key={item.key} className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={localPreferences.notifications?.[item.key] || false}
                              onChange={(e) => handlePreferenceChange('notifications', item.key, e.target.checked)}
                              className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <div>
                              <div className="font-medium text-gray-700">{item.label}</div>
                              <div className="text-sm text-gray-500">{item.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* SMS Notifications */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                        <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
                        SMS Notifications
                      </h3>
                      <div className="space-y-3">
                        {[
                          { key: 'sms', label: 'SMS notifications', description: 'Receive important updates via text message' },
                          { key: 'urgent', label: 'Urgent notifications only', description: 'Only critical health alerts and appointment changes' }
                        ].map((item) => (
                          <label key={item.key} className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={localPreferences.notifications?.[item.key] || false}
                              onChange={(e) => handlePreferenceChange('notifications', item.key, e.target.checked)}
                              className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <div>
                              <div className="font-medium text-gray-700">{item.label}</div>
                              <div className="text-sm text-gray-500">{item.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-purple-600" />
                        Push Notifications
                      </h3>
                      <div className="space-y-3">
                        {[
                          { key: 'push', label: 'Browser notifications', description: 'Show notifications in your web browser' },
                          { key: 'mobile', label: 'Mobile app notifications', description: 'Notifications on your mobile device' }
                        ].map((item) => (
                          <label key={item.key} className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={localPreferences.notifications?.[item.key] || false}
                              onChange={(e) => handlePreferenceChange('notifications', item.key, e.target.checked)}
                              className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <div>
                              <div className="font-medium text-gray-700">{item.label}</div>
                              <div className="text-sm text-gray-500">{item.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      icon={Save}
                      onClick={handleSavePreferences}
                      isLoading={isLoading}
                    >
                      Save Preferences
                    </Button>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>
                    <p className="text-gray-600 mb-6">Manage your account security and authentication methods.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Password */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Lock className="w-5 h-5 text-gray-400" />
                          <div>
                            <h3 className="font-medium text-gray-900">Password</h3>
                            <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPasswordModal(true)}
                        >
                          Change Password
                        </Button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Key className="w-5 h-5 text-gray-400" />
                          <div>
                            <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable 2FA
                        </Button>
                      </div>
                    </div>

                    {/* Biometric Authentication */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Fingerprint className="w-5 h-5 text-gray-400" />
                          <div>
                            <h3 className="font-medium text-gray-900">Biometric Authentication</h3>
                            <p className="text-sm text-gray-600">Use fingerprint or face recognition to sign in</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Setup Biometric
                        </Button>
                      </div>
                    </div>

                    {/* Login Activity */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Recent Login Activity</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <p className="font-medium text-gray-900">Current Session</p>
                            <p className="text-sm text-gray-600">Chrome on Windows • Mumbai, India</p>
                          </div>
                          <span className="text-sm text-green-600">Active now</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <p className="font-medium text-gray-900">Mobile App</p>
                            <p className="text-sm text-gray-600">iPhone • Mumbai, India</p>
                          </div>
                          <span className="text-sm text-gray-600">2 days ago</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <div>
                            <p className="font-medium text-gray-900">Web Browser</p>
                            <p className="text-sm text-gray-600">Safari on Mac • Delhi, India</p>
                          </div>
                          <span className="text-sm text-gray-600">1 week ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy Settings</h2>
                    <p className="text-gray-600 mb-6">Control how your data is used and shared.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: 'shareHealthData',
                        title: 'Share Health Data for Research',
                        description: 'Allow anonymized health data to be used for Ayurvedic research and treatment improvements'
                      },
                      {
                        key: 'anonymousUsage',
                        title: 'Anonymous Usage Analytics',
                        description: 'Help improve our service by sharing anonymous usage patterns'
                      },
                      {
                        key: 'marketingEmails',
                        title: 'Marketing Communications',
                        description: 'Receive promotional offers, wellness tips, and product updates'
                      },
                      {
                        key: 'profileVisibility',
                        title: 'Profile Visibility',
                        description: 'Allow healthcare providers to see your basic profile information'
                      }
                    ].map((item) => (
                      <div key={item.key} className="border rounded-lg p-4">
                        <label className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={localPreferences.privacy?.[item.key] || false}
                            onChange={(e) => handlePreferenceChange('privacy', item.key, e.target.checked)}
                            className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{item.title}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      icon={Save}
                      onClick={handleSavePreferences}
                      isLoading={isLoading}
                    >
                      Save Privacy Settings
                    </Button>
                  </div>
                </div>
              )}

              {/* Language & Region */}
              {activeTab === 'language' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Language & Region</h2>
                    <p className="text-gray-600 mb-6">Customize your language and regional preferences.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select 
                        value={localPreferences.language || 'en'}
                        onChange={(e) => handlePreferenceChange('language', 'primary', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500"
                      >
                        <option value="en">English</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                        <option value="mr">मराठी (Marathi)</option>
                        <option value="gu">ગુજરાતી (Gujarati)</option>
                        <option value="ta">தமிழ் (Tamil)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500">
                        <option value="Asia/Kolkata">India Standard Time (IST)</option>
                        <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                        <option value="Asia/Singapore">Singapore Standard Time (SST)</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Format
                      </label>
                      <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500">
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500">
                        <option value="INR">Indian Rupee (₹)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">British Pound (£)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      icon={Save}
                      onClick={handleSavePreferences}
                      isLoading={isLoading}
                    >
                      Save Language Settings
                    </Button>
                  </div>
                </div>
              )}

              {/* Data Management */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Management</h2>
                    <p className="text-gray-600 mb-6">Manage your personal data and account information.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Export Data */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">Export Your Data</h3>
                          <p className="text-sm text-gray-600">Download a copy of your personal data</p>
                        </div>
                        <Button
                          variant="outline"
                          icon={Download}
                          onClick={() => setShowExportModal(true)}
                        >
                          Export Data
                        </Button>
                      </div>
                    </div>

                    {/* Data Usage */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Data Usage Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">250 MB</div>
                          <div className="text-gray-600">Documents</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">45</div>
                          <div className="text-gray-600">Appointments</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">128</div>
                          <div className="text-gray-600">Health Records</div>
                        </div>
                      </div>
                    </div>

                    {/* Delete Account */}
                    <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-red-900">Delete Account</h3>
                          <p className="text-sm text-red-700">Permanently delete your account and all associated data</p>
                        </div>
                        <Button
                          variant="outline"
                          icon={Trash2}
                          onClick={() => setShowDeleteModal(true)}
                          className="text-red-600 border-red-300 hover:bg-red-100"
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Help & Support */}
              {activeTab === 'support' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Help & Support</h2>
                    <p className="text-gray-600 mb-6">Get help and support for your AyurSutra Wellness account.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Support */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Contact Support</h3>
                      <div className="space-y-3">
                        <a href="mailto:support@ayursutra.com" className="flex items-center space-x-3 text-sm text-blue-600 hover:text-blue-800">
                          <Mail className="w-4 h-4" />
                          <span>support@ayursutra.com</span>
                        </a>
                        <a href="tel:+919876543210" className="flex items-center space-x-3 text-sm text-blue-600 hover:text-blue-800">
                          <Phone className="w-4 h-4" />
                          <span>+91 98765 43210</span>
                        </a>
                      </div>
                    </div>

                    {/* Documentation */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Documentation</h3>
                      <div className="space-y-2">
                        <a href="/help/getting-started" className="block text-sm text-blue-600 hover:text-blue-800">
                          Getting Started Guide
                        </a>
                        <a href="/help/faq" className="block text-sm text-blue-600 hover:text-blue-800">
                          Frequently Asked Questions
                        </a>
                        <a href="/help/privacy-policy" className="block text-sm text-blue-600 hover:text-blue-800">
                          Privacy Policy
                        </a>
                        <a href="/help/terms-of-service" className="block text-sm text-blue-600 hover:text-blue-800">
                          Terms of Service
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* System Information */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">System Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">App Version:</span>
                        <span className="ml-2 text-gray-600">1.0.0</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Last Updated:</span>
                        <span className="ml-2 text-gray-600">January 2024</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Browser:</span>
                        <span className="ml-2 text-gray-600">{navigator.userAgent.split(' ')[0]}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Platform:</span>
                        <span className="ml-2 text-gray-600">{navigator.platform}</span>
                      </div>
                    </div>
                  </div>

                  {/* Logout */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Sign Out</h3>
                        <p className="text-sm text-gray-600">Sign out of your account on this device</p>
                      </div>
                      <Button
                        variant="outline"
                        icon={LogOut}
                        onClick={logout}
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <PasswordChangeModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            onSubmit={handlePasswordChange}
          />
        )}

        {/* Export Data Modal */}
        {showExportModal && (
          <Modal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            title="Export Your Data"
            size="md"
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                This will download a JSON file containing all your personal data, including:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Profile information</li>
                <li>Medical records and documents</li>
                <li>Appointment history</li>
                <li>Dosha assessment results</li>
                <li>Preferences and settings</li>
              </ul>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowExportModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  icon={Download}
                  onClick={handleExportData}
                >
                  Export Data
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <Modal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Delete Account"
            size="md"
          >
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <h3 className="font-medium text-red-900">Warning: This action is irreversible</h3>
                </div>
                <p className="text-red-700 mt-2">
                  Deleting your account will permanently remove all your data, including:
                </p>
                <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                  <li>All medical records and documents</li>
                  <li>Appointment history</li>
                  <li>Dosha assessment results</li>
                  <li>Personal profile information</li>
                </ul>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type "DELETE" to confirm:
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="Type DELETE to confirm"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  icon={Trash2}
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700 border-red-600"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

// Password Change Modal Component
const PasswordChangeModal = ({ isOpen, onClose, onSubmit }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Password"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Current Password"
          type={showCurrentPassword ? 'text' : 'password'}
          leftIcon={Lock}
          rightIcon={showCurrentPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowCurrentPassword(!showCurrentPassword)}
          value={formData.currentPassword}
          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
          error={errors.currentPassword}
        />

        <Input
          label="New Password"
          type={showNewPassword ? 'text' : 'password'}
          leftIcon={Lock}
          rightIcon={showNewPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowNewPassword(!showNewPassword)}
          value={formData.newPassword}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          error={errors.newPassword}
        />

        <Input
          label="Confirm New Password"
          type={showConfirmPassword ? 'text' : 'password'}
          leftIcon={Lock}
          rightIcon={showConfirmPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={errors.confirmPassword}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Change Password
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default Settings;