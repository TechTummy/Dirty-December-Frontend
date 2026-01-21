import { useState } from 'react';
import { Users, DollarSign, TrendingUp, Calendar, ArrowLeft, Search, Eye, Ban, CheckCircle, Clock, MapPin, Truck, X, Receipt, Loader } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/Card';
import { admin } from '../../../lib/api';

interface PackageDetailsViewProps {
  packageId: string;
  onBack: () => void;
  onViewContributions?: (packageId: string) => void;
}

export function PackageDetailsView({ packageId, onBack, onViewContributions }: PackageDetailsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDelivery, setFilterDelivery] = useState('all');
  const [selectedUserAddress, setSelectedUserAddress] = useState<any | null>(null);
  const [viewingUser, setViewingUser] = useState<any | null>(null);

  // Get the specific package from API
  const { data: packageApiResponse, isLoading: isLoadingPackage } = useQuery({
    queryKey: ['package', packageId],
    queryFn: () => admin.getPackageById(packageId),
  });

  const packageData: any = packageApiResponse?.data;

  // Fetch users for this package
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => admin.getUsers(),
  });

  // Fetch transactions for this package to calculate totals
  const { data: transactionsData } = useQuery({
    queryKey: ['admin-package-transactions', packageId],
    queryFn: () => admin.getTransactions({ package_id: packageId }),
  });

  if (isLoadingPackage || isLoadingUsers) {
    return (
      <div className="flex bg-slate-50 min-h-screen items-center justify-center">
         <Loader className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Package not found</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">Go Back</button>
      </div>
    );
  }

  // Normalize package data for display (handle API vs static structure differences if any)
  // Assuming API returns similar structure or we adapt here.
  // For now, let's map essential UI fields if they differ, but based on PackagesManagement, they are similar.
  // We might need to add fallback for gradient/shadow if API doesn't send them yet.
  const displayPackage = {
    ...packageData,
    gradient: packageData.gradient || 'from-indigo-500 via-purple-500 to-pink-500',
    shadowColor: packageData.shadow_color || 'shadow-purple-500/30',
    monthlyAmount: Number(packageData.monthly_contribution) || Number(packageData.price) || packageData.monthlyAmount || 0,
    yearlyTotal: Number(packageData.yearly_contribution) || (Number(packageData.price) || 0) * 12,
    name: packageData.name,
    description: packageData.description
  };

  const packageTransactions = transactionsData?.data?.data || transactionsData?.data || [];
  const realTotalContributions = Array.isArray(packageTransactions) 
    ? packageTransactions
        .filter((t: any) => t.status === 'approved' || t.status === 'confirmed')
        .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0)
    : 0;

  // Filter users for this package
  const allUsers = (usersData?.data?.data || []).map((u: any) => ({
    id: u.id,
    name: u.name,
    phone: u.phone,
    email: u.email,
    package: u.package?.name || 'No Package',
    packageId: u.package_id?.toString(),
    status: u.status || 'active',
    // Calculate contributions from user data
    contributions: u.package?.monthly_contribution 
      ? Math.floor(Number(u.total_contribution || 0) / (Number(u.package.monthly_contribution) * (u.slots || 1))) 
      : 0,
    totalPaid: Number(u.total_contribution || 0),
    joinedDate: new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    deliveryMethod: u.delivery_detail ? 'delivery' : 'pickup',
    deliveryAddress: u.delivery_detail ? {
      address: u.delivery_detail.street_address,
      city: u.delivery_detail.city || u.delivery_detail.lga || '',
      state: u.delivery_detail.state,
      landmark: u.delivery_detail.landmark,
      phoneNumber: u.delivery_detail.phone_number || u.phone
    } : null
  })).filter((u: any) => u.packageId === packageId);

  // Calculate package stats from real data
  const totalUsers = packageData.stats?.total_users ?? allUsers.length;
  const activeUsers = allUsers.filter((u: any) => u.status === 'active').length;
  
  // Use transaction sum if available, otherwise sum from user records
  const totalContributions = packageData.stats?.total_contributions ?? (
    realTotalContributions > 0 
      ? realTotalContributions 
      : allUsers.reduce((sum: number, user: any) => sum + user.totalPaid, 0)
  );
  
  const expectedTotal = packageData.stats?.expected_total ?? (allUsers.length * displayPackage.yearlyTotal); 
  
  const avgMonthsContributed = packageData.stats?.avg_months_paid ?? (
    totalUsers > 0 
      ? allUsers.reduce((sum: number, user: any) => sum + user.contributions, 0) / totalUsers 
      : 0
  );
    
  const completionRate = packageData.stats?.progress_percentage ?? (
    expectedTotal > 0 ? (totalContributions / expectedTotal) * 100 : 0
  );

  // Filter logic
  const filteredUsers = allUsers.filter((user: any) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesDelivery = filterDelivery === 'all' || user.deliveryMethod === filterDelivery;
    return matchesSearch && matchesStatus && matchesDelivery;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
          <CheckCircle className="w-3 h-3" />
          Active
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
        <Clock className="w-3 h-3" />
        Reserved
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      {/* Package Header */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${displayPackage.gradient} p-8 shadow-xl ${displayPackage.shadowColor}`}>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              {displayPackage.badge && (
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-white mb-3">
                  {displayPackage.badge}
                </div>
              )}
              <h1 className="text-3xl font-bold text-white mb-2">{displayPackage.name}</h1>
              <p className="text-white/90 text-lg">₦{displayPackage.monthlyAmount.toLocaleString()}/month</p>
            </div>
          </div>
          <p className="text-white/80 max-w-2xl">{displayPackage.description}</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${displayPackage.gradient} flex items-center justify-center shadow-lg ${displayPackage.shadowColor}`}>
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{totalUsers}</h3>
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-xs text-emerald-600 mt-1">{activeUsers} active</p>
        </Card>

        <Card className="border-0 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₦{totalContributions.toLocaleString()}</h3>
          <p className="text-sm text-gray-500">Total Contributions</p>
        </Card>

        <Card className="border-0 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₦{expectedTotal.toLocaleString()}</h3>
          <p className="text-sm text-gray-500">Expected Total</p>
          <p className="text-xs text-gray-600 mt-1">At year completion</p>
        </Card>

        <Card className="border-0 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{avgMonthsContributed.toFixed(1)}/12</h3>
          <p className="text-sm text-gray-500">Avg. Months</p>
          <p className="text-xs text-gray-600 mt-1">{completionRate.toFixed(0)}% complete</p>
        </Card>
      </div>

      {/* View Contributions Button */}
      {onViewContributions && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
                <Receipt className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Contribution Management</h3>
                <p className="text-sm text-gray-600">Review and approve incoming contributions</p>
              </div>
            </div>
            <button
              onClick={() => onViewContributions(packageId)}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all active:scale-95 font-semibold flex items-center justify-center gap-2"
            >
              <Receipt className="w-5 h-5" />
              View Contributions
            </button>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card className="border-0 shadow-lg">
        <div className="mb-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">Package Members</h2>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="reserved">Reserved</option>
            </select>

            <select
              value={filterDelivery}
              onChange={(e) => setFilterDelivery(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Delivery Methods</option>
              <option value="delivery">Delivery</option>
              <option value="pickup">Pickup</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {/* Mobile: Stacked cards */}
        <div className="lg:hidden space-y-3 mb-6">
          {filteredUsers.map((user: any) => (
            <div key={user.id} className="p-4 bg-slate-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.phone}</p>
                </div>
                {getStatusBadge(user.status)}
              </div>
              
              <div className="space-y-2 text-xs mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-gray-900 font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Paid:</span>
                  <span className="text-gray-900 font-medium">₦{user.totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Progress:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        style={{ width: `${(user.contributions / 12) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-900 font-medium">{user.contributions}/12</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Joined:</span>
                  <span className="text-gray-900 font-medium">{user.joinedDate}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {user.deliveryMethod === 'delivery' ? (
                  <button
                    onClick={() => setSelectedUserAddress(user)}
                    className="flex-1 text-xs px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    View Address
                  </button>
                ) : (
                  <div className="flex-1 text-xs px-3 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium flex items-center justify-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Pickup
                  </div>
                )}
                <button className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  onClick={() => setViewingUser(user)}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Full table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Delivery</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Contributions</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Paid</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user: any) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <p className="text-gray-600">{user.phone}</p>
                      <p className="text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {user.deliveryMethod === 'delivery' ? (
                      <button
                        onClick={() => setSelectedUserAddress(user)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>View Address</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Pickup</span>
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[100px]">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                            style={{ width: `${(user.contributions / 12) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{user.contributions}/12</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-semibold text-gray-900">₦{user.totalPaid.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">of ₦{displayPackage.yearlyTotal.toLocaleString()}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-600">{user.joinedDate}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setViewingUser(user)}
                        className="p-2 hover:bg-purple-50 rounded-lg transition-colors group"
                      >
                        <Eye className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors group">
                        <Ban className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{filteredUsers.length}</p>
              <p className="text-xs text-gray-500">Showing</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              <p className="text-xs text-gray-500">Total Members</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">₦{(totalContributions / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-gray-500">Collected</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{completionRate.toFixed(0)}%</p>
              <p className="text-xs text-gray-500">Progress</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Delivery Address Modal */}
      {selectedUserAddress && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSelectedUserAddress(null)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 px-6 py-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">Delivery Address</h2>
                  <button
                    onClick={() => setSelectedUserAddress(null)}
                    className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <p className="text-white/90 text-sm font-medium">{selectedUserAddress.name}</p>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-6 space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">Street Address</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedUserAddress.deliveryAddress.address}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs font-medium text-gray-500 mb-1">City</p>
                    <p className="font-semibold text-gray-900">{selectedUserAddress.deliveryAddress.city}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs font-medium text-gray-500 mb-1">State</p>
                    <p className="font-semibold text-gray-900">{selectedUserAddress.deliveryAddress.state}</p>
                  </div>
                </div>

                {selectedUserAddress.deliveryAddress.landmark && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                    <p className="text-xs font-medium text-purple-700 mb-1">Landmark</p>
                    <p className="text-sm text-gray-700">{selectedUserAddress.deliveryAddress.landmark}</p>
                  </div>
                )}

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-xs font-medium text-emerald-700 mb-1">Contact Phone</p>
                  <p className="font-semibold text-gray-900">{selectedUserAddress.deliveryAddress.phoneNumber}</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-slate-50">
                <button
                  onClick={() => setSelectedUserAddress(null)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 transition-all text-white font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* View User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${displayPackage.gradient} flex items-center justify-center shadow-lg ${displayPackage.shadowColor}`}>
                  <span className="text-white text-xl font-bold">{viewingUser.name.split(' ').map((n: string) => n[0]).join('')}</span>
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
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${displayPackage.gradient} flex items-center justify-center`}>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Package</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${displayPackage.gradient} text-white`}>
                        {viewingUser.package}
                      </span>
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
                      <p className="text-xs text-emerald-600 mt-1">of ₦{displayPackage.yearlyTotal.toLocaleString()}</p>
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
                      {viewingUser.deliveryMethod === 'delivery' ? 'Home Delivery' : 'Pickup at Collection Point'}
                    </p>
                    {viewingUser.deliveryMethod === 'delivery' && viewingUser.deliveryAddress && (
                      <>
                        <div className="space-y-3 mt-4">
                          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                            <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-amber-700 mb-1">Street Address</p>
                              <p className="text-sm text-gray-700">{viewingUser.deliveryAddress.address}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white rounded-lg">
                              <p className="text-xs font-medium text-amber-700 mb-1">City</p>
                              <p className="text-sm font-semibold text-gray-900">{viewingUser.deliveryAddress.city}</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg">
                              <p className="text-xs font-medium text-amber-700 mb-1">State</p>
                              <p className="text-sm font-semibold text-gray-900">{viewingUser.deliveryAddress.state}</p>
                            </div>
                          </div>
                          {viewingUser.deliveryAddress.landmark && (
                            <div className="p-3 bg-white rounded-lg">
                              <p className="text-xs font-medium text-amber-700 mb-1">Landmark</p>
                              <p className="text-sm text-gray-700">{viewingUser.deliveryAddress.landmark}</p>
                            </div>
                          )}
                          <div className="p-3 bg-white rounded-lg">
                            <p className="text-xs font-medium text-amber-700 mb-1">Contact Phone</p>
                            <p className="text-sm font-semibold text-gray-900">{viewingUser.deliveryAddress.phoneNumber}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
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