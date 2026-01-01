import { AlertCircle } from 'lucide-react';

export function PriceDisclaimer() {
  return (
    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-amber-800">
        <span className="font-semibold">Note:</span> Prices and product values may vary based on current market conditions at the time of purchase.
      </p>
    </div>
  );
}
