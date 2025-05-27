// src/pages/dashboard/UserProfile.tsx
// User Profile Dashboard Page - User account management and settings
// Features: personal info editing, address management, password change, account settings

import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Save,
  Edit,
  Shield,
  Bell,
  Trash2,
  CheckCircle
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import AuthContext from '../../context/AuthContext';

// Form validation schemas
const personalInfoSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  phone: yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
});

const addressSchema = yup.object({
  street: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  pincode: yup.string()
    .required('Pincode is required')
    .matches(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
  landmark: yup.string()
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

type PersonalInfoForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type AddressForm = {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const UserProfile: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState({ personal: false, address: false });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true
  });

  // Personal Info Form
  const personalInfoForm = useForm<PersonalInfoForm>({
    resolver: yupResolver(personalInfoSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    }
  });

  // Address Form
  const addressForm = useForm<AddressForm>({
    resolver: yupResolver(addressSchema),
    defaultValues: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
      landmark: user?.address?.landmark || '',
    }
  });

  // Password Form
  const passwordForm = useForm<PasswordForm>({
    resolver: yupResolver(passwordSchema)
  });

  const onPersonalInfoSubmit = async (data: PersonalInfoForm) => {
    try {
      console.log('Updating personal info:', data);
      // API call would go here
      setIsEditing({ ...isEditing, personal: false });
    } catch (error) {
      console.error('Error updating personal info:', error);
    }
  };

  const onAddressSubmit = async (data: AddressForm) => {
    try {
      console.log('Updating address:', data);
      // API call would go here
      setIsEditing({ ...isEditing, address: false });
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      console.log('Changing password');
      // API call would go here
      passwordForm.reset();
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const handleNotificationChange = (type: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [type]: value }));
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <User className="h-4 w-4" /> },
    { id: 'address', label: 'Address', icon: <MapPin className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Profile Header */}
      <Card variant="elevated" className="p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 font-semibold text-xl">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified Account
            </span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card variant="bordered" className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card variant="elevated" className="p-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    <p className="text-gray-600">Update your personal details</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing({ ...isEditing, personal: !isEditing.personal })}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {isEditing.personal ? 'Cancel' : 'Edit'}
                  </Button>
                </div>

                <form onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        icon={<User className="h-5 w-5" />}
                        disabled={!isEditing.personal}
                        error={personalInfoForm.formState.errors.firstName?.message}
                        {...personalInfoForm.register('firstName')}
                      />
                      <Input
                        label="Last Name"
                        icon={<User className="h-5 w-5" />}
                        disabled={!isEditing.personal}
                        error={personalInfoForm.formState.errors.lastName?.message}
                        {...personalInfoForm.register('lastName')}
                      />
                    </div>
                    <Input
                      label="Email Address"
                      type="email"
                      icon={<Mail className="h-5 w-5" />}
                      disabled={!isEditing.personal}
                      error={personalInfoForm.formState.errors.email?.message}
                      {...personalInfoForm.register('email')}
                    />
                    <Input
                      label="Phone Number"
                      icon={<Phone className="h-5 w-5" />}
                      disabled={!isEditing.personal}
                      error={personalInfoForm.formState.errors.phone?.message}
                      {...personalInfoForm.register('phone')}
                    />
                  </div>

                  {isEditing.personal && (
                    <div className="mt-6 flex justify-end">
                      <Button type="submit" variant="primary">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Address Tab */}
            {activeTab === 'address' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                    <p className="text-gray-600">Update your pickup address</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing({ ...isEditing, address: !isEditing.address })}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {isEditing.address ? 'Cancel' : 'Edit'}
                  </Button>
                </div>

                <form onSubmit={addressForm.handleSubmit(onAddressSubmit)}>
                  <div className="space-y-4">
                    <Input
                      label="Street Address"
                      icon={<MapPin className="h-5 w-5" />}
                      disabled={!isEditing.address}
                      error={addressForm.formState.errors.street?.message}
                      {...addressForm.register('street')}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="City"
                        disabled={!isEditing.address}
                        error={addressForm.formState.errors.city?.message}
                        {...addressForm.register('city')}
                      />
                      <Input
                        label="State"
                        disabled={!isEditing.address}
                        error={addressForm.formState.errors.state?.message}
                        {...addressForm.register('state')}
                      />
                      <Input
                        label="Pincode"
                        disabled={!isEditing.address}
                        error={addressForm.formState.errors.pincode?.message}
                        {...addressForm.register('pincode')}
                      />
                    </div>
                    <Input
                      label="Landmark (Optional)"
                      disabled={!isEditing.address}
                      {...addressForm.register('landmark')}
                    />
                  </div>

                  {isEditing.address && (
                    <div className="mt-6 flex justify-end">
                      <Button type="submit" variant="primary">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                  <p className="text-gray-600">Manage your password and security preferences</p>
                </div>

                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Change Password</h4>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                      <div className="space-y-4">
                        <Input
                          label="Current Password"
                          type="password"
                          icon={<Lock className="h-5 w-5" />}
                          error={passwordForm.formState.errors.currentPassword?.message}
                          {...passwordForm.register('currentPassword')}
                        />
                        <Input
                          label="New Password"
                          type="password"
                          icon={<Lock className="h-5 w-5" />}
                          error={passwordForm.formState.errors.newPassword?.message}
                          {...passwordForm.register('newPassword')}
                        />
                        <Input
                          label="Confirm New Password"
                          type="password"
                          icon={<Lock className="h-5 w-5" />}
                          error={passwordForm.formState.errors.confirmPassword?.message}
                          {...passwordForm.register('confirmPassword')}
                        />
                      </div>
                      <div className="mt-4">
                        <Button type="submit" variant="primary" size="sm">
                          Update Password
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Account Actions */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Account Actions</h4>
                    <div className="space-y-3">
                      <Button variant="outline" size="sm" fullWidth>
                        Download My Data
                      </Button>
                      <Button variant="danger" size="sm" fullWidth>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                  <p className="text-gray-600">Choose how you want to receive updates</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive updates about your pickups via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => handleNotificationChange('email', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                      <p className="text-sm text-gray-600">Receive pickup reminders via SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Push Notifications</h4>
                      <p className="text-sm text-gray-600">Receive browser notifications for important updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) => handleNotificationChange('push', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-6">
                  <Button variant="primary">
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;