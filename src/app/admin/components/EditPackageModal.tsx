import { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { Package } from '../../data/packages';
import { GradientButton } from '../../components/GradientButton';
import { Card } from '../../components/Card';

interface EditPackageModalProps {
  package?: Package; // Optional for "Add" mode
  onClose: () => void;
  onSave: (updatedPackage: Package) => void;
}

export function EditPackageModal({ package: pkg, onClose, onSave }: EditPackageModalProps) {
  const isAddMode = !pkg;
  
  const [formData, setFormData] = useState({
    name: pkg?.name || '',
    monthlyAmount: pkg?.monthlyAmount || 0,
    estimatedRetailValue: pkg?.estimatedRetailValue || 0,
    description: pkg?.description || '',
    badge: pkg?.badge || '',
  });

  const [benefits, setBenefits] = useState<string[]>(pkg?.benefits || []);
  const [newBenefit, setNewBenefit] = useState('');

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const yearlyTotal = formData.monthlyAmount * 12;
    const savings = formData.estimatedRetailValue - yearlyTotal;
    const savingsPercent = formData.estimatedRetailValue > 0 
      ? Math.round((savings / formData.estimatedRetailValue) * 100) 
      : 0;

    return { yearlyTotal, savings, savingsPercent };
  };

  const handleSave = () => {
    const totals = calculateTotals();
    
    const updatedPackage: Package = {
      id: pkg?.id || `pkg-${Date.now()}`,
      name: formData.name,
      monthlyAmount: formData.monthlyAmount,
      yearlyTotal: totals.yearlyTotal,
      estimatedRetailValue: formData.estimatedRetailValue,
      savings: totals.savings,
      savingsPercent: totals.savingsPercent,
      description: formData.description,
      benefits,
      gradient: pkg?.gradient || 'from-indigo-500 via-purple-500 to-pink-500',
      shadowColor: pkg?.shadowColor || 'shadow-purple-500/30',
      badge: formData.badge || undefined
    };

    onSave(updatedPackage);
  };

  const totals = calculateTotals();
  const isFormValid = formData.name && formData.monthlyAmount > 0 && formData.estimatedRetailValue > 0 && benefits.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isAddMode ? 'Add New Package' : 'Edit Package'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isAddMode ? 'Create a new subscription package' : 'Update package details and benefits'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Package Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Basic Bundle"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Perfect for small households"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Monthly Amount (₦)
                </label>
                <input
                  type="number"
                  value={formData.monthlyAmount || ''}
                  onChange={(e) => setFormData({ ...formData, monthlyAmount: Number(e.target.value) })}
                  placeholder="5000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Estimated Package Worth (₦)
                </label>
                <input
                  type="number"
                  value={formData.estimatedRetailValue || ''}
                  onChange={(e) => setFormData({ ...formData, estimatedRetailValue: Number(e.target.value) })}
                  placeholder="85700"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Badge (Optional)
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g., POPULAR, BEST VALUE"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Calculated Values */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <h3 className="font-bold text-gray-900 mb-3">Auto-Calculated Values</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Yearly Total</p>
                  <p className="font-bold text-gray-900">₦{totals.yearlyTotal.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Package Worth</p>
                  <p className="font-bold text-emerald-600">₦{formData.estimatedRetailValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Savings</p>
                  <p className="font-bold text-purple-600">₦{totals.savings.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Savings %</p>
                  <p className="font-bold text-amber-600">{totals.savingsPercent}%</p>
                </div>
              </div>
            </Card>

            {/* Benefits List */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Package Benefits</h3>
              <p className="text-sm text-gray-600 mb-3">Add benefits that will be displayed on package cards (e.g., "Premium Rice (25kg)", "Vegetable Oil (5L)")</p>
              
              <div className="space-y-2 mb-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <span className="flex-1 text-sm text-gray-700">{benefit}</span>
                    <button
                      onClick={() => handleRemoveBenefit(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddBenefit()}
                  placeholder="Add benefit description..."
                  className="flex-1 px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleAddBenefit}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-100 text-gray-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <GradientButton onClick={handleSave} disabled={!isFormValid}>
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {isAddMode ? 'Add Package' : 'Save Changes'}
            </span>
          </GradientButton>
        </div>
      </div>
    </div>
  );
}