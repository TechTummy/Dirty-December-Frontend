import { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, Package, Shield, Lock, Eye, EyeOff, Save, AlertCircle, CheckCircle, MapPin, Truck } from 'lucide-react';
import { Card } from '../components/Card';
import { GradientButton } from '../components/GradientButton';
import { packages } from '../data/packages';

type Screen = 'landing' | 'login' | 'forgot-password' | 'onboarding' | 'dashboard' | 'contribute' | 'value-preview' | 'announcements' | 'admin-login' | 'admin-dashboard' | 'profile';

interface ProfileProps {
  onNavigate: (screen: Screen) => void;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  selectedPackage?: string;
  userStatus?: 'active' | 'reserved';
  deliveryType?: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryState?: string;
  deliveryLga?: string;
}

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

export function Profile({ 
  onNavigate, 
  userName, 
  userEmail = 'chioma@email.com',
  userPhone = '080 1234 5678',
  selectedPackage = 'Basic Bundle',
  userStatus = 'active',
  deliveryType = 'pickup',
  deliveryAddress = '',
  deliveryState = '',
  deliveryLga = ''
}: ProfileProps) {
  // Profile form state
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState(userPhone);
  
  // Delivery info state
  const [delivery, setDelivery] = useState({
    type: deliveryType,
    address: deliveryAddress,
    state: deliveryState,
    lga: deliveryLga
  });

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification states
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Get the user's package
  const userPackage = packages.find(pkg => pkg.name === selectedPackage) || packages[0];

  const handleSaveProfile = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage('Please fill in all required fields');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
      return;
    }

    // In a real app, this would save to backend/database
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill in all password fields');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
      return;
    }

    // In a real app, this would verify current password and update to new password
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordSection(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-6 pt-12 pb-20 rounded-b-[2.5rem]">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white text-2xl font-bold">My Profile</h1>
            <p className="text-purple-100 text-sm">Manage your account settings</p>
          </div>
        </div>

        {/* Profile Avatar */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur border-4 border-white/30 flex items-center justify-center shadow-2xl">
            <span className="text-white text-3xl font-bold">{name.split(' ').map(n => n[0]).join('')}</span>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {showSuccessMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in max-w-[90%]">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">Changes saved successfully!</span>
          </div>
        </div>
      )}

      {showErrorMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in max-w-[90%]">
          <div className="bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-6 -mt-6 pb-24 space-y-4">
        {/* Personal Information */}
        <Card className="border-0 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/30">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="080 1234 5678"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <GradientButton onClick={handleSaveProfile}>
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </span>
            </GradientButton>
          </div>
        </Card>

        {/* Account Information (Read-only) */}
        <Card className="border-0 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/30">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Account Information</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <p className="text-xs text-purple-700 mb-1 font-medium">Current Package</p>
              <div className={`inline-block px-3 py-1.5 rounded-full bg-gradient-to-r ${userPackage.gradient} mt-1`}>
                <span className="text-sm font-bold text-white">{userPackage.name}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Contact admin to change your package</p>
            </div>

            <div className="p-4 bg-slate-50 border border-gray-200 rounded-xl">
              <p className="text-xs text-gray-600 mb-1 font-medium">Account Status</p>
              {userStatus === 'active' ? (
                <span className="flex items-center gap-1 text-emerald-700 font-semibold mt-1">
                  <CheckCircle className="w-4 h-4" />
                  Active Member
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-700 font-semibold mt-1">
                  <AlertCircle className="w-4 h-4" />
                  Reserved for 2027
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Delivery Information */}
        <Card className="border-0 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/30">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Delivery Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Method</label>
              <select
                value={delivery.type}
                onChange={(e) => setDelivery({ ...delivery, type: e.target.value as 'pickup' | 'delivery' })}
                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="pickup">Pickup at Collection Point</option>
                <option value="delivery">Home Delivery</option>
              </select>
            </div>

            {delivery.type === 'delivery' && (
              <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={delivery.address}
                    onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                    <select
                      value={delivery.state}
                      onChange={(e) => setDelivery({ ...delivery, state: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      <option value="">Select State</option>
                      {nigerianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">LGA</label>
                    <input
                      type="text"
                      value={delivery.lga}
                      onChange={(e) => setDelivery({ ...delivery, lga: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter LGA"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <GradientButton onClick={handleSaveProfile}>
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Delivery Info
              </span>
            </GradientButton>
          </div>
        </Card>

        {/* Password Security */}
        <Card className="border-0 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-md shadow-red-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Password & Security</h2>
          </div>

          {!showPasswordSection ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">Keep your account secure by updating your password regularly</p>
              <button
                onClick={() => setShowPasswordSection(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-gray-900 rounded-xl hover:bg-slate-200 transition-colors font-semibold"
              >
                <Lock className="w-4 h-4" />
                Change Password
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPasswordSection(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-gray-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <GradientButton onClick={handleChangePassword}>
                  <span className="flex items-center gap-2 flex-1 justify-center">
                    <Save className="w-4 h-4" />
                    Update Password
                  </span>
                </GradientButton>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
