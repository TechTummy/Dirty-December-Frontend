import { useState } from 'react';
import { ArrowLeft, Copy, Upload, CheckCircle, CreditCard, Building2, AlertCircle, X, Eye } from 'lucide-react';
import { GradientButton } from '../components/GradientButton';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';

interface ContributeProps {
  onBack: () => void;
}

export function Contribute({ onBack }: ContributeProps) {
  const [proofUploaded, setProofUploaded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const accountNumber = '0123456789';
  const bankName = 'GTBank';
  const accountName = 'Detty December Contributions';

  const handleCopy = async () => {
    try {
      // Try the modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(accountNumber);
      } else {
        // Fallback for older browsers or restricted contexts
        const textArea = document.createElement('textarea');
        textArea.value = accountNumber;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Still show the copied state even if it fails
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProofUploaded(true);
        setUploadedFile({ name: file.name, url: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-6 pt-12 pb-16 rounded-b-[2.5rem]">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl font-bold">Make Payment</h1>
        </div>

        {/* Amount Card */}
        <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl shadow-black/10">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 mb-2 font-medium">Monthly Contribution</p>
            <p className="text-5xl font-bold text-gray-900 mb-2">₦5,000</p>
            <p className="text-sm text-gray-600">May 2024 Payment</p>
          </div>
        </Card>
      </div>

      <div className="px-6 -mt-6 pb-40">
        {/* Bank Details */}
        <h2 className="text-lg font-bold text-gray-900 mb-4 mt-8">Transfer Details</h2>
        
        <Card className="mb-4 border-0 shadow-lg">
          <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1 font-medium">Bank Name</p>
              <p className="font-semibold text-gray-900">{bankName}</p>
            </div>
          </div>
          
          <div className="mb-4 pb-4 border-b border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium">Account Name</p>
            <p className="font-semibold text-gray-900">{accountName}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-2 font-medium">Account Number</p>
              <p className="text-2xl font-bold text-gray-900 tracking-wider">{accountNumber}</p>
            </div>
            <button
              onClick={handleCopy}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md ${
                copied
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/30'
                  : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
              }`}
            >
              {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Payment Instructions</h3>
            </div>
          </div>
          <ol className="space-y-2 text-sm text-gray-700 ml-13">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">1.</span>
              <span>Transfer exactly <strong>₦5,000</strong> to the account above</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">2.</span>
              <span>Take a screenshot of your payment confirmation</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">3.</span>
              <span>Upload proof below for verification</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">4.</span>
              <span>Receive confirmation within 24 hours</span>
            </li>
          </ol>
        </Card>

        {/* Upload Proof */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Proof</h2>
        
        {!proofUploaded ? (
          <button
            onClick={() => document.getElementById('fileInput')?.click()}
            className="w-full group active:scale-95 transition-transform"
          >
            <Card className="border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50/50 transition-all">
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 mx-auto mb-4 flex items-center justify-center group-hover:from-purple-100 group-hover:to-pink-100 transition-all">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
                <p className="font-semibold text-gray-900 mb-1">Upload Screenshot</p>
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
                <p className="text-sm text-gray-600">{uploadedFile?.name}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Status Card */}
        {proofUploaded && (
          <Card className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Payment Status</p>
                <p className="text-sm text-gray-600">Under review by our team</p>
              </div>
              <StatusBadge status="pending" size="md" />
            </div>
          </Card>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-white/80 backdrop-blur-xl border-t border-gray-200">
        <GradientButton onClick={() => onBack()} disabled={!proofUploaded}>
          Confirm Payment
        </GradientButton>
        <p className="text-center text-xs text-gray-500 mt-3">
          You'll receive confirmation within 24 hours
        </p>
      </div>

      {/* File Input */}
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept="image/jpeg, image/png, application/pdf"
        onChange={handleFileUpload}
      />

      {/* Preview Modal */}
      {uploadedFile && showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Payment Proof Preview</h3>
              <button
                onClick={handlePreviewClose}
                className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={uploadedFile.url}
                alt="Payment Proof"
                className="max-w-full max-h-96"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}