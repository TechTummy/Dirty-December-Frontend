import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { auth } from '../../lib/api';
import { GradientButton } from '../components/GradientButton';
import { Card } from '../components/Card';
import { LateJoinerModal } from '../components/LateJoinerModal';
import { PaystackModal } from '../components/PaystackModal';
import { User, CheckCircle, AlertCircle, Sparkles, ArrowLeft, Clock, Eye, EyeOff, X, CreditCard, LayoutDashboard } from 'lucide-react';
import { getRegistrationStatus, calculateProportionalValue } from '../utils/registrationLogic';
import { Package } from '../data/packages';
import { useQuery } from '@tanstack/react-query';
import { mergeBackendPackages } from '../utils/packageUtils';

interface OnboardingProps {
  onComplete: (userStatus?: 'active' | 'reserved', selectedPackage?: string, quantity?: number) => void;
  preSelectedPackageId?: string | null;
  onBack?: () => void;
}

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

export function Onboarding({ onComplete, preSelectedPackageId, onBack }: OnboardingProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(() => {
    if (preSelectedPackageId) return preSelectedPackageId;
    const saved = localStorage.getItem('onboarding_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.selectedPackageId || null;
    }
    return null;
  });

  const { data: backendPackages, isLoading: isPackagesLoading } = useQuery({
    queryKey: ['public-packages'],
    queryFn: auth.getPackages,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  const displayPackages = mergeBackendPackages(backendPackages?.data?.packages || []);
  const selectedPackage = displayPackages.find(pkg => pkg.id === selectedPackageId) || null;

  // Initial step depends on if package is selected
  // If package is pre-selected (from Landing), we force Step 2 (Quantity) to skip selection
  // This takes precedence over localStorage to ensure user intent from Landing is respected
  const [step, setStep] = useState(() => {
    if (preSelectedPackageId) return 2;
    
    const saved = localStorage.getItem('onboarding_state');
    if (saved) return JSON.parse(saved).step;
    
    return 1;
  });

  const [quantity, setQuantity] = useState(() => {
    const saved = localStorage.getItem('onboarding_state');
    return saved ? JSON.parse(saved).quantity || 1 : 1;
  });

  // Consolidated User Info State
  const [phone, setPhone] = useState(() => {
    const saved = localStorage.getItem('onboarding_state');
    return saved ? JSON.parse(saved).phone || '' : '';
  });
  const [name, setName] = useState(() => {
    const saved = localStorage.getItem('onboarding_state');
    return saved ? JSON.parse(saved).name || '' : '';
  });
  const [email, setEmail] = useState(() => {
    const saved = localStorage.getItem('onboarding_state');
    return saved ? JSON.parse(saved).email || '' : '';
  });
  const [userState, setUserState] = useState(() => {
    const saved = localStorage.getItem('onboarding_state');
    return saved ? JSON.parse(saved).userState || '' : '';
  });
  // Password is mostly not saved in local storage for security, or we can if UX demands it (skipping for now)
  const [password, setPassword] = useState('');
  
  const [showLateJoinerModal, setShowLateJoinerModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submittingAction, setSubmittingAction] = useState<'pay-now' | 'pay-later' | 'reserve' | null>(null);
  
  const [userChoice, setUserChoice] = useState<'catchup' | 'reserve' | null>(() => {
    const saved = localStorage.getItem('onboarding_state');
    return saved ? JSON.parse(saved).userChoice || null : null;
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentChoiceModal, setShowPaymentChoiceModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const isCompletedRef = useRef(false);

  const regStatus = getRegistrationStatus();
  const proportionalValue = calculateProportionalValue(regStatus.currentMonth);

  // Persistence Effect
  useEffect(() => {
    if (isCompletedRef.current) return;
    
    const stateToSave = {
      step,
      phone,
      name,
      email,
      userState,
      userChoice,
      selectedPackageId: selectedPackage?.id,
      quantity
    };
    localStorage.setItem('onboarding_state', JSON.stringify(stateToSave));
  }, [step, phone, name, email, userState, userChoice, selectedPackage, quantity]);

  // Check mid-cycle status on mount (only if Step 1 and not already chosen)
  useEffect(() => {
    if (regStatus.isMidCycle && !userChoice && step === 1 && !preSelectedPackageId) {
      // If we are showing package list, show late joiner modal
      setShowLateJoinerModal(true);
    }
  }, [regStatus.isMidCycle, userChoice, step, preSelectedPackageId]);

  const clearProgress = () => {
    localStorage.removeItem('onboarding_state');
    // If pre-selected, go to Step 2, else Step 1
    setStep(preSelectedPackageId ? 2 : 1);
    
    if (!preSelectedPackageId) setSelectedPackageId(null);
    setPhone('');
    setUserChoice(null);
    setName('');
    setEmail('');
    setPassword('');
    setQuantity(1);
    toast.success('Progress cleared');
  };

  const handleCatchUp = () => {
    setUserChoice('catchup');
    setShowLateJoinerModal(false);
  };

  const handleReserveNextYear = () => {
    setUserChoice('reserve');
    setShowLateJoinerModal(false);
    // If reserved, we might skip quantity or keep it. 
    // Usually reserve -> Profile directly?
    // Let's go to Profile (Step 3) directly if they choose reserve
    setStep(3); 
  };

  // Handle package selection (Step 1 -> Step 2)
  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackageId(pkg.id);
    setStep(2); // Go to quantity
  };

  // Handle quantity selection (Step 2 -> Step 3)
  const handleQuantitySelect = () => {
    setStep(3); // Go to profile
  };

  const handleProfileSubmit = async (action: 'pay' | 'reserve' = 'pay', payImmediately: boolean = true) => {
    // Validation
    if (!name.trim() || !email.trim() || password.length < 6 || !userState || !phone.trim()) {
        toast.error('Please fill in all required fields');
        return;
    }

    // Strict Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
        toast.error('Please enter a valid email address');
        return;
    }

    // Strict Phone Validation (Nigerian Format)
    // Matches: 08012345678, 2348012345678, +2348012345678
    const phoneRegex = /^(0|234|\+234)(7|8|9)(0|1)\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        toast.error('Please enter a valid Nigerian phone number');
        return;
    }

    setSubmittingAction(action === 'reserve' ? 'reserve' : (payImmediately ? 'pay-now' : 'pay-later'));
    setIsLoading(true);

    try {
        if (action === 'reserve') {
            // Reserve Flow
             const response = await auth.makeReservation({
               name,
               phone, 
               email,
               password,
               state: userState
             });
             
             if (response.data?.token) {
               localStorage.setItem('auth_token', response.data.token);
               localStorage.setItem('user_data', JSON.stringify(response.data.user));
               
               // Also select the package/slots for the reservation? 
               // The backend `makeReservation` might assume a package, or we need to call `selectPackage` too.
               // Assuming new flow requires explicit package selection after creation/reservation.
               const numericPkgId = parseInt(selectedPackage!.id, 10);
               await auth.selectPackage(numericPkgId, quantity);
             }
             
             toast.success('Spot reserved successfully! We will notify you when payment opens.');
             isCompletedRef.current = true;
             localStorage.removeItem('onboarding_state');
             onComplete('reserved', selectedPackage?.name, quantity);

        } else {
            // Registration Flow
            // 1. Create Account
            const response = await auth.completeRegistration({
               name,
               phone, 
               email,
               password,
               state: userState
            });

            if (response.data?.token) {
               localStorage.setItem('auth_token', response.data.token);
               localStorage.setItem('user_data', JSON.stringify(response.data.user));
               
               // 2. Select Package & Slots
               const numericPkgId = parseInt(selectedPackage!.id, 10);
               await auth.selectPackage(numericPkgId, quantity); // Now passing slots
               
               // Success
               isCompletedRef.current = true; 
               localStorage.removeItem('onboarding_state');

               if (userChoice === 'reserve') {
                   // Should catch this branch earlier if reusing logic, but safety check
                   onComplete('reserved', selectedPackage?.name, quantity);
               } else {
                   setShowPaymentChoiceModal(false);
                   
                   if (payImmediately) {
                       toast.success('Registration successful! Please complete your payment.');
                       setShowPaymentModal(true);
                   } else {
                       toast.success('Registration successful!');
                       onComplete('active', selectedPackage?.name, quantity);
                   }
               }
            }
        }
    } catch (error: any) {
        // Handle Validation Errors
        if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            const firstField = Object.keys(errors)[0];
            const firstError = errors[firstField][0];
            toast.error(firstError || 'Validation failed');
        } else {
            toast.error(error.response?.data?.message || 'Failed to complete registration');
        }
        console.error(error);
    } finally {
        setIsLoading(false);
        setSubmittingAction(null);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    toast.success('Payment successful! Welcome to Belleza Detty December.');
    localStorage.removeItem('onboarding_state'); 
    onComplete('active', selectedPackage?.name, quantity);
  };

  const handleBack = () => {
    if (step === 1) {
       onBack?.();
    } else if (step === 2) {
       // If pre-selected, go back to landing/previous
       if (preSelectedPackageId) {
           onBack?.();
       } else {
           setStep(1);
       }
    } else if (step === 3) {
       // Back to quantity
       // If reserved flow skipped quantity? 
       if (userChoice === 'reserve') {
          // If came from reserve button in modal? 
          // Logic: If reserve next year -> Step 3. Back should go to Step where they made choice?
          // Simplification: go to Step 2 (Quantity) or Step 1 (Package)
          // If reserved, we skipped Step 2? In `handleReserveNextYear` we set Step 3.
          // Let's assume they might want to change package?
          setStep(selectedPackage ? 2 : 1);
       } else {
          setStep(2);
       }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-6 pt-12 pb-24">
        {/* Back Button */}
        {(step > 1 || onBack) && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        )}

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-12">
          {/* 3 Steps Total now */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                step >= i
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                  : 'bg-gray-200'
              }`}
            ></div>
          ))}
        </div>

        {/* Mid-cycle alert banner */}
        {regStatus.isMidCycle && step === 1 && (
          <Card className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">Registration Period Closed</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {regStatus.message} You'll be able to choose after selection.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Step 1: Package Selection */}
        {step === 1 && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Choose Your Package
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Select a savings plan that works best for you
              </p>
            </div>

            <div className="space-y-4">
              {isPackagesLoading ? (
                <div className="text-center py-10">
                  <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Loading packages...</p>
                </div>
              ) : (!displayPackages || displayPackages.length === 0) ? (
                <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-gray-300">
                   <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <EyeOff className="w-6 h-6 text-gray-400" />
                   </div>
                   <h3 className="text-lg font-semibold text-gray-900 mb-1">No Packages Available</h3>
                   <p className="text-sm text-gray-500">We couldn't find any active savings packages at the moment.</p>
                   <button 
                     onClick={() => window.location.reload()}
                     className="mt-4 text-purple-600 font-medium text-sm hover:underline"
                   >
                     Reload Page
                   </button>
                </div>
              ) : (
                displayPackages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => handlePackageSelect(pkg)}
                  disabled={isLoading}
                  className="w-full text-left active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
                    {pkg.badge && (
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${pkg.gradient} text-white shadow-lg ${pkg.shadowColor}`}>
                        {pkg.badge}
                      </div>
                    )}
                    <div className={`bg-gradient-to-br ${pkg.gradient} -m-6 p-6 text-white mb-4 rounded-t-2xl`}>
                      <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
                      <p className="text-white/90 text-sm mb-4">{pkg.description}</p>
                      
                      <div className="mb-3">
                        <span className="text-sm text-white/80 block mb-1">Monthly Contribution</span>
                        <div className="flex items-end gap-2 mb-1">
                          <span className="text-4xl font-bold">₦{pkg.monthlyAmount.toLocaleString()}</span>
                          <span className="text-white/80 pb-1">/month</span>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <span className="text-sm text-white/80 block mb-1">Total Yearly Contribution</span>
                        <div className="flex items-end gap-2 mb-1">
                          <span className="text-2xl font-bold">₦{pkg.yearlyTotal.toLocaleString()}</span>
                          <span className="text-white/80 pb-1">/year</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 mb-4">
                      {pkg.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${pkg.gradient} flex items-center justify-center flex-shrink-0`}>
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </button>
              )))
              }
            </div>
          </div>
        )}

        {/* Step 2: Quantity Selection */}
        {step === 2 && selectedPackage && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                How Many Slots?
              </h2>
              <p className="text-gray-600 leading-relaxed">
                 Contributing for yourself and others? Select how many slots you will be paying for
              </p>
            </div>

            <Card className={`mb-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-purple-200`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedPackage.gradient} flex items-center justify-center shadow-lg ${selectedPackage.shadowColor}`}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{selectedPackage.name}</h3>
                  <p className="text-xs text-gray-600">{selectedPackage.description}</p>
                </div>
                <button 
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 bg-white/50 px-2 py-1 rounded-lg border border-purple-100"
                >
                  Change
                </button>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Per person/month</span>
                <span className="font-bold text-gray-900">₦{selectedPackage.monthlyAmount.toLocaleString()}</span>
              </div>
            </Card>

            <Card className="mb-6 border-0 shadow-lg">
              <label className="block mb-4 text-sm font-semibold text-gray-900">
                Number of Slots
              </label>
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuantity(num)}
                    className={`h-14 rounded-xl font-bold text-lg transition-all ${
                      quantity === num
                        ? `bg-gradient-to-br ${selectedPackage.gradient} text-white shadow-lg ${selectedPackage.shadowColor}`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              
              {quantity > 1 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-900 mb-2">
                    <span className="font-semibold">Contributing for {quantity} {quantity === 1 ? 'slot' : 'slots'}</span>
                  </p>
                  <p className="text-xs text-blue-700">
                    You're paying for {quantity} {quantity === 1 ? 'slot' : 'slots'}. Each slot will receive the same package content in December.
                  </p>
                </div>
              )}
            </Card>

            <Card className="mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Monthly Payment per slot</span>
                  <span className="font-bold text-gray-900">₦{selectedPackage.monthlyAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Number of Slots</span>
                  <span className="font-bold text-gray-900">{quantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">Total Monthly Payment</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ₦{(selectedPackage.monthlyAmount * quantity).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Total per Year</span>
                  <span className="font-bold text-gray-900">₦{(selectedPackage.yearlyTotal * quantity).toLocaleString()}</span>
                </div>              
              </div>
            </Card>

            <GradientButton 
              onClick={handleQuantitySelect} 
              disabled={isLoading}
            >
              Continue to details
            </GradientButton>
          </div>
        )}

        {/* Step 3: Profile Setup */}
        {step === 3 && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {userChoice === 'reserve' ? 'Reserve Your Spot' : 'Complete Your Profile'}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Just a few more details to get you started
              </p>
            </div>

            <div className="flex justify-center mb-8">
               <div className="relative">
                 <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/40">
                   <User className="w-12 h-12 text-white" />
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-slate-50 shadow-lg">
                   <CheckCircle className="w-5 h-5 text-white" />
                 </div>
               </div>
             </div>

             <Card className="mb-6 border-0 shadow-lg">
               <label className="block mb-3 text-sm font-semibold text-gray-900">
                 Full Name
               </label>
               <input
                 type="text"
                 placeholder="Enter your full name"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
               />
             </Card>

             <Card className="mb-6 border-0 shadow-lg">
               <label className="block mb-3 text-sm font-semibold text-gray-900">
                 Email Address
               </label>
               <input
                 type="email"
                 placeholder="Enter your email address"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
               />
             </Card>

             <Card className="mb-6 border-0 shadow-lg">
               <label className="block mb-3 text-sm font-semibold text-gray-900">
                 Phone Number
               </label>
               <input
                 type="tel"
                 placeholder="080 1234 5678"
                 value={phone}
                 onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                 className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                 maxLength={13}
               />
             </Card>

             <Card className="mb-6 border-0 shadow-lg">
               <label className="block mb-3 text-sm font-semibold text-gray-900">
                 State of Residence
               </label>
               <div className="relative">
                 <select
                   value={userState}
                   onChange={(e) => setUserState(e.target.value)}
                   className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all cursor-pointer appearance-none bg-white"
                 >
                   <option value="">Select your state</option>
                   {nigerianStates.map(state => (
                     <option key={state} value={state}>{state}</option>
                   ))}
                 </select>
                 <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none">
                   <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                   </svg>
                 </div>
               </div>
             </Card>

             <Card className="mb-6 border-0 shadow-lg">
               <label className="block mb-3 text-sm font-semibold text-gray-900">
                 Password
               </label>
               <div className="relative">
                 <input
                   type={showPassword ? "text" : "password"}
                   placeholder="Enter your password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all pr-12"
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   {showPassword ? (
                     <EyeOff className="w-5 h-5" />
                   ) : (
                     <Eye className="w-5 h-5" />
                   )}
                 </button>
               </div>
             </Card>

             {/* Summary before submit */}
             {selectedPackage && (
               <div className="mb-6 p-4 bg-purple-50 rounded-xl flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Registering for <span className="font-bold text-gray-900">{selectedPackage.name}</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    {quantity} {quantity === 1 ? 'Slot' : 'Slots'}
                  </div>
               </div>
             )}

             <div className="flex flex-col gap-3">
               <GradientButton 
                 onClick={() => {
                   if (userChoice === 'catchup') {
                     // Catchup always goes to payment
                     handleProfileSubmit('pay', true);
                   } else {
                     // Normal flow opens choice modal
                     // But first we should actually validate and submitting to backend?
                     // No, current logic is: Profile -> Choice Modal -> Submit Action(Pay/Dashboard).
                     // However, "Start Contributing" implies we are done with form.
                     // The requirement is: Account Creation -> Package Selection -> Payment.
                     // So when they click "Start Contributing", we should open the modal IF standard flow.
                     // BUT we must validate form first!
                     if (!name.trim() || !email.trim() || password.length < 6 || !userState || !phone.trim()) {
                        toast.error('Please fill in all required fields');
                        return;
                     }
                     setShowPaymentChoiceModal(true);
                   }
                 }} 
                 disabled={!name.trim() || !email.trim() || password.length < 6 || !userState || !phone || isLoading}
                 className={new Date().getMonth() >= 7 ? 'hidden' : ''}
               >
                 {userChoice === 'catchup' ? 'Continue to Payment' : (submittingAction === 'pay-now' ? 'Processing...' : 'Start Contributing')}
               </GradientButton>
               
               {!userChoice && (
                 <button 
                   onClick={() => handleProfileSubmit('reserve')}
                   disabled={!name.trim() || !email.trim() || password.length < 6 || !userState || !phone || isLoading}
                   className="w-full py-4 text-purple-700 font-semibold bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {submittingAction === 'reserve' ? (
                     <>
                       <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                       Reserving Spot...
                     </>
                   ) : (
                     <>
                       <Clock className="w-5 h-5" />
                       Reserve Spot (Pay Later)
                     </>
                   )}
                 </button>
               )}
             </div>
          </div>
        )}
      </div>

      {/* Late Joiner Modal */}
      {showLateJoinerModal && (
        <LateJoinerModal
          monthsOwed={regStatus.monthsOwed}
          totalOwed={regStatus.totalOwed}
          currentMonth={regStatus.currentMonth}
          estimatedValue={proportionalValue.estimatedValue}
          onCatchUp={handleCatchUp}
          onReserveNextYear={handleReserveNextYear}
          onClose={() => setShowLateJoinerModal(false)}
        />
      )}

      {/* Payment Choice Modal */}
      {showPaymentChoiceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Sparkles className="w-6 h-6 text-white" />
                 </div>
                 <button 
                   onClick={() => setShowPaymentChoiceModal(false)}
                   className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                 >
                   <X className="w-5 h-5 text-gray-400" />
                 </button>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Registration</h3>
              <p className="text-gray-600 mb-8">
                You're all set! Would you like to make your first contribution now or head to your dashboard?
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleProfileSubmit('pay', true)}
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {submittingAction === 'pay-now' && isLoading ? (
                    'Processing...'
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Make Payment Now
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleProfileSubmit('pay', false)}
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-white border-2 border-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {submittingAction === 'pay-later' && isLoading ? (
                    'Processing...'
                  ) : (
                    <>
                      <LayoutDashboard className="w-5 h-5 text-gray-500" />
                      Continue to Dashboard
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                You can always contribute later from your dashboard
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Paystack Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <PaystackModal
          amount={selectedPackage.monthlyAmount * quantity}
          email={email}
          packageName={selectedPackage.name}
          quantity={quantity}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}