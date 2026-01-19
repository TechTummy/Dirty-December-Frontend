import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Package, Save, AlertCircle, CheckCircle, Truck, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '../components/Card';
import { GradientButton } from '../components/GradientButton';
import { packages } from '../data/packages';
import { user } from '../../lib/api';

type Screen = 'landing' | 'login' | 'forgot-password' | 'onboarding' | 'dashboard' | 'contribute' | 'value-preview' | 'announcements' | 'admin-login' | 'admin-dashboard' | 'profile';

interface ProfileProps {
  onNavigate: (screen: Screen) => void;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  selectedPackage?: string;
  userStatus?: 'active' | 'reserved';
  userState?: string;
  onProfileUpdate?: () => void;
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
  userEmail,
  userPhone,
  selectedPackage = 'Basic Bundle',
  userStatus = 'active',
  userState = '',
  onProfileUpdate,
}: ProfileProps) {
  
  // Profile edit state
  // Profile edit state
  const [profileData, setProfileData] = useState({
    name: userName,
    phone: userPhone || '',
    state: ''
  });

  // Delivery info state
  const [delivery, setDelivery] = useState({
    type: 'pickup',
    address: '',
    state: '',
    lga: ''
  });

  // Notification states
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Get the user's package
  const userPackage = packages.find(pkg => pkg.name === selectedPackage) || packages[0];

  useEffect(() => {
    setProfileData({
      name: userName,
      phone: userPhone || '',
      state: userState || ''
    });
  }, [userName, userPhone, userState]);

  // Fetch saved delivery settings
  const { data: deliverySettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['delivery-settings'],
    queryFn: user.getDeliverySettings,
  });

  // Update state when data is fetched
  useEffect(() => {
    if (deliverySettings?.data) {
      const data = deliverySettings.data;
      setDelivery({
        type: data.type || 'pickup',
        address: data.street_address || '',
        state: data.state || '',
        lga: data.city || '' 
      });
    }
  }, [deliverySettings]);

  // Profile Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: user.updateProfile,
    onSuccess: (data: any) => {
      // Update local storage if backend returns the updated user object
      if (data?.data) {
        let newUser = data.data;
        // Check if nested user object exists (e.g. { data: { user: {...}, message: "..." } })
        if (data.data.user) {
           newUser = data.data.user;
        }
        
        const savedUserStr = localStorage.getItem('user_data');
        const savedUser = savedUserStr ? JSON.parse(savedUserStr) : {};
        const updatedUser = { ...savedUser, ...newUser };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      }
      
      setSuccessMessage('Profile updated successfully!');
      setShowSuccessMessage(true);
      
      // Notify parent app to refresh state immediately
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      
      setTimeout(() => setShowSuccessMessage(false), 3000);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || 'Failed to update profile');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: user.saveDeliverySettings,
    onSuccess: () => {
      setSuccessMessage('Settings saved successfully!');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || 'Failed to save settings');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  });

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleSaveDelivery = () => {
    if (delivery.type === 'delivery') {
      if (!delivery.address || !delivery.state) {
        setErrorMessage('Please fill in your delivery address and state');
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 3000);
        return;
      }
    }

    const payload = {
      type: delivery.type,
      ...(delivery.type === 'delivery' && {
        street_address: delivery.address,
        state: delivery.state,
        city: delivery.lga, 
        phone_number: profileData.phone // use updated phone
      })
    };

    saveMutation.mutate(payload);
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
            <span className="text-white text-3xl font-bold">{userName.split(' ').map(n => n[0]).join('')}</span>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {showSuccessMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in max-w-[90%]">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">{successMessage}</span>
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
              <div className="relative">
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">State of Residence</label>
              <div className="relative">
                <select
                  value={profileData.state}
                  onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer appearance-none"
                >
                  <option value="">Select State</option>
                  {nigerianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={userEmail}
                  readOnly
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={profileData.phone}
                  readOnly
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>
            
            <div className="pt-2">
              <GradientButton onClick={handleUpdateProfile} disabled={updateProfileMutation.isPending}>
                <span className="flex items-center gap-2">
                  {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
                </span>
              </GradientButton>
            </div>
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
            <GradientButton onClick={handleSaveDelivery} disabled={saveMutation.isPending}>
              <span className="flex items-center gap-2">
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saveMutation.isPending ? 'Saving...' : 'Save Delivery Info'}
              </span>
            </GradientButton>
          </div>
        </Card>
      </div>
    </div>
  );
}
