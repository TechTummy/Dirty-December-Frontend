import { Bell, ChevronRight, Gift, MessageCircle, Sparkles, Calendar, LogOut, User, Clock, Receipt, MapPin, Truck, UserCog, Loader, CheckCircle } from 'lucide-react';
import { GradientButton } from '../components/GradientButton';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Partners } from '../components/Partners';
import { Testimonials } from '../components/Testimonials';
import { TransactionDrawer } from '../components/TransactionDrawer';
import { DeliveryInfoModal, DeliveryInfo } from '../components/DeliveryInfoModal';
import { PackageVerificationModal } from '../components/PackageVerificationModal';
import { LearnSection } from '../components/LearnSection';
import { mergeBackendPackages } from '../utils/packageUtils';
import { useState } from 'react';
import { user, auth } from '../../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type Screen = 'landing' | 'login' | 'forgot-password' | 'onboarding' | 'dashboard' | 'contribute' | 'value-preview' | 'announcements' | 'admin-login' | 'admin-dashboard' | 'profile';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
  userName: string;
  onLogout: () => void;
  userStatus?: 'active' | 'reserved';
  selectedPackage?: string;
  quantity?: number;
  packageId?: number;
}

export function Dashboard({ onNavigate, userName, onLogout, userStatus = 'active', selectedPackage = 'Basic Bundle', quantity = 1, packageId }: DashboardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showTransactionDrawer, setShowTransactionDrawer] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch Transactions
  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: user.getTransactions,
    retry: 1
  });

  // Fetch Dashboard Stats
  const { data: dashboardStatsData } = useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: user.getDashboard,
  });

  // Use API transactions or fallback to empty array
  const rawHistory = transactionsData?.data?.data || transactionsData?.data || [];
  const contributionHistory = Array.isArray(rawHistory) 
    ? rawHistory.filter((t: any) => t.type !== 'delivery') 
    : [];

  // Fetch Delivery Settings
  const { data: deliverySettingsData } = useQuery({
    queryKey: ['deliveryLink'],
    queryFn: user.getDeliverySettings,
    retry: 1
  });

  const rawDelivery = deliverySettingsData?.data;
  const deliveryInfo: DeliveryInfo | null = rawDelivery ? {
    method: rawDelivery.type || 'pickup', // API uses 'type', frontend uses 'method'
    type: rawDelivery.type,
    address: rawDelivery.street_address || rawDelivery.address,
    city: rawDelivery.city,
    state: rawDelivery.state,
    landmark: rawDelivery.landmark,
    phoneNumber: rawDelivery.phone_number || rawDelivery.phoneNumber
  } : null;

  // Fetch Packages for dynamic calculation
  const { data: packagesData } = useQuery({
    queryKey: ['packages'],
    queryFn: auth.getPackages,
  });

  // Save Delivery Settings Mutation
  const saveDeliveryMutation = useMutation({
    mutationFn: user.saveDeliverySettings,
    onSuccess: () => {
      toast.success('Delivery information saved successfully');
      queryClient.invalidateQueries({ queryKey: ['deliveryLink'] });
      setShowDeliveryModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save delivery information');
    }
  });

  // Fetch Payment Reminder Status
  const { data: reminderStatusData, isLoading: isLoadingReminder } = useQuery({
    queryKey: ['payment-reminder-status'],
    queryFn: user.getPaymentReminderStatus,
  });

  // Toggle Payment Reminder Mutation
  const toggleReminderMutation = useMutation({
    mutationFn: user.togglePaymentReminder,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['payment-reminder-status'] });
      toast.success(data.message || 'Payment reminder preference updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update reminder settings');
    }
  });

  // Get the user's package dynamically
  // 1. Get backend packages list
  const backendList = packagesData?.data?.packages && Array.isArray(packagesData.data.packages) 
    ? packagesData.data.packages 
    : [];
  
  // 2. Merge with frontend definitions
  const allPackages = mergeBackendPackages(backendList);
  
  // 3. Find match by ID (preferred) or name
  // 3. Find match by ID (preferred) or name
  const foundPackage = (packageId ? allPackages.find(pkg => Number(pkg.id) === Number(packageId)) : null) || 
                      allPackages.find(pkg => pkg.name === selectedPackage);
  
  // Safe fallback to prevent UI blocking
  const userPackage = foundPackage || {
    id: 'unknown',
    name: 'No Active Category',
    description: 'Please contact support',
    monthlyAmount: 0,
    yearlyTotal: 0,
    estimatedRetailValue: 0,
    savings: 0,
    savingsPercent: 0,
    benefits: [],
    gradient: 'from-gray-400 to-gray-500',
    shadowColor: 'shadow-gray-400/30',
    badge: null
  } as any; // Cast to bypass strict type checks for the fallback

  // Handle case where package is strictly loading (only if we really need to wait)
  // But generally we prefer showing the fallback UI over a Spinner if data might be missing
  if (!foundPackage && packagesData?.isLoading) {
        return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        );
  }

  const stats = dashboardStatsData?.data || {};

  // Calculate stats strictly from filtered history to avoid Backend including delivery fees
  const totalContributed = contributionHistory
    .filter((c: any) => c.status === 'confirmed' || c.status === 'success' || c.status === 'approved')
    .reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0);
  const confirmedContributions = contributionHistory.filter((c: any) => c.status === 'confirmed' || c.status === 'success' || c.status === 'approved').length;
  
  // TODO: Change back to 12 after testing
  const REQUIRED_CONTRIBUTIONS = 12; 
  
  const progressPercent = (confirmedContributions / REQUIRED_CONTRIBUTIONS) * 100;
  const nextYear = new Date().getFullYear() + 1;
  const currentYear = new Date().getFullYear();
  
  // Package values
  const expectedTotal = userPackage.monthlyAmount * 12 * quantity;
  const currentValue = Math.round((userPackage.estimatedRetailValue * quantity / 12) * confirmedContributions);
  const projectedSavings = userPackage.savings * quantity;

  // Next Payment Info
  const isCompleted = confirmedContributions >= REQUIRED_CONTRIBUTIONS;
  const nextPaymentMonth = stats.next_payment_date 
    ? new Date(stats.next_payment_date).toLocaleString('default', { month: 'long' }) 
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][Math.min(confirmedContributions, 11)];

  const handleSaveDeliveryInfo = (info: DeliveryInfo) => {
    saveDeliveryMutation.mutate(info);
  };

  // ... rest of component


  // Reserved spot view
  if (userStatus === 'reserved') {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 px-6 pt-12 pb-24 rounded-b-[2.5rem]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-slate-300 text-sm mb-1 font-medium">Welcome,</p>
              <h1 className="text-white text-2xl font-bold">{userName || 'Member'}</h1>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onNavigate('announcements')}
                className="relative w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
              >
                <Bell className="w-5 h-5 text-white" />
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
                >
                  <User className="w-5 h-5 text-white" />
                </button>
                
                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowMenu(false)}
                    ></div>
                    <div className="absolute right-0 top-12 z-20 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{userName}</p>
                        <p className="text-sm text-slate-500">Reserved Member</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onNavigate('profile');
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-50 transition-colors text-left"
                      >
                        <UserCog className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900">My Profile</span>
                      </button>
                      <a
                        href="https://wa.me/2349159987252"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                        onClick={() => setShowMenu(false)}
                      >
                         <svg className="w-5 h-5 fill-current text-[#25D366]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        <span className="font-medium text-gray-900">Contact Support</span>
                      </a>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-5 h-5 text-red-600" />
                        <span className="font-medium text-red-600">Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Reserved Status Card */}
          <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl shadow-black/10">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-slate-400 to-slate-600 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-slate-500/30">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="inline-block px-4 py-2 bg-slate-100 rounded-full mb-3">
                <span className="text-sm font-bold text-slate-700">RESERVED FOR {nextYear}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Your Spot is Secured!</h2>
              <p className="text-gray-600 leading-relaxed">
                You're all set for Belleza Detty December {nextYear}. We'll notify you when registration opens in January.
              </p>
            </div>
          </Card>
        </div>

        <div className="px-6 -mt-12 pb-24">
          {/* Timeline Card */}
          <Card className="mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-3">What's Next?</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">January {nextYear}</p>
                      <p className="text-xs text-gray-600">Registration opens - we'll send you a reminder</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 text-sm">Start Contributing</p>
                      <p className="text-xs text-gray-600">Begin your ₦5,000 monthly contributions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 text-sm">December {nextYear}</p>
                      <p className="text-xs text-gray-600">Receive your bulk provisions package</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Expected Value Preview */}
          <Card className="mb-6 border-0 shadow-lg">
            <h3 className="font-bold text-gray-900 mb-4">Your Expected Value</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-2 font-medium">You'll Contribute</p>
                <p className="text-2xl font-bold text-gray-900">₦60,000</p>
                <p className="text-xs text-gray-500 mt-1">12 months × ₦5,000</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <p className="text-xs text-emerald-700 mb-2 font-medium">You'll Receive</p>
                <p className="text-2xl font-bold text-emerald-700">₦85,700</p>
                <p className="text-xs text-emerald-600 mt-1">+42% value</p>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Total Savings</span>
                <span className="text-xl font-bold text-purple-700">₦25,700</span>
              </div>
            </div>
          </Card>

          {/* Partners Card */}
          {/* <Partners variant="compact" /> */}

          {/* Testimonials Section - replacing Recent Activity */}
          <Testimonials />
        </div>

        {/* Sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-white/80 backdrop-blur-xl border-t border-gray-200">
          <GradientButton onClick={() => onNavigate('announcements')} variant="secondary">
            View Announcements
          </GradientButton>
        </div>
      </div>
    );
  }

  // Active member view (original dashboard)
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-6 pt-12 pb-24 rounded-b-[2.5rem]">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-purple-100 text-sm mb-1 font-medium">Welcome back,</p>
            <h1 className="text-white text-2xl font-bold">{userName || 'Member'}</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onNavigate('announcements')}
              className="relative w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
            >
              <Bell className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full border-2 border-purple-600 flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">3</span>
              </div>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
              >
                <User className="w-5 h-5 text-white" />
              </button>
              
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)}
                  ></div>
                  <div className="absolute right-0 top-12 z-20 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{userName}</p>
                      <p className="text-sm text-gray-500">Member</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onNavigate('profile');
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-50 transition-colors text-left"
                    >
                      <UserCog className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900">My Profile</span>
                    </button>
                    <a
                      href="https://wa.me/2349159987252"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-green-50 transition-colors text-left"
                      onClick={() => setShowMenu(false)}
                    >
                      <svg className="w-5 h-5 fill-current text-[#25D366]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <span className="font-medium text-gray-900">Contact Support</span>
                    </a>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-600">Logout</span>
                    </button>

                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl shadow-black/10">
          {/* Package Badge */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${userPackage.gradient} inline-block`}>
                  <span className="text-xs font-bold text-white">{userPackage.name.toUpperCase()}</span>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-purple-100 inline-block">
                  <span className="text-xs font-bold text-purple-700">{quantity} {quantity === 1 ? 'Slot' : 'Slots'}</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 font-medium">
                Monthly: ₦{(userPackage.monthlyAmount * quantity).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Expected Total</p>
              <p className="text-sm font-bold text-gray-900">₦{expectedTotal.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-500 text-sm mb-1 font-medium">Total Contributed</p>
              <h2 className="text-4xl font-bold text-gray-900">₦{totalContributed.toLocaleString()}</h2>
            </div>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${userPackage.gradient} flex items-center justify-center shadow-lg ${userPackage.shadowColor}`}>
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>
          
          {/* Monthly Progress Grid */}
          <div className="mb-4">
             <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-700">Monthly Progress</span>
                <span className="text-xs font-bold text-purple-700">{confirmedContributions}/{REQUIRED_CONTRIBUTIONS} Paid</span>
             </div>
              <div className="grid grid-cols-6 gap-2 sm:gap-3">
                 {Array.from({ length: 12 }, (_, i) => i + 1).map((monthIndex) => {
                    // Since specific month tracking is tricky without backend indices, 
                    // we assume sequential payments for the frontend display based on count
                    const isPaid = monthIndex <= confirmedContributions;
                    const isNext = !isPaid && !isCompleted && (monthIndex === confirmedContributions + 1);
                    const monthName = new Date(0, monthIndex - 1).toLocaleString('default', { month: 'short' });
                    
                    return (
                       <div 
                         key={monthIndex}
                         className={`
                            relative flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-medium border transition-all
                            ${isPaid 
                               ? `bg-gradient-to-br ${userPackage.gradient} text-white border-transparent shadow-sm` 
                               : isNext
                                  ? 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-200 ring-offset-1'
                                  : 'bg-slate-50 text-gray-400 border-slate-100'
                            }
                         `}
                       >
                          <span>{monthName}</span>
                          {isPaid && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /></div>}
                       </div>
                    );
                 })}
              </div>
          </div>
          
          <p className="text-xs text-gray-500 font-medium mb-3">
             {isCompleted 
                ? 'All monthly contributions completed!' 
                : `${Math.max(0, REQUIRED_CONTRIBUTIONS - confirmedContributions)} months remaining`
             }
          </p>

          {/* Savings Preview */}
          {/* <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Projected Savings</span>
              <span className="text-xl font-bold text-emerald-700">₦{projectedSavings.toLocaleString()}</span>
            </div>
          </div> */}
          
          {/* View Transactions Button */}
          <button
            onClick={() => setShowTransactionDrawer(true)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 hover:border-indigo-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            <Receipt className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-indigo-700">View Transactions</span>
            <ChevronRight className="w-4 h-4 text-indigo-600" />
          </button>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-12 pb-36">
        <div className="mb-6">
          <button
            onClick={() => onNavigate('value-preview')}
            className="group active:scale-95 transition-transform w-full mb-4"
          >
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${userPackage.gradient} mx-auto mb-3 flex items-center justify-center shadow-lg ${userPackage.shadowColor}`}>
                <Gift className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-gray-900 mb-1">View Package Details</p>
              <p className="text-sm text-gray-600">See your {userPackage.name} benefits</p>
            </Card>
          </button>

          {isCompleted && (
             <button
              onClick={() => setShowVerificationModal(true)}
              className="group active:scale-95 transition-transform w-full"
            >
              <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow bg-purple-50/50 border-purple-100">
                <div className="w-10 h-10 rounded-xl bg-purple-100 mx-auto mb-2 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <p className="font-semibold text-gray-900 text-sm">Verify Package Receipt</p>
                <p className="text-xs text-gray-500">Confirm you've received your items</p>
              </Card>
            </button>
          )}
        </div>

        {/* Next Payment Alert */}
        <Card className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{isCompleted ? 'Contributions Completed' : 'Next Contribution'}</h3>
                  <p className="text-sm text-gray-600">
                      {isCompleted 
                      ? 'You have completed all your contributions!' 
                      : `${stats.next_payment_date || nextPaymentMonth} • ₦${(stats.next_payment_amount || userPackage.monthlyAmount * quantity).toLocaleString()}`
                    }
                  </p>
                </div>
                <StatusBadge status={isCompleted ? 'success' : 'pending'} />
              </div>
              <label className={`flex items-center gap-2 mt-3 cursor-pointer group ${isLoadingReminder ? 'opacity-50 pointer-events-none' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={reminderStatusData?.data?.payment_reminder_enabled || false}
                  onChange={() => toggleReminderMutation.mutate()}
                  disabled={isLoadingReminder || toggleReminderMutation.isPending}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-colors" 
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {toggleReminderMutation.isPending ? 'Updating...' : 'Enable payment reminders'}
                </span>
              </label>
            </div>
          </div>
        </Card>

        {/* Delivery Information Card */}
        <Card className="mb-6 border-0 shadow-md">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                {deliveryInfo?.method === 'delivery' ? (
                  <Truck className="w-6 h-6 text-white" />
                ) : (
                  <MapPin className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delivery Information</h3>
                <p className="text-sm text-gray-600">
                  {deliveryInfo ? (
                    deliveryInfo.method === 'delivery' ? 'Home Delivery' : 'Pickup at Center'
                  ) : (
                    'Not set'
                  )}
                </p>
              </div>
            </div>
          </div>

          {deliveryInfo ? (
            <>
              {deliveryInfo.method === 'delivery' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {deliveryInfo.address}, {deliveryInfo.city}, {deliveryInfo.state}
                        {deliveryInfo.landmark && <><br/>Near {deliveryInfo.landmark}</>}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">{deliveryInfo.phoneNumber}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {deliveryInfo.method === 'pickup' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    You'll receive pickup location details via announcements closer to December.
                  </p>
                </div>
              )}

              {new Date().getMonth() >= 7 ? (
                <button
                  onClick={() => setShowDeliveryModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                  <span className="font-semibold text-gray-700 text-sm">Update Delivery Info</span>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Delivery updates are locked until August 1st.
                  </p>
                </div>
              )}
            </>
          ) : (
            new Date().getMonth() >= 7 ? (
              <button
                onClick={() => setShowDeliveryModal(true)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-white font-semibold"
              >
                <MapPin className="w-5 h-5" />
                Set Delivery Information
              </button>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                 <p className="text-sm text-gray-500 mb-2">Delivery selection opens on August 1st</p>
                 <button disabled className="px-4 py-2 bg-slate-200 text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed">
                    Set Delivery Info
                 </button>
              </div>
            )
          )}
        </Card>

        {/* Learn Section */}
        <LearnSection />

        {/* Testimonials Section - replacing Recent Activity */}
        <Testimonials />
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-white/80 backdrop-blur-xl border-t border-gray-200">
        <GradientButton 
          onClick={() => onNavigate('contribute')}
          disabled={isCompleted}
        >
          {isCompleted ? 'All Contributions Paid' : 'Make Contribution'}
        </GradientButton>
      </div>

      {/* Transaction Drawer */}
      <TransactionDrawer
        isOpen={showTransactionDrawer}
        onClose={() => setShowTransactionDrawer(false)}
        transactions={contributionHistory}
        onRetry={(transaction) => {
          // Navigate to contribute screen to resubmit the contribution
          onNavigate('contribute');
        }}
      />

      {/* Delivery Info Modal */}
      <DeliveryInfoModal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        onSave={handleSaveDeliveryInfo}
        currentInfo={deliveryInfo}
        deliveryPaid={deliveryInfo?.state ? true : false} // If we have a state reserved in backend, they paid. Or we add a field in API.
        // NOTE: Ideally the API should tell us if they paid. 
        // For now, if they are setting it, they might have just paid.
        // Correct approach: The modal handles 'isPaid' state internally if just paid.
        // But if returning user, we need to know. Assuming if 'state' is present in delivery settings, they paid?
        // Let's rely on the internal modal logic for "just paid" and existing data for "already set".
      />

      <PackageVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSuccess={() => {
           // Maybe refetch something or show a persistent success state
        }}
      />
    </div>
  );
}