import { X, MapPin, Truck, PackageCheck } from 'lucide-react';
import { useState } from 'react';

interface DeliveryInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deliveryInfo: DeliveryInfo) => void;
  currentInfo?: DeliveryInfo | null;
}

export interface DeliveryInfo {
  method: 'pickup' | 'delivery';
  type?: 'pickup' | 'delivery'; // API field
  address?: string;
  street_address?: string; // API field
  city?: string;
  state?: string;
  landmark?: string;
  phoneNumber?: string;
  phone_number?: string; // API field
}

export function DeliveryInfoModal({ isOpen, onClose, onSave, currentInfo }: DeliveryInfoModalProps) {
  const [method, setMethod] = useState<'pickup' | 'delivery'>(currentInfo?.method || 'pickup');
  const [address, setAddress] = useState(currentInfo?.address || '');
  const [city, setCity] = useState(currentInfo?.city || '');
  const [state, setState] = useState(currentInfo?.state || '');
  const [landmark, setLandmark] = useState(currentInfo?.landmark || '');
  const [phoneNumber, setPhoneNumber] = useState(currentInfo?.phoneNumber || '');

  if (!isOpen) return null;

  const handleSave = () => {
    // Map internal state to API expected format
    const payload: any = {
      type: method, // API expects 'type' not 'method'
    };

    if (method === 'delivery') {
      payload.street_address = address; // API expects 'street_address'
      payload.city = city;
      payload.state = state;
      payload.landmark = landmark;
      payload.phone_number = phoneNumber; // API expects 'phone_number'
    }

    onSave(payload);
    onClose();
  };

  const isDeliveryFormValid = method === 'pickup' || (address && city && state && phoneNumber);

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
                  onClick={() => setMethod('pickup')}
                  className={`p-4 rounded-xl border-2 transition-all active:scale-95 ${
                    method === 'pickup'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <PackageCheck className={`w-8 h-8 mx-auto mb-2 ${
                    method === 'pickup' ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <p className={`font-semibold text-sm ${
                    method === 'pickup' ? 'text-purple-900' : 'text-gray-700'
                  }`}>Pickup</p>
                  <p className="text-xs text-gray-500 mt-1">Collect at center</p>
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
                  <p className="text-xs text-gray-500 mt-1">To your address</p>
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
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g., Lagos"
                      className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
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
