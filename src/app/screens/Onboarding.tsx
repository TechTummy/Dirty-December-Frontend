import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { auth } from '../../lib/api';
import { GradientButton } from '../components/GradientButton';
import { Card } from '../components/Card';
import { LateJoinerModal } from '../components/LateJoinerModal';
import { PaystackModal } from '../components/PaystackModal';
import { User, CheckCircle, AlertCircle, Sparkles, ArrowLeft, Clock, Eye, EyeOff } from 'lucide-react';
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
  // Load initial state from localStorage if available
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('onboarding_state');
    return saved ? JSON.parse(saved).step : 1;
  });
  const [phone, setPhone] = useState(() => {
    const saved = localStorage.getItem('onboarding_state');
    return saved ? JSON.parse(saved).phone || '' : '';
  });
  const [otp, setOtp] = useState('');
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
  const [password, setPassword] = useState('');
  const [registrationToken, setRegistrationToken] = useState<string | null>(() => {
    const saved = localStorage.getItem('onboarding_state');
    return saved ? JSON.parse(saved).registrationToken || null : null;
  });
  const [showLateJoinerModal, setShowLateJoinerModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submittingAction, setSubmittingAction] = useState<'pay' | 'reserve' | null>(null);
  const [userChoice, setUserChoice] = useState<'catchup' | 'reserve' | null>(() => {
    const saved = localStorage.getItem('onboarding_state');
    return saved ? JSON.parse(saved).userChoice || null : null;
  });
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
  const [quantity, setQuantity] = useState(() => {
    const saved = localStorage.getItem('onboarding_state');
    return saved ? JSON.parse(saved).quantity || 1 : 1;
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const regStatus = getRegistrationStatus();
  const proportionalValue = calculateProportionalValue(regStatus.currentMonth);

  // Persistence Effect
  useEffect(() => {
    const stateToSave = {
      step,
      phone,
      name,
      email,
      userState,
      registrationToken,
      userChoice,
      selectedPackageId: selectedPackage?.id,
      quantity
    };
    localStorage.setItem('onboarding_state', JSON.stringify(stateToSave));
  }, [step, phone, name, email, userState, registrationToken, userChoice, selectedPackage, quantity]);

  const clearProgress = () => {
    localStorage.removeItem('onboarding_state');
    setStep(1);
    setPhone('');
    setOtp('');
    setRegistrationToken(null);
    setRegistrationToken(null);
    setSelectedPackageId(null);
    setUserChoice(null);
    setName('');
    setEmail('');
    setPassword('');
    setQuantity(1);
    toast.success('Progress cleared');
  };

  const handlePhoneSubmit = async () => {
    if (phone.length >= 10) {
      setIsLoading(true);
      try {
        await auth.sendOtp(phone);
        toast.success('OTP sent successfully');
        setStep(2);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to send OTP');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.length === 6) {
      setIsLoading(true);
      try {
        const response = await auth.verifyOtp(phone, otp);
        toast.success(response.message || 'Phone verified successfully');
        setRegistrationToken(response.data.registration_token);

        // Check if mid-cycle
        if (regStatus.isMidCycle && !userChoice) {
          setShowLateJoinerModal(true);
        } else {
          // If package is already pre-selected (from Landing), auto-select it via API then go to quantity
          if (selectedPackage || preSelectedPackageId) {
             const pkgIdToSelect = preSelectedPackageId || selectedPackage?.id;
             if (pkgIdToSelect) {
                try {
                   // Clean implementation: Call the API to select the package automatically
                   const numericId = parseInt(pkgIdToSelect, 10);
                   await auth.selectPackage(response.data.registration_token, numericId);
                   // Update token if response has a new one (though usually it's same session)
                   setStep(3.5);
                } catch (err) {
                   console.error("Auto-select package failed", err);
                   // Fallback: If auto-select fails, just show the selection screen
                   setStep(3); 
                }
             } else {
                setStep(3.5);
             }
          } else {
            setStep(3); // Go to package selection
          }
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to verify OTP');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCatchUp = () => {
    setUserChoice('catchup');
    setShowLateJoinerModal(false);
    // If package is already pre-selected, go to quantity selection
    if (selectedPackage) {
      setStep(3.5);
    } else {
      setStep(3);
    }
  };

  const handleReserveNextYear = () => {
    setUserChoice('reserve');
    setShowLateJoinerModal(false);
    // If reserved, skip quantity for now (or maybe keep it? assuming 1)
    // Going to step 4 (Profile) directly similar to original reserve flow logic
    if (selectedPackage) {
      setStep(4);
    } else {
      setStep(3);
    }
  };

  // Handle package selection
  const handlePackageSelect = async (pkg: Package) => {
    // Only call API if we have a registration token
    if (registrationToken) {
      setIsLoading(true);
      try {
        // Map frontend string IDs to backend integer IDs
        const packageId = parseInt(pkg.id, 10); // Backend ID is stringified in packageUtils, parse back to int
        const response = await auth.selectPackage(registrationToken, packageId);
        toast.success(response.message || 'Package selected successfully');
        
        if (response.data?.registration_token) {
           setRegistrationToken(response.data.registration_token);
        }
        setSelectedPackageId(pkg.id);
        setStep(3.5); // Go to quantity selection instead of profile
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to select package');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    } else {
       // Fallback for non-API flow or if token missing (shouldn't happen in normal flow)
       setSelectedPackageId(pkg.id);
       setStep(3.5); 
    }
  };

  const handleProfileSubmit = async (action: 'pay' | 'reserve' = 'pay') => {
    if (name.trim() && email.trim() && password.length >= 6 && userState) {
       if (registrationToken) {
         setSubmittingAction(action);
         setIsLoading(true);
         try {
           if (action === 'reserve') {
             // Use makeReservation endpoint for reservation flow
             const response = await auth.makeReservation({
               registration_token: registrationToken,
               name,
               phone, 
               email,
               password,
               state: userState
             });
             
             if (response.data?.token) {
               localStorage.setItem('auth_token', response.data.token);
               localStorage.setItem('user_data', JSON.stringify(response.data.user));
             }
             
             toast.success('Spot reserved successfully! We will notify you when payment opens.');
             localStorage.removeItem('onboarding_state'); // Clear persistence on success
             onComplete('reserved', selectedPackage?.name, quantity);
           } else {
             // Standard registration flow - REGISTER FIRST
             // We must create the user account BEFORE initiating payment
             const response = await auth.completeRegistration({
               registration_token: registrationToken,
               name,
               phone, 
               email,
               password,
               state: userState
             });
             
             // Save auth token and user data immediately
             // This is crucial: Payment endpoints need this token
             if (response.data?.token) {
               localStorage.setItem('auth_token', response.data.token);
               localStorage.setItem('user_data', JSON.stringify(response.data.user));
             }

             if (userChoice === 'reserve') {
               toast.success('Registration completed successfully!');
               localStorage.removeItem('onboarding_state'); // Clear persistence on success
               onComplete('reserved', selectedPackage?.name, quantity);
             } else {
               // Registration successful! Now show payment modal
               // The PaystackModal will use the token we just saved to initialize the transaction
               toast.success('Registration successful! Please complete your payment.');
               setShowPaymentModal(true);
             }
           }
         } catch (error: any) {
           // Check for validation errors object
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
       } else {
         // Fallback/Legacy flow (should strictly not happen if flows are correct)
         toast.error("Registration session expired. Please start again.");
         setStep(1);
       }
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    toast.success('Payment successful! Welcome to Belleza Detty December.');
    localStorage.removeItem('onboarding_state'); // Clear persistence on success
    
    // Refresh user state to ensure status is updated to 'active'
    // This will happen automatically when App.tsx detects route change or we can force it if needed
    // But mainly we just complete the flow
    onComplete('active', selectedPackage?.name, quantity);
  };

  // Back handler
  const handleBack = () => {
    if (step === 1) {
      // Go back to landing
      onBack?.();
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    } else if (step === 3.5) {
      // Go back to package selection if not pre-selected
      if (preSelectedPackageId) {
        setStep(2);
      } else {
        setStep(3);
      }
    } else if (step === 4) {
      // Go back to quantity selection (except for reserved users who skipped it?)
      if (userChoice === 'reserve') {
         // Reserved users skipped quantity (went 3 -> 4 or 3.5 -> 4 logic might differ)
         // In handleReserveNextYear we go 3 -> 4. So back is 3.
         setStep(3);
      } else {
         setStep(3.5);
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
          {[1, 2, 3, 4].map((i) => (
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
                  {regStatus.message} You'll be able to choose after verification.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Step 1: Phone Number */}
        {step === 1 && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Enter Your Phone
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We'll send you a verification code to confirm your number
              </p>
            </div>

            <Card className="mb-6 border-0 shadow-lg">
              <label className="block mb-3 text-sm font-semibold text-gray-900">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="080 XXXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-lg"
                maxLength={11}
              />
            </Card>

            <div className="flex flex-col gap-3">
              <GradientButton onClick={handlePhoneSubmit} disabled={phone.length < 10 || isLoading}>
                {isLoading ? 'Sending Code...' : 'Continue'}
              </GradientButton>
              
              {/* Option to clear progress if user wants to start fresh (e.g. wrong number) */}
              {localStorage.getItem('onboarding_state') && (
                 <button 
                   onClick={clearProgress}
                   className="text-sm text-gray-500 hover:text-red-500 transition-colors py-2"
                 >
                   Start Over (Clear Progress)
                 </button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Verify Your Number
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Enter the 6-digit code sent to <span className="font-semibold text-gray-900">{phone}</span>
              </p>
            </div>

            <Card className="mb-6 border-0 shadow-lg">
              <label className="block mb-3 text-sm font-semibold text-gray-900">
                Verification Code
              </label>
              <input
                type="text"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none text-center text-3xl tracking-[0.5em] font-bold transition-all"
                maxLength={6}
              />
              <button className="w-full text-sm text-purple-600 font-semibold mt-4 hover:text-purple-700">
                Resend Code
              </button>
            </Card>

            <GradientButton onClick={handleOtpSubmit} disabled={otp.length !== 6 || isLoading}>
              {isLoading ? 'Verifying...' : 'Verify'}
            </GradientButton>
          </div>
        )}

        {/* Step 3: Package Selection */}
        {step === 3 && (
          <div>
            {userChoice === 'reserve' ? (
              /* Reserved - Skip to profile */
              <div className="text-center">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-400 to-slate-500 mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-slate-500/40">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Spot Reserved!
                </h2>
                <p className="text-gray-600 leading-relaxed mb-8 max-w-sm mx-auto">
                  You're all set for Belleza Detty December {new Date().getFullYear() + 1}. 
                  We'll remind you when registration opens in January.
                </p>
                
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
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                  />
                </Card>

                <GradientButton onClick={() => handleProfileSubmit('reserve')} disabled={!name.trim() || !email.trim() || password.length < 6 || isLoading}>
                  Complete Registration
                </GradientButton>
              </div>
            ) : (
              /* Package Selection */
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
                  {isPackagesLoading && !backendPackages ? (
                    <div className="text-center py-10">
                      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-gray-500 text-sm">Loading packages...</p>
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
                        {/* Badge */}
                        {pkg.badge && (
                          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${pkg.gradient} text-white shadow-lg ${pkg.shadowColor}`}>
                            {pkg.badge}
                          </div>
                        )}

                        {/* Package Header */}
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
                          
                          <div className="bg-white/20 backdrop-blur rounded-xl p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white/90">Benefit Package Worth</span>
                              <span className="font-bold text-xl">₦{pkg.estimatedRetailValue.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Benefits */}
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
                  )))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3.5: Quantity Selection */}
        {step === 3.5 && selectedPackage && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                How Many Slots?
              </h2>
              <p className="text-gray-600 leading-relaxed">
        Contributing for yourself and others? Select how many slots you will be paying for              </p>
            </div>

            {/* Selected Package Summary */}
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
                  onClick={() => setStep(3)}
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

            {/* Quantity Selector */}
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
                    You're paying for {quantity} {quantity === 1 ? 'slot' : 'slots'}. Each slot will receive the same package content  in December.
                  </p>
                </div>
              )}
            </Card>

            {/* Total Payment Summary */}
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
              onClick={async () => {
                if (registrationToken) {
                  setIsLoading(true);
                  try {
                    await auth.selectSlot(registrationToken, quantity);
                    setStep(4);
                  } catch (error: any) {
                    toast.error(error.response?.data?.message || 'Failed to select slots');
                    console.error(error);
                  } finally {
                    setIsLoading(false);
                  }
                } else {
                  setStep(4);
                }
              }} 
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Continue to Profile'}
            </GradientButton>
          </div>
        )}

        {/* Step 4: Profile Setup */}
        {step === 4 && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Complete Your Profile
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

            {userChoice === 'catchup' ? (
              /* Catch-Up Summary */
              <Card className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">Catch-Up Payment Required</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Past months owed</span>
                    <span className="font-bold text-gray-900">{regStatus.monthsOwed} months</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Selected Package</span>
                    <span className="font-bold text-gray-900">{selectedPackage?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Slots</span>
                    <span className="font-bold text-gray-900">{quantity} {quantity === 1 ? 'person' : 'people'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Monthly Amount per slot</span>
                    <span className="font-bold text-gray-900">₦{selectedPackage?.monthlyAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Total Monthly Payment</span>
                    <span className="font-bold text-gray-900">{((selectedPackage?.monthlyAmount || 5000) * quantity).toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Total catch-up amount</span>
                    <span className="text-xl font-bold text-gray-900">₦{((selectedPackage?.monthlyAmount || 5000) * quantity * regStatus.monthsOwed).toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            ) : selectedPackage ? (
              /* Selected Package Summary */
              <Card className={`mb-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-purple-200`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedPackage.gradient} flex items-center justify-center shadow-lg ${selectedPackage.shadowColor}`}>
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedPackage.name}</h3>
                    <p className="text-xs text-gray-600">{selectedPackage.description}</p>
                  </div>
                </div>
                
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
            ) : (
              /* Fallback - Normal Savings Plan */
              <Card className="mb-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">Your Savings Plan</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Monthly Payment</span>
                    <span className="font-bold text-gray-900">₦5,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Total per Year</span>
                    <span className="font-bold text-gray-900">₦60,000</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900">Package Value</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      ₦85,700
                    </span>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex flex-col gap-3">
              <GradientButton 
                onClick={() => handleProfileSubmit('pay')} 
                disabled={!name.trim() || !email.trim() || password.length < 6 || !userState || isLoading}
              >
                {userChoice === 'catchup' ? 'Continue to Payment' : (submittingAction === 'pay' ? 'Creating Account...' : 'Start Contributing')}
              </GradientButton>
              
              {!userChoice && (
                <button 
                  onClick={() => handleProfileSubmit('reserve')}
                  disabled={!name.trim() || !email.trim() || password.length < 6 || !userState || isLoading}
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