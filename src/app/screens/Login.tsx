import { useState } from 'react';
import { toast } from 'sonner';
import { auth } from '../../lib/api';
import { ArrowLeft, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { GradientButton } from '../components/GradientButton';
import { Card } from '../components/Card';

interface LoginProps {
  onLogin: () => void;
  onBackToLanding: () => void;
  onForgotPassword: () => void;
}

export function Login({ onLogin, onBackToLanding, onForgotPassword }: LoginProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await auth.login({
        login: phoneNumber,
        password: password
      });

      // Show success message
      toast.success(response.message || 'Login successful');

      // Store token and user data
      if (response.data?.token) {
        // Enforce User Role
        if (response.data.user.role !== 'user') {
          throw new Error('Please use the Admin Portal');
        }

        localStorage.setItem('auth_token', response.data.token);
      }
      if (response.data?.user) {
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }

      onLogin();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Login failed. Please check your credentials.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome Back
            </span>
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Sign in to continue your savings journey
          </p>
        </div>
      </div>

      {/* Login Form */}
      <div className="px-6 pb-32">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6 border-0 shadow-lg">
            <div className="space-y-5">
              {/* Phone Number Input */}
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

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
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
              </div>
            </div>

            {/* Forgot Password Link */}
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm font-medium bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity mt-3"
            >
              Forgot password?
            </button>
          </Card>

          {/* Sign In Button */}
          <GradientButton type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </GradientButton>
        </form>

        {/* New User Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-2">Don't have an account?</p>
          <button
            onClick={onBackToLanding}
            className="font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Get Started
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 space-y-3">
          <Card className="flex items-center gap-3 border-0 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Secure Login</p>
              <p className="text-xs text-gray-600">Your data is encrypted & protected</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}