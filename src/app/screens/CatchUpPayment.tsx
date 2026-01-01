import { useState } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle, Upload, Calendar } from 'lucide-react';
import { GradientButton } from '../components/GradientButton';
import { Card } from '../components/Card';
import { getRegistrationStatus, getMonthsOwedList } from '../utils/registrationLogic';

interface CatchUpPaymentProps {
  onBack: () => void;
  onComplete: () => void;
}

export function CatchUpPayment({ onBack, onComplete }: CatchUpPaymentProps) {
  const [proofUploaded, setProofUploaded] = useState(false);
  const regStatus = getRegistrationStatus();
  const monthsOwed = getMonthsOwedList(1, regStatus.currentMonth);

  const handleFileUpload = () => {
    setProofUploaded(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 px-6 pt-12 pb-16 rounded-b-[2.5rem]">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl font-bold">Catch-Up Payment</h1>
        </div>

        {/* Amount Card */}
        <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl shadow-black/10">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 mb-2 font-medium">Total Catch-Up Amount</p>
            <p className="text-5xl font-bold text-gray-900 mb-3">₦{regStatus.totalOwed.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{regStatus.monthsOwed} months • ₦5,000 each</p>
          </div>
        </Card>
      </div>

      <div className="px-6 -mt-6 pb-24">
        {/* Months Being Paid */}
        <Card className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Months Covered</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {monthsOwed.map((month) => (
              <span
                key={month}
                className="px-3 py-2 bg-white border border-amber-200 text-gray-900 text-sm font-semibold rounded-xl shadow-sm"
              >
                {month} 2024
              </span>
            ))}
          </div>
        </Card>

        {/* Info Alert */}
        <Card className="mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 mb-1">Catch-Up Benefits</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Receive full December bundle</li>
                <li>• All past months marked as paid</li>
                <li>• Unlock community features immediately</li>
                <li>• Continue with regular ₦5,000/month</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Bank Details - Same as regular contribution */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Transfer Details</h2>
        
        <Card className="mb-6 border-0 shadow-lg">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium">Bank Name</p>
              <p className="font-semibold text-gray-900">GTBank</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium">Account Name</p>
              <p className="font-semibold text-gray-900">Detty December Contributions</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium">Account Number</p>
              <p className="text-2xl font-bold text-gray-900 tracking-wider">0123456789</p>
            </div>
          </div>
        </Card>

        {/* Upload Proof */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Proof</h2>
        
        {!proofUploaded ? (
          <button
            onClick={handleFileUpload}
            className="w-full group active:scale-95 transition-transform"
          >
            <Card className="border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50/50 transition-all">
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 mx-auto mb-4 flex items-center justify-center group-hover:from-orange-100 group-hover:to-red-100 transition-all">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-orange-500 transition-colors" />
                </div>
                <p className="font-semibold text-gray-900 mb-1">Upload Payment Proof</p>
                <p className="text-sm text-gray-500">JPG, PNG or PDF (Max 5MB)</p>
              </div>
            </Card>
          </button>
        ) : (
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Proof Uploaded</p>
                <p className="text-sm text-gray-600">catchup_payment.jpg</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-white/80 backdrop-blur-xl border-t border-gray-200">
        <GradientButton onClick={onComplete} disabled={!proofUploaded}>
          Submit Catch-Up Payment
        </GradientButton>
        <p className="text-center text-xs text-gray-500 mt-3">
          All past months will be marked paid after verification
        </p>
      </div>
    </div>
  );
}