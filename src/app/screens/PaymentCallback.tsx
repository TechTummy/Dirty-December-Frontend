import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { payment } from '../../lib/api';
import { toast } from 'sonner';

export function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const effectRan = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (effectRan.current) return;
    effectRan.current = true;

    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      
      if (!reference) {
         toast.error('No payment reference found');
         navigate('/dashboard');
         return;
      }

      try {
        await payment.verifyContribution(reference);
        toast.success('Payment verified successfully!');
      } catch (error: any) {
        console.error(error);
        // Even if verification fails (e.g. already verified), we generally want to let them into the dashboard
        // but show the error.
        toast.error(error.response?.data?.message || 'Payment verification failed');
      } finally {
        // Add a small delay so user sees the state
        setTimeout(() => {
            navigate('/dashboard');
        }, 1500);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
        <p className="text-gray-500 text-sm">Please wait while we confirm your transaction...</p>
      </div>
    </div>
  );
}
