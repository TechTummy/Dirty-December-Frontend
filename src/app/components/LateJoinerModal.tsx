import { Calendar, TrendingUp, ArrowRight, Clock, X } from 'lucide-react';
import { GradientButton } from './GradientButton';
import { Card } from './Card';

interface LateJoinerModalProps {
  monthsOwed: number;
  totalOwed: number;
  currentMonth: number;
  estimatedValue: number;
  onCatchUp: () => void;
  onReserveNextYear: () => void;
  onClose: () => void;
}

export function LateJoinerModal({
  monthsOwed,
  totalOwed,
  currentMonth,
  estimatedValue,
  onCatchUp,
  onReserveNextYear,
  onClose
}: LateJoinerModalProps) {
  const nextYear = new Date().getFullYear() + 1;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsOwedNames = monthNames.slice(0, currentMonth);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-[400px] bg-white rounded-3xl max-h-[90vh] overflow-y-auto animate-scale-up">
        <button 
          onClick={onClose}
          className="sticky top-4 right-4 ml-auto mr-4 mt-4 w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors z-10 active:scale-95"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="px-6 pb-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 mx-auto mb-4 flex items-center justify-center shadow-2xl shadow-orange-500/40">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mid-Cycle Registration</h2>
            <p className="text-gray-600 leading-relaxed">
              You're joining after January 31st. Choose how you'd like to proceed:
            </p>
          </div>

          {/* Option 1: Catch Up */}
          <Card className="mb-4 border-2 border-purple-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 hover:border-purple-300 transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Option 1: Catch Up & Join Now</h3>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  Pay for all past months and get your full December bundle
                </p>
              </div>
            </div>

            <div className="bg-white/80 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600 font-medium">Months to catch up</span>
                <span className="font-bold text-gray-900">{monthsOwed} months</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {monthsOwedNames.map((month) => (
                  <span key={month} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg">
                    {month}
                  </span>
                ))}
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-3"></div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ₦{totalOwed.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-gray-700">
                  Estimated bundle value: <strong className="text-emerald-700">₦{estimatedValue.toLocaleString()}</strong>
                </span>
              </div>
            </div>

            <GradientButton onClick={onCatchUp} className="mt-4">
              <span className="flex items-center justify-center gap-2">
                Catch Up & Join Now
                <ArrowRight className="w-5 h-5" />
              </span>
            </GradientButton>
          </Card>

          {/* Option 2: Reserve for Next Year */}
          <Card className="mb-4 border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 hover:border-slate-300 transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-500/30">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Option 2: Reserve for Next Year</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Skip this year's cycle and secure your spot for Dirty December {nextYear}
                </p>
              </div>
            </div>

            <div className="bg-white/60 rounded-xl p-4 mb-4">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                  <span>Start fresh in January {nextYear}</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                  <span>No catch-up payments needed</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                  <span>Get reminder when registration opens</span>
                </li>
              </ul>
            </div>

            <GradientButton onClick={onReserveNextYear} variant="secondary">
              Reserve for {nextYear}
            </GradientButton>
          </Card>

          <p className="text-xs text-center text-gray-500 leading-relaxed">
            We want everyone to get full benefits. That's why late joiners can catch up or plan for next year.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}