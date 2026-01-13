import { useState } from 'react';
import { ArrowLeft, Phone, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '../../lib/api';
import { GradientButton } from '../components/GradientButton';
import { Card } from '../components/Card';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
  onPasswordReset: () => void;
}

type Step = 'identify' | 'verify' | 'reset' | 'success';

export function ForgotPassword({ onBackToLogin, onPasswordReset }: ForgotPasswordProps) {
  const [step, setStep] = useState<Step>('identify');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      // API call to send OTP
      const response = await auth.forgotPassword(phoneNumber);
      toast.success(response.message || 'OTP sent successfully');
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerificationCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setError('Please enter the complete verification code');
      return;
    }

    // For this flow, we don't verify OTP independently, we verify it during reset.
    // So just move to next step to collect password.
    setStep('reset');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await auth.resetPassword({
        identifier: phoneNumber,
        code: verificationCode.join(''),
        password: newPassword,
        password_confirmation: confirmPassword
      });
      toast.success('Password reset successfully');
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await auth.forgotPassword(phoneNumber);
      toast.success('OTP resent successfully');
      setVerificationCode(['', '', '', '', '', '']);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <button
          onClick={onBackToLogin}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Login</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {step === 'identify' && 'Reset Password'}
              {step === 'verify' && 'Verify Code'}
              {step === 'reset' && 'New Password'}
              {step === 'success' && 'All Set!'}
            </span>
          </h1>
          <p className="text-gray-600 leading-relaxed">
            {step === 'identify' && "We'll send you a verification code"}
            {step === 'verify' && `Code sent to ${phoneNumber}`}
            {step === 'reset' && 'Create a strong password'}
            {step === 'success' && 'Your password has been reset'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-32">
        {/* Step 1: Identify User */}
        {step === 'identify' && (
          <form onSubmit={handleIdentify}>
            <Card className="mb-6 border-0 shadow-lg">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="080 1234 5678"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-xs text-purple-700 font-medium">
                    📱 We'll send a 6-digit verification code to your registered phone number
                  </p>
                </div>
              </div>
            </Card>

            <GradientButton type="submit" disabled={isLoading}>
              {isLoading ? 'Sending Code...' : 'Send Verification Code'}
            </GradientButton>
          </form>
        )}

        {/* Step 2: Verify Code */}
        {step === 'verify' && (
          <form onSubmit={handleVerify}>
            <Card className="mb-6 border-0 shadow-lg">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-4 text-center">
                    Enter 6-Digit Code
                  </label>
                  <div className="flex gap-2 justify-center">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        id={`code-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleVerificationCodeChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                        onKeyDown={(e) => handleVerificationCodeKeyDown(index, e)}
                        className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-sm font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity disabled:opacity-50"
                  >
                    {isLoading ? 'Resending...' : 'Resend Code'}
                  </button>
                </div>
              </div>
            </Card>

            <GradientButton type="submit" disabled={isLoading || verificationCode.join('').length !== 6}>
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </GradientButton>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {step === 'reset' && (
          <form onSubmit={handleReset}>
            <Card className="mb-6 border-0 shadow-lg">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-xs text-emerald-700 font-medium">
                    🔒 Your password should be strong and unique
                  </p>
                </div>
              </div>
            </Card>

            <GradientButton type="submit" disabled={isLoading}>
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </GradientButton>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="text-center">
            <Card className="mb-6 border-0 shadow-lg">
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Password Reset Successful!
                  </h2>
                  <p className="text-gray-600">
                    You can now sign in with your new password
                  </p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-sm text-purple-700 font-medium">
                    ✨ Your account is secure and ready to use
                  </p>
                </div>
              </div>
            </Card>

            <GradientButton onClick={onPasswordReset}>
              Continue to Login
            </GradientButton>
          </div>
        )}

        {/* Trust Indicators - Show on first step */}
        {step === 'identify' && (
          <div className="mt-12 space-y-3">
            <Card className="flex items-center gap-3 border-0 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Secure Process</p>
                <p className="text-xs text-gray-600">Your account security is our priority</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
