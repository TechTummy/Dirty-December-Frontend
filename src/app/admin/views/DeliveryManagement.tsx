import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, X, Save, AlertCircle, Loader, Truck } from 'lucide-react';
import { admin } from '../../../lib/api';
import { toast } from 'sonner';
import { Card } from '../../components/Card';
import { GradientButton } from '../../components/GradientButton';

interface DeliveryFee {
  id: number;
  state: string;
  fee: number;
}

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

export function DeliveryManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<DeliveryFee | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    state: '',
    fee: ''
  });

  const queryClient = useQueryClient();

  // Fetch Fees
  const { data: feesData, isLoading } = useQuery({
    queryKey: ['delivery_fees'],
    queryFn: admin.getDeliveryFees,
  });

  const fees = Array.isArray(feesData?.data) ? feesData.data : [];

  // Filter fees
  const filteredFees = fees.filter((fee: DeliveryFee) => 
    fee.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mutations
  const createMutation = useMutation({
    mutationFn: admin.createDeliveryFee,
    onSuccess: () => {
      toast.success('Delivery fee added successfully');
      queryClient.invalidateQueries({ queryKey: ['delivery_fees'] });
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add delivery fee');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => admin.updateDeliveryFee(id, data),
    onSuccess: () => {
      toast.success('Delivery fee updated successfully');
      queryClient.invalidateQueries({ queryKey: ['delivery_fees'] });
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update delivery fee');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: admin.deleteDeliveryFee,
    onSuccess: () => {
      toast.success('Delivery fee deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['delivery_fees'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete delivery fee');
    }
  });

  const handleOpenModal = (fee?: DeliveryFee) => {
    if (fee) {
      setEditingFee(fee);
      setFormData({
        state: fee.state,
        fee: fee.fee.toString()
      });
    } else {
      setEditingFee(null);
      setFormData({
        state: '',
        fee: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFee(null);
    setFormData({ state: '', fee: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.state || !formData.fee) {
      toast.error('Please fill in all fields');
      return;
    }

    const payload = {
      state: formData.state,
      fee: Number(formData.fee)
    };

    if (editingFee) {
      updateMutation.mutate({ id: editingFee.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this delivery fee?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Fees</h1>
          <p className="text-gray-500">Manage delivery charges per state</p>
        </div>
        <GradientButton onClick={() => handleOpenModal()}>
          <Plus className="w-5 h-5 mr-2" />
          Add Fee
        </GradientButton>
      </div>

      {/* Search and Table */}
      <Card className="p-0 overflow-hidden border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">State</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery Fee</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading delivery fees...
                  </td>
                </tr>
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Truck className="w-6 h-6 text-gray-400" />
                    </div>
                    No delivery fees found
                  </td>
                </tr>
              ) : (
                filteredFees.map((item: DeliveryFee) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{item.state}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">₦{Number(item.fee).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingFee ? 'Edit Delivery Fee' : 'Add Delivery Fee'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                  required
                >
                    <option value="" disabled>Select a state</option>
                    {nigerianStates.map((state) => (
                        <option key={state} value={state}>
                            {state}
                        </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Fee Amount (₦)
                </label>
                <input
                  type="number"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                  placeholder="e.g. 2500"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  min="0"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <GradientButton 
                  type="submit" 
                  className="flex-1"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                   {createMutation.isPending || updateMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                   ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Fee
                    </span>
                   )}
                </GradientButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
