import { useState } from 'react';
import { toast } from 'sonner';
import { auth } from '../../lib/api';
import { GradientButton } from '../components/GradientButton';
import { Card } from '../components/Card';
import { LateJoinerModal } from '../components/LateJoinerModal';
import { User, CheckCircle, AlertCircle, Check, Sparkles, ArrowLeft } from 'lucide-react';
import { getRegistrationStatus, calculateProportionalValue } from '../utils/registrationLogic';
import { packages, Package } from '../data/packages';

interface OnboardingProps {
  onComplete: (userStatus?: 'active' | 'reserved', selectedPackage?: string) => void;
  preSelectedPackageId?: string | null;
  onBack?: () => void;
}

export function Onboarding({ onComplete, preSelectedPackageId, onBack }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const [showLateJoinerModal, setShowLateJoinerModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userChoice, setUserChoice] = useState<'catchup' | 'reserve' | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(
    preSelectedPackageId ? packages.find(pkg => pkg.id === preSelectedPackageId) || null : null
  );
  
  const regStatus = getRegistrationStatus();
  const proportionalValue = calculateProportionalValue(regStatus.currentMonth);

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
          // If package is already pre-selected, skip to profile
          if (selectedPackage) {
            setStep(4);
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
    // If package is already pre-selected, skip to profile
    if (selectedPackage) {
      setStep(4);
    } else {
      setStep(3); // Go to package selection
    }
  };

  const handleReserveNextYear = () => {
    setUserChoice('reserve');
    setShowLateJoinerModal(false);
    // If package is already pre-selected, skip to profile
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
        const packageIdMap: Record<string, number> = {
          'basic': 1,
          'family': 2,
          'premium': 3
        };
        const packageId = packageIdMap[pkg.id] || 1; // Default to 1 if not found 
        const response = await auth.selectPackage(registrationToken, packageId);
        toast.success(response.message || 'Package selected successfully');
        // Update token if response provides a new one (API response shows it returns one)
        if (response.data?.registration_token) {
           setRegistrationToken(response.data.registration_token);
        }
        setSelectedPackage(pkg);
        setStep(4);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to select package');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    } else {
       // Fallback for non-API flow or if token missing (shouldn't happen in normal flow)
       setSelectedPackage(pkg);
       setStep(4); 
    }
  };

  const handleProfileSubmit = async () => {
    if (name.trim() && email.trim() && password.length >= 6) {
       if (registrationToken) {
         setIsLoading(true);
         try {
           await auth.completeRegistration({
             registration_token: registrationToken,
             name,
             phone, // from state
             email,
             password
           });
           toast.success('Registration completed successfully!');
           onComplete(userChoice === 'reserve' ? 'reserved' : 'active', selectedPackage?.name);
         } catch (error: any) {
           toast.error(error.response?.data?.message || 'Failed to complete registration');
           console.error(error);
         } finally {
           setIsLoading(false);
         }
       } else {
         // Fallback/Legacy flow
         onComplete(userChoice === 'reserve' ? 'reserved' : 'active', selectedPackage?.name);
       }
    }
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
    } else if (step === 4) {
      // If package was pre-selected, go back to step 2 (OTP)
      if (preSelectedPackageId) {
        setStep(2);
      } else {
        setStep(3); // Otherwise go back to package selection
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

            <GradientButton onClick={handlePhoneSubmit} disabled={phone.length < 10 || isLoading}>
              {isLoading ? 'Sending Code...' : 'Continue'}
            </GradientButton>
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
                  You're all set for Detty December {new Date().getFullYear() + 1}. 
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

                <GradientButton onClick={handleProfileSubmit} disabled={!name.trim() || !email.trim() || password.length < 6}>
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
                  {packages.map((pkg) => (
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
                          
                          <div className="mb-2">
                            <span className="text-sm text-white/80 block mb-1">Total Yearly Contribution</span>
                            <div className="flex items-end gap-2 mb-1">
                              <span className="text-4xl font-bold">₦{pkg.yearlyTotal.toLocaleString()}</span>
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
                          {pkg.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${pkg.gradient} flex items-center justify-center flex-shrink-0`}>
                                <Check className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>

                        {/* Savings Highlight */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 -mx-6 px-6 -mb-6 pb-6 bg-emerald-50">
                          <span className="text-sm text-emerald-900 font-medium">You Save</span>
                          <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            ₦{pkg.savings.toLocaleString()} ({pkg.savingsPercent}%)
                          </span>
                        </div>
                      </Card>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                    <span className="text-sm text-gray-600 font-medium">Monthly Amount</span>
                    <span className="font-bold text-gray-900">₦{selectedPackage?.monthlyAmount.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Total catch-up amount</span>
                    <span className="text-xl font-bold text-gray-900">₦{((selectedPackage?.monthlyAmount || 5000) * regStatus.monthsOwed).toLocaleString()}</span>
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
                    <span className="text-sm text-gray-600 font-medium">Monthly Payment</span>
                    <span className="font-bold text-gray-900">₦{selectedPackage.monthlyAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Total per Year</span>
                    <span className="font-bold text-gray-900">₦{selectedPackage.yearlyTotal.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900">Package Value</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      ₦{selectedPackage.estimatedRetailValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900">Total Savings</span>
                    <span className="text-xl font-bold text-purple-700">
                      ₦{selectedPackage.savings.toLocaleString()}
                    </span>
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

            <GradientButton onClick={handleProfileSubmit} disabled={!name.trim() || !email.trim() || password.length < 6 || isLoading}>
              {userChoice === 'catchup' ? 'Continue to Payment' : (isLoading ? 'Creating Account...' : 'Start Contributing')}
            </GradientButton>
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
    </div>
  );
}