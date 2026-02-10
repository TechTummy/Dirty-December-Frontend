import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, Clock, Download, X, MapPin, Save, Plus, Edit2, Trash2, Calendar, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../components/Card';
import { GradientButton } from '../../components/GradientButton';
import { admin } from '../../../lib/api';
import { useQuery, useMutation } from '@tanstack/react-query';

interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  package: string;
  status: string;
  contributions: number;
  totalPaid: number;
  joinedDate: string;
  deliveryType?: 'pickup' | 'delivery';
  delivery_method?: string;
  street_address?: string;
  state?: string;
  city?: string;
  deliveryAddress?: string;
  deliveryState?: string;
  deliveryLga?: string;
  quantity?: number;
  packageId?: string | number;
  isReceived?: boolean;
  receivedAt?: string;
  receivedPhoto?: string;
}



export function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPackage, setFilterPackage] = useState('all');
  const [filterPaymentMonth, setFilterPaymentMonth] = useState('all');
  const [filterPaymentYear, setFilterPaymentYear] = useState('all');
  const [filterCompletedPayments, setFilterCompletedPayments] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    package_id: '' as string | number,
    status: 'active',
    quantity: 1
  });
  
  // Pagination State
  const [page, setPage] = useState(1);
  // Debounce Search Term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [perPage, setPerPage] = useState(15);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterPackage, filterPaymentMonth, filterPaymentYear, filterCompletedPayments, debouncedSearchTerm]);

  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['adminUsers', page, perPage, filterStatus, filterPackage, filterPaymentMonth, filterPaymentYear, filterCompletedPayments, debouncedSearchTerm],
    queryFn: () => admin.getUsers({ 
      page, 
      per_page: perPage,
      status: filterStatus !== 'all' ? filterStatus : undefined,
      package_id: filterPackage !== 'all' ? filterPackage : undefined,
      payment_month: filterPaymentMonth !== 'all' ? Number(filterPaymentMonth) : undefined,
      payment_year: filterPaymentYear !== 'all' ? Number(filterPaymentYear) : undefined,
      completed_payments: filterCompletedPayments ? true : undefined,
      search: debouncedSearchTerm || undefined
    }),
  });

  const { data: packagesData } = useQuery({
    queryKey: ['adminPackages'],
    queryFn: admin.getPackages,
  });

  const packages = packagesData?.data?.data || packagesData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => admin.createUser({
      ...data,
      slots: data.quantity
    }),
    onSuccess: () => {
      toast.success('User created successfully');
      refetch();
    },
    onError: (error: any) => {
      console.error(error);
      const validationError = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat()[0] 
        : null;
      toast.error(validationError || error.response?.data?.message || 'Failed to create user. Please try again.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, data: any }) => {
      const payload = {
        ...data.data,
        slots: data.data.quantity
      };
      // Only include password if it's been set (non-empty)
      if (!payload.password) {
        delete payload.password;
      }
      return admin.updateUser(data.id, payload);
    },
    onSuccess: () => {
      toast.success('User updated successfully');
      refetch();
    },
    onError: (error: any) => {
      console.error(error);
      const validationError = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat()[0] 
        : null;
      toast.error(validationError || error.response?.data?.message || 'Failed to update user. Please try again.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: admin.deleteUser,
    onSuccess: () => {
      toast.success('User deleted successfully');
      refetch();
    },
    onError: (error: any) => {
      console.error(error);
      const validationError = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat()[0] 
        : null;
      toast.error(validationError || error.response?.data?.message || 'Failed to delete user');
    }
  });

  // API returns paginated response: { data: { data: [...], current_page: 1, ... } }
  // The structure is typically: response.data.data (array) and response.data (meta)
  // But our api.ts returns response.data, so usersData IS the full object containing { data: [...], ... }
  
  const rawUsersList = Array.isArray(usersData?.data?.data) 
    ? usersData.data.data 
    : (Array.isArray(usersData?.data) ? usersData.data : []);

  // Deduplicate users by ID to prevent "same key" errors if backend returns duplicates
  const rawUsers = Array.from(new Map(rawUsersList.map((item: any) => [item.id, item])).values());

  const paginationMeta = usersData?.data ? {
    current_page: usersData.data.current_page || 1,
    last_page: usersData.data.last_page || 1,
    total: usersData.data.total || 0,
    from: usersData.data.from || 0,
    to: usersData.data.to || 0,
    per_page: usersData.data.per_page || 15
  } : null;

  const users: User[] = rawUsers.map((u: any) => {
    // Parse amounts (API returns strings like "5000.00")
    const monthlyContribution = Number(u.package?.monthly_contribution || 5000);
    const totalContribution = Number(u.total_contribution || 0);
    const slots = u.slots || 1;
    
    // Calculate contributions count based on amount paid vs monthly expectation (considering slots)
    // E.g. Paid 500k, Monthly 50k, 5 slots => 500k / (50k * 5) = 2 months
    const monthlyTotalExpected = monthlyContribution * slots;
    const contributionsCount = monthlyTotalExpected > 0 
      ? Math.floor(totalContribution / monthlyTotalExpected) 
      : 0;

    return {
      id: u.id,
      name: u.name,
      phone: u.phone,
      email: u.email,
      package: u.package?.name || 'No Package',
      packageId: u.package_id || u.package?.id,
      status: u.status || 'active', 
      contributions: contributionsCount,
      totalPaid: totalContribution,
      joinedDate: new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      quantity: u.slots || 1,
      // Update mapping to use delivery_detail instead of delivery_settings
      // Update mapping to use delivery_detail or delivery_method directly
      deliveryType: (u.delivery_detail?.type === 'delivery' || u.delivery_method === 'delivery') ? 'delivery' : 'pickup', 
      deliveryAddress: u.delivery_detail?.street_address || u.street_address || '',
      deliveryState: u.delivery_detail?.state || u.state || '',
      deliveryLga: u.delivery_detail?.city || u.city || '', // API docs/response show 'city' in delivery_detail, mapped to LGA for now or City
      isReceived: u.delivery_detail?.is_received || false,
      receivedAt: u.delivery_detail?.received_at,
      receivedPhoto: u.delivery_detail?.received_photo ? `https://api.dettydecember.adeshinaotutuloro.com/storage/${u.delivery_detail.received_photo}` : undefined
    };
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        );
      case 'suspended':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <X className="w-3 h-3" />
            Suspended
          </span>
        );
      case 'reserved':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3" />
            Reserved
          </span>
        );
      default: // inactive or unknown
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            <Ban className="w-3 h-3" />
            {status === 'inactive' ? 'Inactive' : status}
          </span>
        );
    }
  };

  const getPackageBadge = (packageName: string) => {
    const colors = {
      'Basic Bundle': 'bg-purple-100 text-purple-700',
      'Family Bundle': 'bg-emerald-100 text-emerald-700',
      'Premium Bundle': 'bg-amber-100 text-amber-700'
    };
    return colors[packageName as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Name', 'Phone', 'Email', 'Package', 'Status', 'Contributions', 'Total Paid', 'Joined Date'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => 
        [user.name, user.phone, user.email, user.package, user.status, `${user.contributions}/12`, user.totalPaid, user.joinedDate].join(',')
      )
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter users
  // Note: All filtering is now done Server-Side via API params (status, package, search, etc.)
  // We simply display the returned users directly.
  const filteredUsers = users;

  const handleAddUser = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      package_id: packages[0]?.id || '', // Default to first package ID
      status: 'active',
      quantity: 1 // Default quantity
    });
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setFormData({
      name: user.name,
      phone: user.phone,
      email: user.email,
      password: '',
      package_id: user.packageId || '',
      status: user.status,
      quantity: user.quantity || 1 // Default quantity
    });
    setEditingUser(user);
    setShowModal(true);
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
    setEditingUser(null);
  };

  const handleSaveUser = () => {
    if (editingUser) {
        updateMutation.mutate({
            id: editingUser.id,
            data: formData
        });
    } else {
        createMutation.mutate(formData);
    }
    setShowModal(false);
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
        deleteMutation.mutate(userId);
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-500 mt-1">
            {paginationMeta?.total ? paginationMeta.total : filteredUsers.length} registered users
          </p>
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
              Add User
            </span>
          </GradientButton>
        </div>
      </div>
      
      {/* Filters & View Toggle */}
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

            {/* Payment Month Filter */}
            <div className="w-full lg:w-48">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterPaymentMonth}
                  onChange={(e) => setFilterPaymentMonth(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">All Months</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Payment Year Filter */}
            <div className="w-full lg:w-48">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterPaymentYear}
                  onChange={(e) => setFilterPaymentYear(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">All Years</option>
                  {[2025, 2026, 2027].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Completed Payments Toggle */}
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="completedPayments"
                checked={filterCompletedPayments}
                onChange={(e) => setFilterCompletedPayments(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="completedPayments" className="text-sm font-medium text-gray-700">
                Completed Payments Only
              </label>
            </div>
            
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="reserved">Reserved</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                  {packages.map((pkg: any) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Showing {filteredUsers.length} of {users.length} users
            </span>
          </div>
        </div>
      </Card>

      {/* Table View */}
      <Card className="border-0 shadow-lg overflow-hidden">
        {/* Mobile: Stacked table cards */}
        <div className="lg:hidden space-y-4 p-4 bg-slate-50/50">
          {isLoading && (
            [...Array(3)].map((_, i) => (
              <div key={i} className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          )}
          {!isLoading && filteredUsers.map((user) => (
            <div key={user.id} className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/20">
                    <span className="text-white font-bold text-lg">{user.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <h3 className="font-bold text-gray-900">{user.name}</h3>
                       {user.isReceived && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-100">
                            <CheckCircle className="w-2.5 h-2.5" />
                            Received
                          </span>
                       )}
                    </div>
                    <p className="text-sm text-gray-500">{user.phone}</p>
                  </div>
                </div>
                {getStatusBadge(user.status)}
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Package</span>
                  <span className="font-medium text-gray-900">{user.package} ({user.quantity} slots)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Paid</span>
                  <span className="font-bold text-emerald-600">₦{user.totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-700">{user.contributions}/12 months</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    style={{ width: `${Math.min((user.contributions / 12) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                <button 
                  onClick={() => handleViewUser(user)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button 
                  onClick={() => handleEditUser(user)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteUser(user.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Paid</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading && (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20 ml-auto"></div></td>
                  </tr>
                ))
              )}
              {!isLoading && filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/30 flex-shrink-0">
                        <span className="text-white font-bold text-sm">{user.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 text-sm whitespace-nowrap">{user.name}</p>
                          {user.isReceived && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-100">
                              <CheckCircle className="w-2.5 h-2.5" />
                              Received
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 whitespace-nowrap">{user.phone}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-block w-fit px-2 py-1 rounded-full text-xs font-medium ${getPackageBadge(user.package)}`}>
                        {user.package}
                      </span>
                      {user.quantity && user.quantity > 1 && (
                        <span className="text-xs text-gray-500 font-medium">{user.quantity} slots</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all"
                          style={{ width: `${Math.min((user.contributions / 12) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 whitespace-nowrap">{user.contributions}/12</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-emerald-600 text-sm whitespace-nowrap">₦{user.totalPaid.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 whitespace-nowrap">{user.joinedDate}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {/* <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Empty State */}
      {!isLoading && filteredUsers.length === 0 && (
        <Card className="border-0 shadow-md text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">No users found</h3>
          <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
        </Card>
      )}

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
              disabled={page === 1 || isLoading}
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
              disabled={!paginationMeta || page >= paginationMeta.last_page || isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>

      {/* Add/Edit User Modal */}
      {showModal && !viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingUser ? 'Update user information and settings' : 'Create a new user account'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
              <div className="space-y-6">
                {/* Personal Information */}
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
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                      </label>
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

                {/* Account Settings */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <span className="text-white text-sm">⚙️</span>
                    </div>
                    Account Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Package</label>
                      <select
                        value={formData.package_id}
                        onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                      >
                        <option value="">Select Package</option>
                        {packages.map((pkg: any) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Quantity (Slots)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Number of people they're paying for</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                      >
                        <option value="active">Active</option>
                        <option value="reserved">Reserved</option>
                        <option value="suspended">Suspended</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
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
                  {editingUser ? 'Update User' : 'Add User'}
                </span>
              </GradientButton>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
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

            {/* Content */}
            <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
              <div className="space-y-6">
                {/* Contact Information */}
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

                {/* Account Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <span className="text-white text-sm">⚙️</span>
                    </div>
                    Account Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Package</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPackageBadge(viewingUser.package)}`}>
                        {viewingUser.package}
                      </span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Quantity (Slots)</p>
                      <p className="font-semibold text-gray-900">{viewingUser.quantity || 1} {(viewingUser.quantity || 1) === 1 ? 'person' : 'people'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      {getStatusBadge(viewingUser.status)}
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Joined Date</p>
                      <p className="font-semibold text-gray-900">{viewingUser.joinedDate}</p>
                    </div>
                  </div>
                </div>

                {/* Contribution Stats */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-sm">💰</span>
                    </div>
                    Contribution Statistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                      <p className="text-xs text-purple-700 mb-1">Contributions Made</p>
                      <p className="text-2xl font-bold text-purple-900">{viewingUser.contributions}/12</p>
                      <div className="mt-2 w-full h-2 bg-purple-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                          style={{ width: `${(viewingUser.contributions / 12) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <p className="text-xs text-emerald-700 mb-1">Total Paid</p>
                      <p className="text-2xl font-bold text-emerald-900">₦{viewingUser.totalPaid.toLocaleString()}</p>
                      <p className="text-xs text-emerald-600 mt-1">Payment Status: On Track</p>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    Delivery Information
                  </h3>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs text-amber-700 mb-2">Delivery Method</p>
                    <p className="font-semibold text-gray-900 mb-4">
                      {viewingUser.deliveryType === 'delivery' ? 'Home Delivery' : 'Pickup at Collection Point'}
                    </p>
                    {viewingUser.deliveryType === 'delivery' && viewingUser.deliveryAddress && (
                      <>
                        <p className="text-xs text-amber-700 mb-1">Delivery Address</p>
                        <p className="font-medium text-gray-900">{viewingUser.deliveryAddress}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {viewingUser.deliveryLga && `${viewingUser.deliveryLga}, `}{viewingUser.deliveryState}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Package Receipt - Only if received */}
                {viewingUser.isReceived && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                       <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                       </div>
                       Package Receipt
                    </h3>
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                       <div className="flex items-center justify-between mb-4">
                          <span className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full">
                             <CheckCircle className="w-4 h-4" />
                             VERIFIED RECEIVED
                          </span>
                          {viewingUser.receivedAt && (
                             <span className="text-sm text-emerald-700">
                                {new Date(viewingUser.receivedAt).toLocaleDateString()}
                             </span>
                          )}
                       </div>
                       
                       {viewingUser.receivedPhoto ? (
                          <div className="mt-4">
                             <p className="text-xs text-emerald-700 mb-2 font-medium">Verification Photo</p>
                             <div className="relative rounded-lg overflow-hidden border border-emerald-200 aspect-video max-w-sm">
                                <img 
                                   src={viewingUser.receivedPhoto} 
                                   alt="Package Verification" 
                                   className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                                   <a 
                                      href={viewingUser.receivedPhoto} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="px-4 py-2 bg-white rounded-lg shadow-lg text-sm font-bold text-gray-900"
                                   >
                                      View Full Size
                                   </a>
                                </div>
                             </div>
                          </div>
                       ) : (
                          <p className="text-sm text-gray-500 italic mt-2">No verification photo attached</p>
                       )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 transition-opacity font-semibold shadow-lg shadow-purple-500/30"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}