import { useState } from 'react';
import { Edit, Plus, Eye, Package as PackageIcon } from 'lucide-react';
import { Card } from '../../components/Card';
import { GradientButton } from '../../components/GradientButton';
import { packages as initialPackages, Package } from '../../data/packages';
import { EditPackageModal } from '../components/EditPackageModal';

export function PackagesManagement() {
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [viewingPackage, setViewingPackage] = useState<Package | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleSavePackage = (updatedPackage: Package) => {
    const existingIndex = packages.findIndex(pkg => pkg.id === updatedPackage.id);
    
    if (existingIndex >= 0) {
      // Update existing package
      setPackages(packages.map(pkg => 
        pkg.id === updatedPackage.id ? updatedPackage : pkg
      ));
    } else {
      // Add new package
      setPackages([...packages, updatedPackage]);
    }
    
    setEditingPackage(null);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packages Management</h1>
          <p className="text-gray-500 mt-1">Manage subscription packages and benefits</p>
        </div>
        <GradientButton onClick={() => setShowAddModal(true)}>
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Package
          </span>
        </GradientButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden relative">
            {pkg.badge && (
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${pkg.gradient} text-white shadow-lg ${pkg.shadowColor} z-10`}>
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
              {pkg.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${pkg.gradient} flex items-center justify-center flex-shrink-0`}>
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            {pkg.detailedBenefits && pkg.detailedBenefits.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs font-semibold text-blue-900">
                  {pkg.detailedBenefits.length} detailed items configured
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Click "View Details" to see full breakdown
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 -mx-6 px-6 mb-4 bg-emerald-50">
              <span className="text-sm text-emerald-900 font-medium">You Save</span>
              <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ₦{pkg.savings.toLocaleString()} ({pkg.savingsPercent}%)
              </span>
            </div>

            <div className="flex gap-2 -mx-6 px-6 -mb-6 pb-6 bg-slate-50">
              <button 
                onClick={() => setViewingPackage(pkg)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">View Details</span>
              </button>
              <button 
                onClick={() => setEditingPackage(pkg)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPackage && (
        <EditPackageModal
          package={editingPackage}
          onClose={() => setEditingPackage(null)}
          onSave={handleSavePackage}
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <EditPackageModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSavePackage}
        />
      )}

      {/* View Details Modal */}
      {viewingPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{viewingPackage.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{viewingPackage.description}</p>
              </div>
              <button
                onClick={() => setViewingPackage(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-600">×</span>
              </button>
            </div>

            <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
              <div className="space-y-6">
                {/* Package Summary */}
                <Card className={`bg-gradient-to-br ${viewingPackage.gradient} text-white border-0`}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-white/80 text-xs mb-1">Monthly</p>
                      <p className="font-bold text-lg">₦{viewingPackage.monthlyAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-white/80 text-xs mb-1">Yearly Total</p>
                      <p className="font-bold text-lg">₦{viewingPackage.yearlyTotal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-white/80 text-xs mb-1">Retail Value</p>
                      <p className="font-bold text-lg">₦{viewingPackage.estimatedRetailValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-white/80 text-xs mb-1">Savings</p>
                      <p className="font-bold text-lg">{viewingPackage.savingsPercent}%</p>
                    </div>
                  </div>
                </Card>

                {/* Detailed Benefits */}
                {viewingPackage.detailedBenefits && viewingPackage.detailedBenefits.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Package Contents & Pricing</h3>
                    <div className="space-y-2">
                      {viewingPackage.detailedBenefits.map((benefit, index) => (
                        <Card key={index} className="bg-slate-50 border-slate-200">
                          <div className="mb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{benefit.item}</h4>
                                <p className="text-sm text-gray-600">{benefit.quantity} {benefit.unit}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-emerald-600">₦{benefit.totalRetailPrice.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Total retail</p>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200">
                            <div className="p-2 bg-white rounded-lg">
                              <p className="text-xs text-gray-500">Retail/{benefit.unit}</p>
                              <p className="text-sm font-semibold text-gray-900">₦{benefit.retailPricePerUnit.toLocaleString()}</p>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg">
                              <p className="text-xs text-purple-700">Savings/{benefit.unit}</p>
                              <p className="text-sm font-semibold text-purple-700">₦{benefit.savingsPricePerUnit.toLocaleString()}</p>
                            </div>
                          </div>
                        </Card>
                      ))}

                      {/* Total */}
                      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-gray-900">Total Retail Value</h4>
                            <p className="text-sm text-gray-600">vs. ₦{viewingPackage.yearlyTotal.toLocaleString()} paid</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-600">₦{viewingPackage.estimatedRetailValue.toLocaleString()}</p>
                            <p className="text-sm font-semibold text-purple-600">Save ₦{viewingPackage.savings.toLocaleString()}</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setViewingPackage(null);
                  setEditingPackage(viewingPackage);
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-lg shadow-purple-500/30"
              >
                Edit This Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}