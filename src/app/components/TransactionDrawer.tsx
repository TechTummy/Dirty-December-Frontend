import { X, Receipt, Copy, CheckCircle, Clock, RotateCcw, XCircle } from 'lucide-react';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { useState } from 'react';

interface Transaction {
  month: string;
  amount: number;
  status: string;
  date: string;
  transactionId: string;
  paymentMethod: string;
  reference: string;
  time: string;
}

interface TransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onRetry?: (transaction: Transaction) => void;
}

export function TransactionDrawer({ isOpen, onClose, transactions, onRetry }: TransactionDrawerProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyId = async (id: string) => {
    try {
      // Try the modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(id);
      } else {
        // Fallback for older browsers or restricted contexts
        const textArea = document.createElement('textarea');
        textArea.value = id;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Still show the copied state even if it fails
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleBack = () => {
    setSelectedTransaction(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={selectedTransaction ? handleBack : onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white rounded-t-3xl z-50 transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {selectedTransaction ? 'Transaction Details' : 'Transaction History'}
            </h2>
            <p className="text-sm text-gray-500">
              {selectedTransaction ? selectedTransaction.month + ' 2024' : `${transactions.length} transactions`}
            </p>
          </div>
          <button 
            onClick={selectedTransaction ? handleBack : onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors active:scale-95"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          {selectedTransaction ? (
            // Transaction Details View
            <div className="space-y-4">
              {/* Status Card */}
              <Card className={`text-center border-0 ${
                selectedTransaction.status === 'confirmed' 
                  ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200' 
                  : selectedTransaction.status === 'declined'
                  ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
                  : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
              }`}>
                <div className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center ${
                  selectedTransaction.status === 'confirmed'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                    : selectedTransaction.status === 'declined'
                    ? 'bg-gradient-to-br from-red-500 to-rose-500'
                    : 'bg-gradient-to-br from-amber-500 to-orange-500'
                }`}>
                  {selectedTransaction.status === 'confirmed' ? (
                    <CheckCircle className="w-8 h-8 text-white" />
                  ) : selectedTransaction.status === 'declined' ? (
                    <XCircle className="w-8 h-8 text-white" />
                  ) : (
                    <Clock className="w-8 h-8 text-white" />
                  )}
                </div>
                <StatusBadge status={selectedTransaction.status} />
                <h3 className="text-3xl font-bold text-gray-900 mt-3 mb-1">
                  ₦{selectedTransaction.amount.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedTransaction.date} at {selectedTransaction.time}
                </p>
              </Card>

              {/* Transaction ID Card */}
              <Card className="border-0 shadow-md">
                <div className="flex items-start gap-3 mb-4">
                  <Receipt className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1 font-medium">Transaction ID</p>
                    <p className="font-mono text-sm font-semibold text-gray-900 break-all">
                      {selectedTransaction.transactionId}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyId(selectedTransaction.transactionId)}
                    className="w-8 h-8 rounded-lg bg-purple-50 hover:bg-purple-100 flex items-center justify-center transition-colors active:scale-95 flex-shrink-0"
                  >
                    {copiedId === selectedTransaction.transactionId ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-purple-600" />
                    )}
                  </button>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Payment Method</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedTransaction.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Reference</span>
                    <span className="text-sm font-mono font-semibold text-gray-900">{selectedTransaction.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Contribution Month</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedTransaction.month} 2024</span>
                  </div>
                </div>
              </Card>

              {/* Help Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">Need help?</span> Contact support with your transaction ID for any inquiries about this payment.
                </p>
              </Card>

              {/* Try Again Button for Declined Transactions */}
              {selectedTransaction.status === 'declined' && onRetry && (
                <button
                  onClick={() => {
                    onRetry(selectedTransaction);
                    setSelectedTransaction(null);
                    onClose();
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again - Resubmit Contribution
                </button>
              )}
            </div>
          ) : (
            // Transaction List View
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
                <button
                  key={index}
                  onClick={() => handleTransactionClick(transaction)}
                  className="w-full text-left active:scale-[0.98] transition-transform"
                >
                  <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-md ${
                          transaction.status === 'confirmed'
                            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-emerald-500/30'
                            : transaction.status === 'declined'
                            ? 'bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-red-500/30'
                            : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-orange-500/30'
                        }`}>
                          {transaction.month.substring(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{transaction.month} 2024</p>
                          <p className="text-sm text-gray-500">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 mb-1">₦{transaction.amount.toLocaleString()}</p>
                        <StatusBadge status={transaction.status} />
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Transaction ID</span>
                        <span className="text-xs font-mono font-semibold text-gray-900">{transaction.transactionId}</span>
                      </div>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}