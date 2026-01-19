import { X, Truck, PackageCheck, CreditCard, ChevronRight, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { user } from '../../lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DeliveryInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deliveryInfo: DeliveryInfo) => void;
  currentInfo?: DeliveryInfo | null;
  deliveryPaid?: boolean; // New prop to indicate if payment is already verified
}

export interface DeliveryInfo {
  method: 'pickup' | 'delivery';
  type?: 'pickup' | 'delivery'; 
  address?: string;
  street_address?: string;
  city?: string;
  state?: string;
  landmark?: string;
  phoneNumber?: string;
  phone_number?: string;
}

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", 
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", 
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", 
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT"
];

export function DeliveryInfoModal({ isOpen, onClose, onSave, currentInfo, deliveryPaid = false }: DeliveryInfoModalProps) {
  const [method, setMethod] = useState<'pickup' | 'delivery'>(
    // Priority: 1. If paid, must be delivery. 2. If saved type exists. 3. Default to delivery (safer than pickup)
    deliveryPaid ? 'delivery' : (currentInfo?.type === 'pickup' ? 'pickup' : 'delivery')
  );
  
  const [address, setAddress] = useState(currentInfo?.street_address || currentInfo?.address || '');
  const [city, setCity] = useState(currentInfo?.city || '');
  const [state, setState] = useState(currentInfo?.state || '');
  const [landmark, setLandmark] = useState(currentInfo?.landmark || '');
  const [phoneNumber, setPhoneNumber] = useState(currentInfo?.phone_number || currentInfo?.phoneNumber || '');
  
  // Payment State
  const [isPaid, setIsPaid] = useState(deliveryPaid);
  const [selectedPaymentState, setSelectedPaymentState] = useState('');

  // Fetch Delivery Fees
  const { data: feesData } = useQuery({
    queryKey: ['delivery-fees'],
    queryFn: user.getDeliveryFees,
  });

  const deliveryFees = Array.isArray(feesData) ? feesData : (feesData?.data || []);
  const selectedFee = deliveryFees.find((f: any) => f.state?.toLowerCase() === selectedPaymentState?.toLowerCase())?.fee;
  
  // Debug logging
  useEffect(() => {
    console.log('Delivery Fees Response:', feesData);
    console.log('Parsed Fees:', deliveryFees);
    console.log('Selected State:', selectedPaymentState);
    console.log('Found Fee:', selectedFee);
  }, [feesData, selectedPaymentState]);

  // Update paid status when prop changes
  useEffect(() => {
    setIsPaid(deliveryPaid);
    // If already paid:
    // 1. Force method to delivery
    // 2. Set state if available
    if (deliveryPaid) {
        setMethod('delivery');
        if (currentInfo?.state) {
            setSelectedPaymentState(currentInfo.state);
            setState(currentInfo.state);
        }
    }
  }, [deliveryPaid, currentInfo]);

  const initiatePaymentMutation = useMutation({
    mutationFn: user.initiateDeliveryPayment,
    onSuccess: (data: any) => {
      // Save flag to local storage for callback handling
      localStorage.setItem('pending_payment_type', 'delivery');
      localStorage.setItem('delivery_payment_state', selectedPaymentState);
      
      // Redirect to Paystack
      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        toast.error('Failed to initialize payment gateway');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to initiate delivery payment');
    }
  });

  if (!isOpen) return null;

  const handleSave = () => {
    const payload: any = {
      type: method,
    };

    if (method === 'delivery') {
      payload.street_address = address;
      payload.city = city;
      payload.state = state || selectedPaymentState; // Use selected state if locked
      payload.landmark = landmark;
      payload.phone_number = phoneNumber;
    }

    onSave(payload);
    onClose();
  };

  const isDeliveryFormValid = method === 'pickup' || (address && city && (state || selectedPaymentState) && phoneNumber);
  

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      ></div>
      <div className="fixed inset-x-0 bottom-0 z-50 max-w-[430px] mx-auto">
        <div className="bg-white rounded-t-[2.5rem] shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-6 pt-8 pb-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold">Delivery Information</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 active:scale-95 transition-transform"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="text-white/90 text-sm">Choose how you'll receive your package</p>
          </div>

          {/* Modal Content */}
          <div className="overflow-y-auto px-6 py-6 space-y-6 flex-1">
            {/* Method Selection */}
            <div className="space-y-3">
              <label className="font-semibold text-gray-900">Delivery Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => !isPaid && setMethod('pickup')}
                  disabled={isPaid}
                  className={`p-4 rounded-xl border-2 transition-all active:scale-95 ${
                    method === 'pickup'
                      ? 'border-purple-500 bg-purple-50'
                      : isPaid 
                        ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <PackageCheck className={`w-8 h-8 mx-auto mb-2 ${
                    method === 'pickup' ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <p className={`font-semibold text-sm ${
                    method === 'pickup' ? 'text-purple-900' : 'text-gray-700'
                  }`}>Pickup</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isPaid ? 'Unavailable (Delivery Paid)' : 'Collect at center'}
                  </p>
                </button>

                <button
                  onClick={() => setMethod('delivery')}
                  className={`p-4 rounded-xl border-2 transition-all active:scale-95 ${
                    method === 'delivery'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <Truck className={`w-8 h-8 mx-auto mb-2 ${
                    method === 'delivery' ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <p className={`font-semibold text-sm ${
                    method === 'delivery' ? 'text-purple-900' : 'text-gray-700'
                  }`}>Delivery</p>
                  <p className="text-xs text-gray-500 mt-1">To your state</p>
                </button>
              </div>
            </div>

            {/* Delivery Address Form */}
            
            {method === 'delivery' && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-purple-700 mb-2">
                  <MapPin className="w-5 h-5" />
                  <p className="font-semibold">Delivery Address</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 my-2">
                  <p className="text-xs font-bold text-orange-700 text-center uppercase">
                    You are responsible for picking it up at the park in your state
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g., 123 Main Street, Ikeja"
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Lagos"
                      className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    {isPaid ? (
                        <input
                            type="text"
                            value={state || selectedPaymentState}
                            readOnly
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                        />
                    ) : (
                        <select
                            value={selectedPaymentState}
                            onChange={(e) => setSelectedPaymentState(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                        >
                            <option value="">Choose a state...</option>
                            {NIGERIAN_STATES.map(st => (
                                <option key={st} value={st}>{st}</option>
                            ))}
                        </select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g., Near XYZ Mall"
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g., 080 1234 5678"
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {!isPaid && selectedPaymentState && (
                    <div className={`border rounded-xl p-4 flex gap-3 ${
                        selectedFee ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
                    }`}>
                        <CreditCard className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            selectedFee ? 'text-amber-700' : 'text-red-700'
                        }`} />
                         <div>
                            <p className={`font-semibold text-sm ${
                                selectedFee ? 'text-amber-900' : 'text-red-900'
                            }`}>
                                {selectedFee ? 'Payment Required' : 'Fee Not Set'}
                            </p>
                            <p className={`text-xs mt-1 ${
                                selectedFee ? 'text-amber-700' : 'text-red-700'
                            }`}>
                                {selectedFee 
                                    ? `You will be redirected to Paystack to pay the delivery fee for ${selectedPaymentState} after clicking save.`
                                    : `The delivery fee for ${selectedPaymentState} has not been set yet. Please contact support or check back later.`
                                }
                            </p>
                        </div>
                    </div>
                )}
              </div>
            )}

            {method === 'pickup' && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <PackageCheck className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-900 mb-1">Pickup Location</p>
                    <p className="text-sm text-purple-700">
                      You'll receive details about pickup location and timing via announcements closer to December.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-slate-50 space-y-3">
            {method === 'delivery' && !isPaid ? (
                <button
                    onClick={() => {
                        // Validate
                        if (!selectedPaymentState) {
                             toast.error('Please select a state');
                             return;
                        }
                        
                        if (!selectedFee) {
                             toast.error('Delivery fee unavailable for this state');
                             return;
                        }
                        
                        // Save form data to localStorage
                        const formData = {
                            type: 'delivery',
                            street_address: address,
                            city: city,
                            state: selectedPaymentState,
                            landmark: landmark,
                            phone_number: phoneNumber
                        };
                        localStorage.setItem('delivery_form_data', JSON.stringify(formData));
                        
                        // Initiate Payment
                        initiatePaymentMutation.mutate(selectedPaymentState);
                    }}
                    disabled={!isDeliveryFormValid || initiatePaymentMutation.isPending || !selectedFee}
                    className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                        isDeliveryFormValid && selectedFee
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg'
                            : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                     {initiatePaymentMutation.isPending ? 'Processing...' : `Pay & Save Delivery ${selectedFee ? `(₦${(Number(selectedFee) + ((Number(selectedFee)*0.015))).toLocaleString()})` : ''}`}
                    <ChevronRight className="w-4 h-4" />
                </button>
            ) : (
                <button
                    onClick={handleSave}
                    disabled={!isDeliveryFormValid}
                    className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all active:scale-[0.98] ${
                        isDeliveryFormValid
                        ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-lg'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                    Save Delivery Information
                </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300 hover:border-slate-400 transition-all active:scale-[0.98] font-semibold text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
