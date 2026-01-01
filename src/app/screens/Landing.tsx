import { TrendingUp, Shield, Clock, ArrowRight, Check, Star, X } from 'lucide-react';
import { GradientButton } from '../components/GradientButton';
import { Card } from '../components/Card';
import { Partners } from '../components/Partners';
import { Testimonials } from '../components/Testimonials';
import { VideoTestimonials } from '../components/VideoTestimonials';
import { PriceDisclaimer } from '../components/PriceDisclaimer';
import { packages } from '../data/packages';
import { useState } from 'react';

interface LandingProps {
  onGetStarted: (packageId?: string) => void;
  onSignIn: () => void;
  onAdminAccess?: () => void;
}

export function Landing({ onGetStarted, onSignIn, onAdminAccess }: LandingProps) {
  const [selectedPackageForModal, setSelectedPackageForModal] = useState<string | null>(null);
  
  const selectedPackage = packages.find(pkg => pkg.id === selectedPackageForModal);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header with Sign In */}
      <div className="flex justify-end px-6 pt-6">
        <button
          onClick={onSignIn}
          className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          Sign In
        </button>
      </div>

      {/* Hero Section */}
      <div className="px-6 pt-8 pb-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full mb-6 border border-purple-100">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">50+ Active Members</span>
          </div>
          
          <h1 className="text-5xl mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Detty December
            </span>
          </h1>
          <p className="text-xl text-gray-900 mb-3 font-medium">
            Smart Savings, Better Value
          </p>
          <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
            Contribute monthly and receive bulk-purchased provisions worth 30%+ more in December
          </p>
        </div>

        {/* Video Testimonials Section */}
        <div className="-mx-6 px-6 mb-12">
          <VideoTestimonials />
        </div>

        {/* Packages Section */}
        <div className="mb-8">
          <h2 className="text-center font-bold text-gray-900 mb-2">Choose Your Package</h2>
          <p className="text-center text-sm text-gray-600 mb-6">Select the bundle that fits your needs</p>
          
          <div className="space-y-4">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all relative cursor-pointer active:scale-[0.98]"
                onClick={() => onGetStarted(pkg.id)}
              >
                {pkg.badge && (
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${pkg.gradient} text-white shadow-lg ${pkg.shadowColor}`}>
                    {pkg.badge}
                  </div>
                )}
                
                <div className={`bg-gradient-to-br ${pkg.gradient} -m-6 p-6 text-white mb-4 rounded-t-2xl`}>
                  <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
                  <p className="text-white/90 text-sm mb-4">{pkg.description}</p>
                  
                  <div className="mb-2">
                    <span className="text-sm text-white/80 block mb-1">Total Yearly Contribution</span>
                    <div className="flex items-end gap-2 mb-1">
                      <span className="text-4xl font-bold">₦{pkg.yearlyTotal.toLocaleString()}</span>
                      <span className="text-white/80 pb-1">/year</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/90">Benefit Package Worth</span>
                      <span className="font-bold text-xl">₦{pkg.estimatedRetailValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 mb-4">
                  {pkg.detailedBenefits && pkg.detailedBenefits.length > 0 ? (
                    <>
                      {pkg.detailedBenefits.slice(0, 3).map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${pkg.gradient} flex items-center justify-center flex-shrink-0`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm text-gray-700">{benefit.item} - {benefit.quantity} {benefit.unit}</span>
                        </div>
                      ))}
                      {pkg.detailedBenefits.length > 3 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPackageForModal(pkg.id);
                          }}
                          className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 hover:border-purple-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group mt-3"
                        >
                          <span className="font-semibold text-purple-700 text-sm">View All {pkg.detailedBenefits.length} Items</span>
                          <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </>
                  ) : (
                    pkg.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${pkg.gradient} flex items-center justify-center flex-shrink-0`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 -mx-6 px-6 -mb-6 pb-6 bg-emerald-50">
                  <span className="text-sm text-emerald-900 font-medium">You Save</span>
                  <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    ₦{pkg.savings.toLocaleString()} ({pkg.savingsPercent}%)
                  </span>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Price Disclaimer */}
          <div className="mt-4">
            <PriceDisclaimer />
          </div>
        </div>

        {/* Partners Section */}
        <Partners />

        {/* Testimonials Section */}
        <div className="mt-8 -mx-6 px-6">
          <Testimonials />
        </div>

        {/* Features */}
        <div className="space-y-3 mb-36 mt-8">
          <Card className="flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-semibold text-gray-900 mb-1">100% Secure</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Transparent tracking with verified payment confirmations
              </p>
            </div>
          </Card>

          <Card className="flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-semibold text-gray-900 mb-1">Maximum Savings</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Bulk purchasing power means 30%+ more value for your money
              </p>
            </div>
          </Card>

          <Card className="flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/30">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-semibold text-gray-900 mb-1">Flexible Payments</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Pay ₦5,000 monthly via simple bank transfer, no hassle
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-white/80 backdrop-blur-xl border-t border-gray-200">
        <GradientButton onClick={onGetStarted}>
          <span className="flex items-center justify-center gap-2">
            Get Started
            <ArrowRight className="w-5 h-5" />
          </span>
        </GradientButton>
        <p className="text-center text-xs text-gray-500 mt-3">
          Join today and start your savings journey
        </p>
        
        {/* Admin Access Link */}
        {onAdminAccess && (
          <button
            onClick={onAdminAccess}
            className="w-full text-center text-xs text-gray-400 hover:text-purple-600 mt-2 transition-colors"
          >
            Admin Access
          </button>
        )}
      </div>

      {/* Benefits Modal */}
      {selectedPackageForModal && selectedPackage && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSelectedPackageForModal(null)}
          ></div>
          <div className="fixed inset-x-0 bottom-0 z-50 max-w-[430px] mx-auto">
            <div className="bg-white rounded-t-[2.5rem] shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className={`bg-gradient-to-br ${selectedPackage.gradient} px-6 pt-8 pb-6 text-white`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-bold">{selectedPackage.name}</h2>
                  <button
                    onClick={() => setSelectedPackageForModal(null)}
                    className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 active:scale-95 transition-transform"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <p className="text-white/90 text-sm">All items included in this package</p>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto px-6 py-6 space-y-3">
                {selectedPackage.detailedBenefits?.map((benefit, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${selectedPackage.gradient} flex items-center justify-center flex-shrink-0 shadow-md ${selectedPackage.shadowColor}`}>
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{benefit.item}</p>
                        <p className="text-sm text-gray-600">{benefit.quantity} {benefit.unit}</p>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-slate-50">
                <button
                  onClick={() => setSelectedPackageForModal(null)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300 hover:border-slate-400 transition-all active:scale-[0.98] font-semibold text-gray-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}