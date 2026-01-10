import { ArrowLeft, TrendingDown, Package as PackageIcon, Sparkles } from 'lucide-react';
import { GradientButton } from '../components/GradientButton';
import { Card } from '../components/Card';
import { PriceDisclaimer } from '../components/PriceDisclaimer';
import { packages } from '../data/packages';

interface ValuePreviewProps {
  onBack: () => void;
  selectedPackage?: string;
}

export function ValuePreview({ onBack, selectedPackage = 'Basic Bundle' }: ValuePreviewProps) {
  // Get the user's package
  const userPackage = packages.find(pkg => pkg.name === selectedPackage) || packages[0];
  
  const totalRetail = userPackage.estimatedRetailValue;
  const yearlyContribution = userPackage.yearlyTotal;
  const savings = userPackage.savings;
  const savingsPercent = userPackage.savingsPercent;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className={`bg-gradient-to-br ${userPackage.gradient} px-6 pt-12 pb-16 rounded-b-[2.5rem]`}>
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl font-bold">Package Value</h1>
        </div>

        {/* Summary Card */}
        <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl shadow-black/10">
          <div className="text-center">
            <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${userPackage.gradient} text-white mb-4`}>
              {userPackage.name}
            </div>
            
            <p className="text-sm text-gray-500 mb-2 font-medium">Monthly Contribution</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">₦{userPackage.monthlyAmount.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mb-4">per month</p>
            
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4"></div>
            
            <p className="text-sm text-gray-500 mb-2 font-medium">Your Annual Contribution</p>
            <p className="text-2xl font-bold text-gray-900 mb-6">₦{yearlyContribution.toLocaleString()}</p>
            
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6"></div>
            
            <p className="text-sm text-gray-500 mb-3 font-medium">Estimated Package Value</p>
            <p className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
              ₦{totalRetail.toLocaleString()}
            </p>
            
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl px-4 py-2">
              <TrendingDown className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-emerald-700">Save {savingsPercent}%</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-6 -mt-6 pb-24">
        {/* Items Header */}
        <div className="flex items-center gap-3 mb-4 mt-8">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${userPackage.gradient} flex items-center justify-center shadow-lg ${userPackage.shadowColor}`}>
            <PackageIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">December Package</h2>
        </div>

        {/* Package Benefits */}
        {userPackage.detailedBenefits && userPackage.detailedBenefits.length > 0 ? (
          <div className="space-y-3 mb-6">
            {userPackage.detailedBenefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${userPackage.gradient} flex items-center justify-center shadow-lg ${userPackage.shadowColor}`}>
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{benefit.item}</h3>
                      <p className="text-sm text-gray-600">{benefit.quantity} {benefit.unit}</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {userPackage.benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${userPackage.gradient} flex items-center justify-center shadow-lg ${userPackage.shadowColor}`}>
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <p className="font-semibold text-gray-900">{benefit}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Package Summary - No Pricing */}
        <Card className={`bg-gradient-to-br ${userPackage.gradient} text-white border-0 shadow-2xl ${userPackage.shadowColor}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{userPackage.name}</h3>
              <p className="text-white/80 text-sm">Your selected package</p>
            </div>
          </div>
          
          <div className="text-center pt-2">
            <p className="text-white/90 text-sm leading-relaxed">
              All items above are included in your December package. Continue your monthly contributions to receive your bulk provisions.
            </p>
          </div>
        </Card>

        <PriceDisclaimer />
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-white/80 backdrop-blur-xl border-t border-gray-200">
        <GradientButton onClick={onBack}>
          Back to Dashboard
        </GradientButton>
      </div>
    </div>
  );
}