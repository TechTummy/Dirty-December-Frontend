import { Bell, ChevronRight, Gift, MessageCircle, Sparkles, Calendar, LogOut, User, Clock, Receipt, MapPin, Truck, UserCog, Loader } from 'lucide-react';
import { GradientButton } from '../components/GradientButton';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Partners } from '../components/Partners';
import { Testimonials } from '../components/Testimonials';
import { TransactionDrawer } from '../components/TransactionDrawer';
import { DeliveryInfoModal, DeliveryInfo } from '../components/DeliveryInfoModal';
import { LearnSection } from '../components/LearnSection';
import { packages, getPackageById } from '../data/packages';
import { useState, useEffect } from 'react';
import { user } from '../../lib/api';
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
}

export function Dashboard({ onNavigate, userName, onLogout, userStatus = 'active', selectedPackage = 'Basic Bundle', quantity = 1 }: DashboardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showTransactionDrawer, setShowTransactionDrawer] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
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
  const contributionHistory = Array.isArray(rawHistory) ? rawHistory : [];

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

  // Get the user's package
  const userPackage = packages.find(pkg => pkg.name === selectedPackage) || packages[0];
  
  const stats = dashboardStatsData?.data || {};

  // Use API stats if available, otherwise fallback to calculations or zero
  const totalContributed = stats.total_contributed ?? contributionHistory.reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0);
  const confirmedContributions = stats.contributions_count ?? contributionHistory.filter((c: any) => c.status === 'confirmed' || c.status === 'success').length;
  
  const progressPercent = (confirmedContributions / 12) * 100;
  const nextYear = new Date().getFullYear() + 1;
  const currentYear = new Date().getFullYear();
  
  // Package values
  const expectedTotal = userPackage.monthlyAmount * 12 * quantity;
  const currentValue = Math.round((userPackage.estimatedRetailValue * quantity / 12) * confirmedContributions);
  const projectedSavings = userPackage.savings * quantity;

  // Next Payment Info
  const isCompleted = confirmedContributions >= 12;
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
                You're all set for Detty December {nextYear}. We'll notify you when registration opens in January.
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
          <Partners variant="compact" />

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
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                Current Value: ₦{currentValue.toLocaleString()}
              </p>
            </div>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${userPackage.gradient} flex items-center justify-center shadow-lg ${userPackage.shadowColor}`}>
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${userPackage.gradient} rounded-full transition-all duration-500`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-gray-900">{confirmedContributions}/12</span>
          </div>
          
          <p className="text-xs text-gray-500 font-medium mb-3">
            {12 - confirmedContributions} months remaining until December
          </p>

          {/* Savings Preview */}
          <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Projected Savings</span>
              <span className="text-xl font-bold text-emerald-700">₦{projectedSavings.toLocaleString()}</span>
            </div>
          </div>
          
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
            className="group active:scale-95 transition-transform w-full"
          >
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${userPackage.gradient} mx-auto mb-3 flex items-center justify-center shadow-lg ${userPackage.shadowColor}`}>
                <Gift className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-gray-900 mb-1">View Package Details</p>
              <p className="text-sm text-gray-600">See your {userPackage.name} benefits</p>
            </Card>
          </button>
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
                      : `${nextPaymentMonth} ${currentYear} • ₦${(userPackage.monthlyAmount * quantity).toLocaleString()}`
                    }
                  </p>
                </div>
                <StatusBadge status={isCompleted ? 'success' : 'pending'} />
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Enable payment reminders</span>
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

              <button
                onClick={() => setShowDeliveryModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                <span className="font-semibold text-gray-700 text-sm">Update Delivery Info</span>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowDeliveryModal(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-white font-semibold"
            >
              <MapPin className="w-5 h-5" />
              Set Delivery Information
            </button>
          )}
        </Card>

        {/* Learn Section */}
        <LearnSection />

        {/* Testimonials Section - replacing Recent Activity */}
        <Testimonials />
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-white/80 backdrop-blur-xl border-t border-gray-200">
        <GradientButton onClick={() => onNavigate('contribute')}>
          Make Contribution
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
      />
    </div>
  );
}