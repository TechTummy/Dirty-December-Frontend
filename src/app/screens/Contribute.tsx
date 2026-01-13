import { useState } from 'react';
import { ArrowLeft, CheckCircle, CreditCard, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { GradientButton } from '../components/GradientButton';
import { Card } from '../components/Card';
import { PaystackModal } from '../components/PaystackModal';
import { user } from '../../lib/api';
import { packages } from '../data/packages';

interface ContributeProps {
  onBack: () => void;
  userPackage?: string;
  userQuantity?: number;
  userEmail?: string;
}

export function Contribute({ onBack, userPackage = 'Basic Bundle', userQuantity = 1, userEmail = 'user@email.com' }: ContributeProps) {
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Get current status to determine month
  const { data: transactionsData } = useQuery({
    queryKey: ['transactions'],
    queryFn: user.getTransactions,
  });

  const rawHistory = transactionsData?.data?.data || transactionsData?.data || [];
  const contributionHistory = Array.isArray(rawHistory) ? rawHistory : [];
  const confirmedContributions = contributionHistory.filter((c: any) => c.status === 'confirmed' || c.status === 'success').length;
  
  // Calculate next month
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const nextPaymentIndex = Math.min(confirmedContributions, 11);
  const nextPaymentMonth = months[nextPaymentIndex];
  const currentYear = new Date().getFullYear();

  // Get package pricing
  const selectedPkg = packages.find(p => p.name === userPackage) || packages[0];
  const monthlyAmount = selectedPkg.monthlyAmount;
  const totalAmount = monthlyAmount * userQuantity;

  const handlePaymentSuccess = () => {
    setShowPaystackModal(false);
    setPaymentCompleted(true);
  };

  const handlePayNow = () => {
    setShowPaystackModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-6 pt-12 pb-16 rounded-b-[2.5rem]">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl font-bold">Make Payment</h1>
        </div>

        {/* Amount Card */}
        <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl shadow-black/10">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-4 font-medium text-center">Payment Summary</p>
            
            {/* Package Info */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <p className="text-sm text-gray-600">Package</p>
              <p className="font-semibold text-gray-900">{userPackage}</p>
            </div>
            
            {/* Slot Breakdown */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <p className="text-sm text-gray-600">Number of Slots</p>
              <p className="font-semibold text-gray-900">{userQuantity} {userQuantity === 1 ? 'slot' : 'slots'}</p>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <p className="text-sm text-gray-600">Price per Slot</p>
              <p className="font-semibold text-gray-900">₦{monthlyAmount.toLocaleString()}</p>
            </div>
            
            {/* Calculation */}
            {userQuantity > 1 && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <p className="text-sm text-gray-600">Calculation</p>
                <p className="text-sm text-gray-600">{userQuantity} × ₦{monthlyAmount.toLocaleString()}</p>
              </div>
            )}
            
            {/* Total Amount */}
            <div className="flex items-center justify-between pt-4 mt-2">
              <p className="font-bold text-gray-900">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">₦{totalAmount.toLocaleString()}</p>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                {confirmedContributions >= 12 
                  ? 'All contributions completed' 
                  : `${nextPaymentMonth} ${currentYear} Payment`
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-6 -mt-6 pb-40">
        {/* Payment Info Card */}
        <div className="mt-8 mb-6">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
            <div className="flex gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Secure Payment</h3>
                <p className="text-sm text-gray-600">Powered by Paystack - Pay securely with your card</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment Features */}
        <div className="space-y-3 mb-8">
          <Card className="border-0 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Instant Confirmation</p>
                <p className="text-sm text-gray-600">Your payment is confirmed immediately</p>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Multiple Payment Options</p>
                <p className="text-sm text-gray-600">Pay with card, bank transfer, e.t.c</p>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Bank-Level Security</p>
                <p className="text-sm text-gray-600">Your payment information is encrypted and secure</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment Success State */}
        {paymentCompleted && (
          <Card className="mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Payment Successful!</p>
                <p className="text-sm text-gray-600">Your contribution has been received</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-white/80 backdrop-blur-xl border-t border-gray-200">
        {!paymentCompleted ? (
          <>
            <GradientButton onClick={handlePayNow} className="w-full">
              Pay ₦{totalAmount.toLocaleString()} Now
            </GradientButton>
            <p className="text-center text-xs text-gray-500 mt-3">
              Secure payment powered by Paystack
            </p>
          </>
        ) : (
          <>
            <GradientButton onClick={onBack} className="w-full">
              Back to Dashboard
            </GradientButton>
            <p className="text-center text-xs text-gray-500 mt-3">
              Payment confirmed successfully
            </p>
          </>
        )}
      </div>

      {/* Paystack Modal */}
      {showPaystackModal && (
        <PaystackModal
          amount={totalAmount}
          email={userEmail}
          packageName={userPackage}
          quantity={userQuantity}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaystackModal(false)}
        />
      )}
    </div>
  );
}