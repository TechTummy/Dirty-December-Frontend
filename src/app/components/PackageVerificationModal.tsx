import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Upload, X, CheckCircle, Loader, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { user } from '../../lib/api';
import { GradientButton } from '../components/GradientButton';

interface PackageVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PackageVerificationModal({ isOpen, onClose, onSuccess }: PackageVerificationModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const verificationMutation = useMutation({
    mutationFn: user.verifyPackage,
    onSuccess: () => {
      toast.success('Package Verified!', {
        description: 'Thank you for confirming receipt of your package.',
      });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to verify package');
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error('Please upload a photo of your package');
      return;
    }

    const formData = new FormData();
    formData.append('received_photo', file);
    verificationMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Verify Package</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-gray-600 text-sm text-center">
            Please upload a photo of the package you received to confirm delivery.
          </p>

          {/* Upload Area */}
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`
              border-2 border-dashed rounded-2xl p-8 transition-all duration-200 flex flex-col items-center justify-center gap-3
              ${previewUrl ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-400 hover:bg-gray-50'}
            `}>
              {previewUrl ? (
                 <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-sm">
                   <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 p-2 rounded-full text-gray-700 font-medium text-xs">
                        Change Photo
                      </div>
                   </div>
                 </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">Tap to upload photo</p>
                    <p className="text-xs text-gray-500 mt-1">JPG or PNG (max 5MB)</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <GradientButton 
            onClick={handleSubmit} 
            disabled={!file || verificationMutation.isPending}
            className="w-full"
          >
            {verificationMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Confirm Receipt
              </span>
            )}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
