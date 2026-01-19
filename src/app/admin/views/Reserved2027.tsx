import { useState } from 'react';
import { Search, Filter, Eye, Edit, Calendar, Plus, Download, X, MapPin, Save, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/Card';
import { GradientButton } from '../../components/GradientButton';
import { admin } from '../../../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ReservedUser {
  id: number;
  name: string;
  phone: string;
  email: string;
  package: string;
  packageId?: string | number;
  reservationDate: string;
  deliveryType?: 'pickup' | 'delivery';
  delivery_method?: string;
  street_address?: string;
  state?: string;
  city?: string;
  deliveryAddress?: string;
  deliveryState?: string;
  deliveryLga?: string;
  status?: string;
}

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

export function Reserved2027() {
  const nextYear = new Date().getFullYear() + 1;
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const { data: usersData, isLoading: isUsersLoading, refetch } = useQuery({
    queryKey: ['adminReservedUsers', page, perPage],
    queryFn: () => admin.getReservedUsers({ page, per_page: perPage }),
  });

  const { data: packagesData } = useQuery({
    queryKey: ['adminPackages'],
    queryFn: admin.getPackages,
  });

  const packages = packagesData?.data?.data || packagesData?.data || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPackage, setFilterPackage] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<ReservedUser | null>(null);
  const [viewingUser, setViewingUser] = useState<ReservedUser | null>(null);
  const [confirmActivationUser, setConfirmActivationUser] = useState<ReservedUser | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    package: packages.length > 0 ? packages[0].name : 'Basic Bundle',
    package_id: packages.length > 0 ? packages[0].id : '',
    status: 'reserved'
  });

  const rawUsers = Array.isArray(usersData?.data?.data) 
    ? usersData.data.data 
    : (Array.isArray(usersData?.data) ? usersData.data : []);

  const paginationMeta = usersData?.data ? {
    current_page: usersData.data.current_page || 1,
    last_page: usersData.data.last_page || 1,
    total: usersData.data.total || 0,
    from: usersData.data.from || 0,
    to: usersData.data.to || 0,
    per_page: usersData.data.per_page || 15
  } : null;

  const reservedUsers: ReservedUser[] = rawUsers.map((u: any) => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      email: u.email,
      package: u.package?.name || 'No Package',
      packageId: u.package_id || u.package?.id,
      reservationDate: new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      deliveryType: (u.delivery_detail?.type === 'delivery' || u.delivery_method === 'delivery') ? 'delivery' : 'pickup',
      deliveryAddress: u.delivery_detail?.street_address || u.street_address || '',
      deliveryState: u.delivery_detail?.state || u.state || '',
      deliveryLga: u.delivery_detail?.city || u.city || ''
    }));

  const createMutation = useMutation({
    mutationFn: (data: any) => admin.createUser({ ...data, status: 'reserved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReservedUsers'] });
      toast.success('Reservation added successfully');
      setShowModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add reservation');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, data: any }) => {
      const payload = { ...data.data };
      if (!payload.password) {
        delete payload.password;
      }
      return admin.updateUser(data.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReservedUsers'] });
      toast.success('Reservation updated successfully');
      setShowModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update reservation');
    }
  });

  const getPackageBadge = (packageName: string) => {
    const colors = {
      'Basic Bundle': 'bg-purple-100 text-purple-700',
      'Family Bundle': 'bg-emerald-100 text-emerald-700',
      'Premium Bundle': 'bg-amber-100 text-amber-700'
    };
    return colors[packageName as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const filteredUsers = reservedUsers.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPackage = filterPackage === 'all' || user.package === filterPackage;
    
    return matchesSearch && matchesPackage;
  });

  const handleExport = () => {
    const headers = ['Name', 'Phone', 'Email', 'Package', 'Reservation Date'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => 
        [user.name, user.phone, user.email, user.package, user.reservationDate].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reserved-${nextYear}-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ... handlers ...
  const handlePackageChange = (e: any) => {
    const selectedPkg = packages.find((p: any) => p.id == e.target.value);
    setFormData({ 
      ...formData, 
      package_id: e.target.value,
      package: selectedPkg?.name || 'Basic Bundle'
    });
  };

  const handleAddUser = () => {
    // Default to first package if available
    const firstPkg = packages[0];
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      package: firstPkg?.name || 'Basic Bundle',
      package_id: firstPkg?.id || '',
      status: 'reserved'
    });
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user: ReservedUser) => {
    setFormData({
      name: user.name,
      phone: user.phone,
      email: user.email,
      password: '',
      package: user.package,
      package_id: user.packageId || '',
      status: user.status || 'reserved'
    });
    setEditingUser(user);
    setShowModal(true);
  };

  const handleActivateUser = (user: ReservedUser) => {
    setConfirmActivationUser(user);
  };

  const handleConfirmActivation = () => {
    if (confirmActivationUser) {
      updateMutation.mutate({
        id: confirmActivationUser.id,
        data: {
          status: 'active'
        }
      });
      setConfirmActivationUser(null);
    }
  };

  const handleViewUser = (user: ReservedUser) => {
    setViewingUser(user);
    setEditingUser(null);
  };

  const handleSaveUser = () => {
    // Basic mapping of package name to ID for the API (if needed)
    // Ideally we should use package ID in the form, similar to UsersManagement
    // For now, assuming backend might handle name or we should map it.
    // Let's rely on UsersManagement approach: form should use package_id.
    // But this file uses package name strings in formData. 
    // I will stick to what UsersManagement did: using package_id.
    
    // NOTE: Refactoring formData to use package_id is better, but to minimize diffs 
    // and since I don't have the packages list fetched here yet, I'll fetch packages too.
    
    // Actually, I'll quickly check if I can just pass the package ID.
    // The current formData has 'package' string. I should change it to package_id.
    // But wait, the replaced code is already simpler. I will assume I need to fetch packages to get IDs.
    
    // Let's create the payload.
    // I need to fetch packages to map the selected name back to an ID? 
    // Or simpler: Update the form to use package_id like UsersManagement.
    // For this step, I'll assume the form inputs will be updated in a subsequent step or I need to do it now.
    
    // I'll do it right now in the *next* tool call for the imports and form structure.
    // This tool call just replaces the state/handlers logic.
    
    // WAIT: I cannot access 'packages' here yet.
    // I should probably pass 'package_id' in formData.
    
    // Let's proceed with this replacement which sets up the hooks, 
    // and I'll clean up the form logic in the next step.
    
    if (editingUser) {
        updateMutation.mutate({
            id: editingUser.id,
            data: {
                ...formData,
                // Make sure to map package name to ID or use ID if I change the form
                // For now, sending as is, but I will fix the form in next step
            }
        });
    } else {
        createMutation.mutate({
            ...formData,
        });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reserved for {nextYear}</h1>
          <p className="text-gray-500 mt-1">{filteredUsers.length} users reserved for next year</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
          >
            <Download className="w-4 h-4" />
            <span className="font-medium text-sm">Export</span>
          </button>
          <GradientButton onClick={handleAddUser}>
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Reservation
            </span>
          </GradientButton>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{nextYear} Reservations</h3>
            <p className="text-sm text-gray-600">
              Users listed here have reserved their spots for the {nextYear} cycle. They will begin making contributions in January {nextYear}.
            </p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Package Filter */}
            <div className="w-full lg:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterPackage}
                  onChange={(e) => setFilterPackage(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">All Packages</option>
                  <option value="Basic Bundle">Basic Bundle</option>
                  <option value="Family Bundle">Family Bundle</option>
                  <option value="Premium Bundle">Premium Bundle</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Showing {filteredUsers.length} of {reservedUsers.length} reservations
            </span>
          </div>
        </div>
      </Card>

      {/* Table View */}
      <Card className="border-0 shadow-lg overflow-hidden">
        {/* Mobile: Stacked table cards */}
        <div className="lg:hidden space-y-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4 bg-slate-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/30">
                    <span className="text-white font-bold text-sm">{user.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{user.name}</h3>
                    <p className="text-xs text-gray-500">{user.phone}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  <Calendar className="w-3 h-3" />
                  2027
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Package: </span>
                  <span className="font-medium text-gray-900">{user.package}</span>
                </div>
                <div>
                  <span className="text-gray-500">Reserved: </span>
                  <span className="font-medium text-gray-900">{user.reservationDate}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => handleViewUser(user)}
                  className="flex-1 text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors font-medium"
                >
                  View
                </button>
                <button 
                  onClick={() => handleEditUser(user)}
                  className="flex-1 text-xs px-3 py-1.5 bg-slate-100 text-gray-700 rounded hover:bg-slate-200 transition-colors font-medium"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleActivateUser(user)}
                  className="flex-1 text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition-colors font-medium flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Activate
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Full table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Package</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reservation Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Delivery Type</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/30 flex-shrink-0">
                        <span className="text-white font-bold text-sm">{user.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{user.phone}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPackageBadge(user.package)}`}>
                      {user.package}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-gray-600">{user.reservationDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {user.deliveryType === 'delivery' ? 'Home Delivery' : 'Pickup'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-gray-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleActivateUser(user)}
                        title="Activate User"
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="border-t border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {paginationMeta ? (
              <span>
                Showing <span className="font-medium text-gray-900">{paginationMeta.from}</span> to <span className="font-medium text-gray-900">{paginationMeta.to}</span> of <span className="font-medium text-gray-900">{paginationMeta.total}</span> results
              </span>
            ) : (
              <span>Showing all {filteredUsers.length} results</span>
            )}
            
            <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
              <span>Rows per page:</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1); // Reset to first page on change
                }}
                className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-1"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isUsersLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
               {Array.from({ length: Math.min(5, paginationMeta?.last_page || 1) }, (_, i) => {
                  let pNum = i + 1;
                  if (paginationMeta && paginationMeta.last_page > 5) {
                     if (page > 3) pNum = page - 2 + i;
                     if (pNum > paginationMeta.last_page) pNum = paginationMeta.last_page - (4 - i);
                  }
                  
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        page === pNum
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
               })}
            </div>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!paginationMeta || page >= paginationMeta.last_page || isUsersLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <Card className="border-0 shadow-md text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">No reservations found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
        </Card>
      )}

      {/* Add/Edit Modal - Same structure as UsersManagement */}
      {showModal && !viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingUser ? 'Edit Reservation' : 'Add 2027 Reservation'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingUser ? 'Update reservation details' : 'Reserve a spot for 2027 cycle'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-sm">👤</span>
                    </div>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
                      <input
                        type="text"
                        placeholder="080 1234 5678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                      <input
                        type="email"
                        placeholder="user@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
                      <input
                        type="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <span className="text-white text-sm">📦</span>
                    </div>
                    Package Selection
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Package</label>
                    <select
                      value={formData.package_id}
                      onChange={handlePackageChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      <option value="">Select Package</option>
                      {packages.map((pkg: any) => (
                        <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status Field */}
                {editingUser && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      Account Status
                    </h3>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                      >
                        <option value="reserved">Reserved</option>
                        <option value="active">Active</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-2">
                        Changing status to "Active" will move this user to the main Users Management list.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <GradientButton onClick={handleSaveUser}>
                <span className="flex items-center gap-2 px-4">
                  <Save className="w-4 h-4" />
                  {editingUser ? 'Update Reservation' : 'Add Reservation'}
                </span>
              </GradientButton>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal - Similar to UsersManagement */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <span className="text-white text-xl font-bold">{viewingUser.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{viewingUser.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{viewingUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-sm">👤</span>
                    </div>
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                      <p className="font-semibold text-gray-900">{viewingUser.phone}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Email Address</p>
                      <p className="font-semibold text-gray-900">{viewingUser.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    Reservation Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-xs text-amber-700 mb-1">Package</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPackageBadge(viewingUser.package)}`}>
                        {viewingUser.package}
                      </span>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-xs text-amber-700 mb-1">Reservation Date</p>
                      <p className="font-semibold text-gray-900">{viewingUser.reservationDate}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    Delivery Information
                  </h3>
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-xs text-emerald-700 mb-2">Delivery Method</p>
                    <p className="font-semibold text-gray-900 mb-4">
                      {viewingUser.deliveryType === 'delivery' ? 'Home Delivery' : 'Pickup at Collection Point'}
                    </p>
                    {viewingUser.deliveryType === 'delivery' && viewingUser.deliveryAddress && (
                      <>
                        <p className="text-xs text-emerald-700 mb-1">Delivery Address</p>
                        <p className="font-medium text-gray-900">{viewingUser.deliveryAddress}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {viewingUser.deliveryLga && `${viewingUser.deliveryLga}, `}{viewingUser.deliveryState}
                        </p>
                      </>
                    )}
                  </div>
              </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Close
              </button>
              <GradientButton onClick={() => {
                handleEditUser(viewingUser);
                setViewingUser(null);
              }}>
                <span className="flex items-center gap-2 px-4">
                  <Edit className="w-4 h-4" />
                  Edit Reservation
                </span>
              </GradientButton>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmActivationUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Activate User?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to activate <span className="font-semibold text-gray-900">{confirmActivationUser.name}</span>? 
              This will move them from the reserved list to the active users list.
            </p>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmActivationUser(null)}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmActivation}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold shadow-lg shadow-emerald-500/30"
              >
                Confirm Activation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
