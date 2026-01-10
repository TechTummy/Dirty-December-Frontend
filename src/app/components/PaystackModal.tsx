import { useState, useEffect } from 'react';
import { X, Lock, CreditCard, Building2, CheckCircle, Loader } from 'lucide-react';
import { Card } from './Card';

interface PaystackModalProps {
  amount: number;
  email: string;
  onSuccess: () => void;
  onClose: () => void;
  packageName: string;
  quantity: number;
}

export function PaystackModal({ amount, email, onSuccess, onClose, packageName, quantity }: PaystackModalProps) {
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handlePayment = () => {
    // Simulate payment processing
    setStep('processing');
    
    setTimeout(() => {
      setShowPin(true);
    }, 1500);
  };

  const handlePinSubmit = () => {
    if (pin.length === 4) {
      setShowPin(false);
      setStep('processing');
      
      setTimeout(() => {
        setStep('success');
      }, 2000);

      setTimeout(() => {
        onSuccess();
      }, 3500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">₱</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Paystack</h3>
              <p className="text-blue-100 text-xs">Secure Payment</p>
            </div>
          </div>
          {step === 'payment' && (
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* Payment Form */}
        {step === 'payment' && (
          <div className="p-6">
            {/* Amount Display */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">You're paying</p>
              <p className="text-3xl font-bold text-gray-900">₦{amount.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{packageName} - {quantity} {quantity === 1 ? 'slot' : 'slots'} (First month)</p>
            </div>

            {/* Payment Details */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    maxLength={5}
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    CVV
                  </label>
                  <input
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    maxLength={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-2 mb-6 p-3 bg-green-50 rounded-xl border border-green-200">
              <Lock className="w-4 h-4 text-green-600" />
              <p className="text-xs text-green-700 font-medium">
                Your payment is secured with 256-bit SSL encryption
              </p>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={!cardNumber || !expiryDate || !cvv}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
            >
              Pay ₦{amount.toLocaleString()}
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              By proceeding, you agree to Paystack's terms and conditions
            </p>
          </div>
        )}

        {/* Processing */}
        {step === 'processing' && !showPin && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Loader className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </div>
        )}

        {/* PIN Entry */}
        {showPin && (
          <div className="p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Enter Your PIN</h3>
            <p className="text-gray-600 text-center mb-6">Please enter your 4-digit card PIN to complete this transaction</p>

            <div className="mb-6">
              <input
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                maxLength={4}
                className="w-full px-4 py-4 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-[0.5em] font-bold"
                autoFocus
              />
            </div>

            <button
              onClick={handlePinSubmit}
              disabled={pin.length !== 4}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
            >
              Submit PIN
            </button>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-1">₦{amount.toLocaleString()} paid</p>
            <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}
