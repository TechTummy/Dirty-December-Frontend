import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { payment, user } from '../../lib/api';
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

      const paymentType = localStorage.getItem('pending_payment_type') || 'contribution';

      try {
        if (paymentType === 'delivery') {
            await user.verifyDeliveryPayment(reference);
            toast.success('Delivery fee verified successfully!');
            
            // Check for saved form data to complete the process
            const savedFormData = localStorage.getItem('delivery_form_data');
            if (savedFormData) {
                try {
                    const formData = JSON.parse(savedFormData);
                    await user.saveDeliverySettings(formData);
                    toast.success('Delivery details saved successfully!');
                    localStorage.removeItem('delivery_form_data');
                } catch (saveError) {
                    console.error('Failed to save delivery details:', saveError);
                    toast.error('Payment verified, but failed to save details. Please try saving again.');
                }
            } else {
                 // Fallback if no data (legacy or error)
                 localStorage.setItem('open_delivery_modal', 'true');
            }
        } else {
            await payment.verifyContribution(reference);
            toast.success('Contribution verified successfully!');
        }
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Payment verification failed');
      } finally {
        // Clear pending flags
        localStorage.removeItem('pending_payment_type');
        
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
