import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { GradientButton } from './GradientButton';

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function TermsModal({ isOpen, onAccept }: TermsModalProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (scrolledToBottom && !hasScrolled) {
      setHasScrolled(true);
    }
  };

  const handleAccept = () => {
    if (hasAgreed && hasScrolled) {
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative bg-white rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Terms & Conditions</h2>
              <p className="text-sm text-gray-600">Please read and accept to continue</p>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div 
          className="flex-1 overflow-y-auto px-6 py-4"
          onScroll={handleScroll}
        >
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">1. Introduction</h3>
              <p>
                Welcome to Belleza Detty December! By creating an account and using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">2. Contribution Plan</h3>
              <p>
                You agree to make monthly contributions based on your selected package (Basic Bundle, Family Bundle, or Premium Bundle). Contributions must be made by the 5th of each month to maintain active status.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">3. Package Selection</h3>
              <p>
                Your selected package and number of slots determine your monthly contribution amount. Package changes are subject to availability and may only be made within the first 3 months of the contribution period.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">4. Payment Terms</h3>
              <p>
                All payments are processed securely through Paystack. Once confirmed, payments are non-refundable except as required by law. Failed or late payments may result in penalties or loss of benefits.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">5. Bulk Purchase Benefits</h3>
              <p>
                The estimated retail value and savings shown are projections based on current market prices. Actual items and values may vary based on market conditions and product availability in December.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">6. Delivery & Pickup</h3>
              <p>
                You are responsible for providing accurate delivery information. Items must be collected within the specified timeframe in December. Uncollected items will be forfeited without refund.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">7. Account Responsibility</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">8. Prohibited Activities</h3>
              <p>
                You may not use the platform for any illegal activities, create multiple accounts to circumvent limits, or attempt to manipulate the system for unauthorized benefits.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">9. Data Privacy</h3>
              <p>
                We collect and process your personal information in accordance with our Privacy Policy. We do not sell your data to third parties. Your information is used solely for platform operations.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">10. Limitation of Liability</h3>
              <p>
                Belleza Detty December is not liable for indirect damages, market price fluctuations, or circumstances beyond our control. Our total liability is limited to the amount you have contributed.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">11. Termination</h3>
              <p>
                We reserve the right to suspend or terminate accounts that violate these terms. Upon termination, you forfeit access to benefits and may not be entitled to refunds.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">12. Changes to Terms</h3>
              <p>
                We may update these terms with advance notice. Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">13. Governing Law</h3>
              <p>
                These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes will be resolved in Nigerian courts.
              </p>
            </div>

            <div className="pt-4">
              <p className="text-xs text-gray-500">
                Last updated: January 7, 2026
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        {!hasScrolled && (
          <div className="px-6 py-2 bg-amber-50 border-t border-amber-200">
            <p className="text-xs text-amber-700 text-center font-medium">
              Please scroll to the bottom to continue
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100">
          <label className="flex items-start gap-3 mb-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-0.5"
              disabled={!hasScrolled}
            />
            <span className={`text-sm leading-relaxed ${!hasScrolled ? 'text-gray-400' : 'text-gray-700'}`}>
              I have read and agree to the Terms and Conditions
            </span>
          </label>

          <GradientButton
            onClick={handleAccept}
            className="w-full"
            disabled={!hasAgreed || !hasScrolled}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Accept & Continue
            </div>
          </GradientButton>

          {(!hasAgreed || !hasScrolled) && (
            <p className="text-xs text-gray-500 text-center mt-3">
              {!hasScrolled ? 'Scroll to the bottom first' : 'Check the box to continue'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}