import { useState } from 'react';
import { ShieldCheck, Loader, ArrowRight, ExternalLink, X } from 'lucide-react';
import { payment } from '../../lib/api';
import { toast } from 'sonner';

interface PaystackModalProps {
  amount: number;
  email: string;
  onSuccess: () => void;
  onClose: () => void;
  packageName: string;
  quantity: number;
}

export function PaystackModal({ amount, packageName, quantity, onClose }: PaystackModalProps) {
  const [isInitializing, setIsInitializing] = useState(false);

  const handlePay = async () => {
    setIsInitializing(true);
    try {
      const response = await payment.initializeContribution();
      
      if (response.data?.authorization_url) {
        // Redirect to Paystack
        window.location.href = response.data.authorization_url;
      } else {
        toast.error('Failed to initialize payment');
        setIsInitializing(false);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Payment initialization failed');
      setIsInitializing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden relative">
        <button 
           onClick={onClose}
           className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 transition-colors"
        >
           <X className="w-6 h-6" />
        </button>

        <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payment</h3>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
               <p className="text-3xl font-bold text-gray-900">₦{amount.toLocaleString()}</p>
               <p className="text-xs text-gray-500 mt-1">{packageName} × {quantity}</p>
            </div>

            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                You will be redirected to Paystack's secure checkout page to complete your payment.
            </p>

            <button
              onClick={handlePay}
              disabled={isInitializing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              {isInitializing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  Proceed to Paystack
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-400">
                <ExternalLink className="w-3 h-3" />
                <span>Opens in a new secure window</span>
            </div>
        </div>
      </div>
    </div>
  );
}
