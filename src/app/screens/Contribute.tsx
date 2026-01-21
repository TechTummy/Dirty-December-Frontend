import { useState, useMemo } from 'react';
import { ArrowLeft, CheckCircle, CreditCard, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { GradientButton } from '../components/GradientButton';
import { Card } from '../components/Card';
import { PaystackModal } from '../components/PaystackModal';
import { user, auth } from '../../lib/api';

interface ContributeProps {
  onBack: () => void;
  // Props can remain for overrides if needed, but we prioritize backend data
  userPackage?: string;
  userQuantity?: number;
  userEmail?: string;
}

export function Contribute({ onBack, userEmail = 'user@email.com' }: ContributeProps) {
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Fetch Dashboard Stats for current package and payment info
  const { data: dashboardStatsData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: user.getDashboard,
  });

  const stats = dashboardStatsData?.data || {};
  
  // Fetch Packages for details (benefits, monthly contribution to calc quantity)
  const { data: packagesData, isLoading: isPackagesLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: auth.getPackages,
  });

  const backendList = packagesData?.data?.packages 
    ? (Array.isArray(packagesData.data.packages) ? packagesData.data.packages : [])
    : [];

  // Determine Package and Quantity dynamically
  const { foundPkg, quantity, monthlyAmount, totalAmount } = useMemo(() => {
    if (!stats.package_name || !backendList.length) {
      return { foundPkg: null, quantity: 1, monthlyAmount: 0, totalAmount: 0 };
    }

    const pkg = backendList.find((p: any) => p.name === stats.package_name);
    
    if (!pkg) {
      return { foundPkg: null, quantity: 1, monthlyAmount: 0, totalAmount: 0 };
    }

    const monthlyFn = Number(pkg.monthly_contribution);
    const nextAmount = Number(stats.next_payment_amount);
    
    // Calculate quantity based on next payment amount from backend
    // If nextAmount is valid and compatible with monthly, use it. Otherwise default to 1 slot.
    const calculatedQty = (monthlyFn > 0 && nextAmount > 0) 
      ? Math.round(nextAmount / monthlyFn) 
      : 1;

    return { 
      foundPkg: pkg, 
      quantity: calculatedQty,
      monthlyAmount: monthlyFn,
      totalAmount: nextAmount > 0 ? nextAmount : monthlyFn 
    };
  }, [stats.package_name, stats.next_payment_amount, backendList]);

  // Combined loading state
  if (isDashboardLoading || isPackagesLoading) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      );
  }

  // If we loaded data but couldn't identify the package from the backend response
  if (!foundPkg) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="text-center">
                <p className="text-gray-600 mb-2">
                  Could not identify your active package. Please contact support or try again.
                </p>
                <div className="text-xs text-gray-500 mb-4">
                  {stats.package_name ? `Target: ${stats.package_name}` : 'No active package found'}
                </div>
                <button onClick={onBack} className="text-purple-600 font-semibold hover:underline">Go Back</button>
            </div>
        </div>
      );
  }
  
  // Use backend data for payment description
  const nextPaymentLabel = stats.next_payment_date 
      ? stats.next_payment_date // e.g. "February 2026"
      : 'Contribution Payment'; 

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
              <p className="font-semibold text-gray-900">{foundPkg.name}</p>
            </div>
            
            {/* Slot Breakdown */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <p className="text-sm text-gray-600">Number of Slots</p>
              <p className="font-semibold text-gray-900">{quantity} {quantity === 1 ? 'slot' : 'slots'}</p>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <p className="text-sm text-gray-600">Price per Slot</p>
              <p className="font-semibold text-gray-900">₦{monthlyAmount.toLocaleString()}</p>
            </div>
            
            {/* Calculation */}
            {quantity > 1 && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <p className="text-sm text-gray-600">Calculation</p>
                <p className="text-sm text-gray-600">{quantity} × ₦{monthlyAmount.toLocaleString()}</p>
              </div>
            )}
            
            {/* Total Amount */}
            <div className="flex items-center justify-between pt-4 mt-2">
              <p className="font-bold text-gray-900">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">₦{totalAmount.toLocaleString()}</p>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500 font-medium bg-gray-50 inline-block px-3 py-1 rounded-full">
                Paying for: <span className="text-gray-900">{nextPaymentLabel}</span>
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
          packageName={foundPkg.name}
          quantity={quantity}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaystackModal(false)}
        />
      )}
    </div>
  );
}