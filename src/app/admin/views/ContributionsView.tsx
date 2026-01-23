import { useState } from 'react';
import { ArrowLeft, Search, CheckCircle, XCircle, Clock, Eye, Download, DollarSign, User, Image as ImageIcon, Loader, Truck, Layers } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card } from '../../components/Card';
import { admin } from '../../../lib/api';

interface ContributionsViewProps {
  packageId: string;
  onBack: () => void;
}

interface Contribution {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  month: string;
  paymentMonth: number | null;
  paymentYear: string | number | null;
  amount: number;
  quantity: number; // Number of slots
  status: 'pending' | 'confirmed' | 'declined';
  date: string;
  transactionId: string;
  paymentMethod: string;
  reference: string;
  time: string;
  proofUrl: string;
}

const getMonthName = (month: number) => {
  const date = new Date();
  date.setMonth(month - 1);
  return date.toLocaleString('default', { month: 'long' });
};

export function ContributionsView({ packageId, onBack }: ContributionsViewProps) {
  const [activeTab, setActiveTab] = useState<'contributions' | 'delivery'>('contributions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [showProofPreview, setShowProofPreview] = useState(false);
  
  // ... (keeping existing query hooks) ...
  // Fetch Transactions (Contributions)
  // Fetch Transactions (Contributions)
  const { data: transactionsData, isLoading: isLoadingTransactions, refetch: refetchContributions } = useQuery({
    queryKey: ['admin-transactions', packageId, page, perPage, filterStatus],
    queryFn: () => admin.getTransactions({ 
      package_id: packageId, 
      page,
      per_page: perPage,
      status: filterStatus !== 'all' ? filterStatus : undefined
    }),
    enabled: activeTab === 'contributions'
  });

  // Fetch Delivery Transactions
  const { data: deliveryData, isLoading: isLoadingDelivery, refetch: refetchDelivery } = useQuery({
    queryKey: ['admin-delivery-transactions'],
    queryFn: () => admin.getDeliveryTransactions(),
    enabled: activeTab === 'delivery'
  });

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: admin.approveTransaction,
    onSuccess: () => {
      toast.success('Transaction approved successfully');
      if (activeTab === 'contributions') refetchContributions();
      else refetchDelivery();
      setSelectedContribution(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve transaction');
    }
  });

  // Decline Mutation
  const declineMutation = useMutation({
    mutationFn: admin.declineTransaction,
    onSuccess: () => {
      toast.success('Transaction declined');
      if (activeTab === 'contributions') refetchContributions();
      else refetchDelivery();
      setSelectedContribution(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to decline transaction');
    }
  });

  // Derived state from API data
  const rawContributions = transactionsData?.data?.data || transactionsData?.data || [];
  const contributions: Contribution[] = Array.isArray(rawContributions) ? rawContributions.map((t: any) => ({
    id: t.id?.toString() || t.transaction_id || `TRX-${Math.random()}`,
    userId: t.user?.id?.toString() || t.user_id?.toString() || '0',
    userName: t.user?.name || (t.user?.first_name ? `${t.user.first_name} ${t.user.last_name || ''}`.trim() : 'Unknown User'),
    userEmail: t.user?.email || 'No Email',
    userPhone: t.user?.phone || 'No Phone',
    // Derive month from created_at since it's not in the response directly
    month: t.created_at ? new Date(t.created_at).toLocaleString('default', { month: 'long' }) : 'Unknown',
    paymentMonth: t.payment_month,
    paymentYear: t.payment_year,
    amount: Number(t.amount) || 0,
    quantity: Number(t.user?.slots || t.slots || 1), 
    status: t.status === 'approved' ? 'confirmed' : (t.status || 'pending'),
    date: t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : 'N/A',
    transactionId: t.transaction_id || t.reference || 'N/A',
    paymentMethod: t.type || t.payment_method || 'Paystack',
    reference: t.reference || 'N/A',
    time: t.created_at ? new Date(t.created_at).toLocaleTimeString() : 'N/A',
    proofUrl: t.proof_url || '' 
  })) : [];

  const rawDelivery = deliveryData?.data?.data || [];
  const deliveries: Contribution[] = Array.isArray(rawDelivery) ? rawDelivery.map((t: any) => ({
    id: t.id?.toString(),
    userId: t.user?.id?.toString() || '0',
    userName: t.user ? `${t.user.first_name || ''} ${t.user.last_name || ''}`.trim() || t.user.name : 'Unknown User',
    userEmail: t.user?.email || 'No Email',
    userPhone: t.user?.phone || 'No Phone',
    month: 'Delivery',
    paymentMonth: null,
    paymentYear: null,
    amount: Number(t.amount) || 0,
    quantity: 1,
    status: t.status === 'approved' ? 'confirmed' : (t.status || 'pending'),
    date: t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : 'N/A',
    transactionId: t.transaction_id || 'N/A',
    paymentMethod: 'Paystack', // Delivery usually Paystack
    reference: t.reference || 'N/A',
    time: t.created_at ? new Date(t.created_at).toLocaleTimeString() : 'N/A',
    proofUrl: ''
  })) : [];

  const currentList = activeTab === 'contributions' ? contributions : deliveries;

  // Fetch Package Details
  const { data: packageApiResponse, isLoading: isLoadingPackage } = useQuery({
    queryKey: ['package', packageId],
    queryFn: () => admin.getPackageById(packageId),
  });
  
  const packageData = packageApiResponse?.data;

  if (isLoadingPackage) {
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
  
  // Normalize package data for display
  const displayPackage = {
    ...packageData,
    gradient: packageData.gradient || 'from-indigo-500 via-purple-500 to-pink-500',
    shadowColor: packageData.shadow_color || 'shadow-purple-500/30',
    monthlyAmount: Number(packageData.price) || packageData.monthlyAmount || 0,
    yearlyTotal: (Number(packageData.price) || 0) * 12,
    name: packageData.name,
    description: packageData.description
  };

  const handleApprove = (contributionId: string) => {
    approveMutation.mutate(contributionId);
  };

  const handleDecline = (contributionId: string) => {
    declineMutation.mutate(contributionId);
  };

  const filteredContributions = currentList.filter(contribution => {
    const matchesSearch = contribution.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contribution.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contribution.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || contribution.status === filterStatus;
    const matchesMonth = filterMonth === 'all' || contribution.month === filterMonth;
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const stats = {
    total: currentList.length,
    pending: currentList.filter(c => c.status === 'pending').length,
    confirmed: currentList.filter(c => c.status === 'confirmed').length,
    declined: currentList.filter(c => c.status === 'declined').length,
    totalAmount: currentList.reduce((sum, c) => sum + c.amount, 0),
    confirmedAmount: currentList.filter(c => c.status === 'confirmed').reduce((sum, c) => sum + c.amount, 0)
  };

  const getStatusBadge = (status: string) => {
    if (status === 'confirmed') {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
          <CheckCircle className="w-3 h-3" />
          Confirmed
        </span>
      );
    } else if (status === 'declined') {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          <XCircle className="w-3 h-3" />
          Declined
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };

  const handleExport = () => {
    // Create CSV header
    const headers = ['Transaction ID', 'User Name', 'Email', 'Phone', 'Month', 'Paid For', 'Slots', 'Amount', 'Payment Method', 'Reference', 'Status', 'Date', 'Time'];
    
    // Create CSV rows from filtered data
    const rows = filteredContributions.map(c => [
      c.transactionId,
      c.userName,
      c.userEmail,
      c.userPhone,
      c.month,
      c.paymentMonth ? `${getMonthName(c.paymentMonth)} ${c.paymentYear || ''}` : '',
      c.quantity.toString(),
      c.amount.toString(),
      c.paymentMethod,
      c.reference,
      c.status,
      c.date,
      c.time
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${displayPackage.name}_contributions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Packages
      </button>

      {/* Package Header */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${displayPackage.gradient} p-8 shadow-xl ${displayPackage.shadowColor}`}>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">{displayPackage.name} Contributions</h1>
          <p className="text-white/90">Manage and review all contribution submissions for this package</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
      </div>

      {/* Stats Cards */}
      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('contributions')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'contributions'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Contributions
          </div>
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'delivery'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Delivery Fees
          </div>
        </button>
      </div>

      {isLoadingTransactions || isLoadingDelivery ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
           {[...Array(4)].map((_, i) => (
             <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</h3>
            <p className="text-sm text-gray-500">Total Submissions</p>
          </Card>

          <Card className="border-0 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-amber-600 mb-1">{stats.pending}</h3>
            <p className="text-sm text-gray-500">Pending Review</p>
          </Card>

          <Card className="border-0 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-emerald-600 mb-1">{stats.confirmed}</h3>
            <p className="text-sm text-gray-500">Confirmed</p>
          </Card>

          <Card className="border-0 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${displayPackage.gradient} flex items-center justify-center shadow-lg ${displayPackage.shadowColor}`}>
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">₦{(stats.confirmedAmount / 1000).toFixed(0)}K</h3>
            <p className="text-sm text-gray-500">Confirmed Amount</p>
          </Card>
        </div>
      )}

      {/* Contributions Table */}
      <Card className="border-0 shadow-lg">
        <div className="mb-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">{activeTab === 'contributions' ? 'Contribution Submissions' : 'Delivery Payments'}</h2>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, transaction ID, or reference..."
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
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="declined">Declined</option>
            </select>

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Months</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>

            <button
              onClick={handleExport}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all text-white font-semibold rounded-xl flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>

        {/* Mobile: Stacked cards */}
        <div className="lg:hidden space-y-3 mb-6">
          {filteredContributions.map((contribution) => (
            <div key={contribution.id} className="p-4 bg-slate-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{contribution.userName}</p>
                  <p className="text-xs text-gray-500">{contribution.userPhone}</p>
                </div>
                {getStatusBadge(contribution.status)}
              </div>
              
              <div className="space-y-2 text-xs mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Month:</span>
                  <div className="text-right">
                    <span className="text-gray-900 font-medium">{contribution.month}</span>
                    {contribution.paymentMonth && (
                      <p className="text-xs text-gray-500">Paid for: {getMonthName(contribution.paymentMonth)} {contribution.paymentYear}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Slots:</span>
                  <span className="text-gray-900 font-medium">{contribution.quantity} {contribution.quantity === 1 ? 'person' : 'people'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount:</span>
                  <span className="text-gray-900 font-medium">₦{contribution.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment:</span>
                  <span className="text-gray-900 font-medium">{contribution.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reference:</span>
                  <span className="text-gray-900 font-medium font-mono text-xs">{contribution.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="text-gray-900 font-medium">{contribution.date}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedContribution(contribution)}
                  className="flex-1 text-xs px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </button>
                {contribution.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleApprove(contribution.id)}
                      className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDecline(contribution.id)}
                      className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
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
                {activeTab === 'contributions' && (
                    <>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Slots</th>
                    </>
                )}
                {activeTab === 'delivery' && (
                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                )}
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment Method</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Reference</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContributions.map((contribution) => (
                <tr key={contribution.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold text-gray-900">{contribution.userName}</p>
                      <p className="text-xs text-gray-500">{contribution.userPhone}</p>
                    </div>
                  </td>
                  {activeTab === 'contributions' && (
                      <>
                        <td className="py-4 px-4">
                            <p className="font-medium text-gray-700">{contribution.month}</p>
                            {contribution.paymentMonth && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Paid for: <span className="font-medium">{getMonthName(contribution.paymentMonth)}</span> <span className="text-gray-400">{contribution.paymentYear}</span>
                                </p>
                            )}
                        </td>
                        <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                {contribution.quantity} {contribution.quantity === 1 ? 'slot' : 'slots'}
                            </span>
                            </div>
                        </td>
                      </>
                  )}
                   {activeTab === 'delivery' && (
                      <td className="py-4 px-4">
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                Delivery
                            </span>
                      </td>
                  )}
                  <td className="py-4 px-4">
                    <p className="font-semibold text-gray-900">₦{contribution.amount.toLocaleString()}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-600">{contribution.paymentMethod}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-mono text-gray-600">{contribution.reference}</p>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(contribution.status)}
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-600">{contribution.date}</p>
                    <p className="text-xs text-gray-500">{contribution.time}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedContribution(contribution)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                      >
                        <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                      </button>
                      {contribution.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(contribution.id)}
                            className="p-2 hover:bg-emerald-50 rounded-lg transition-colors group"
                          >
                            <CheckCircle className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                          </button>
                          <button 
                            onClick={() => handleDecline(contribution.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                          >
                            <XCircle className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredContributions.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No contributions found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Pagination Controls */}
      {activeTab === 'contributions' && transactionsData?.data?.current_page && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{transactionsData.data.from || 0}</span> to <span className="font-medium">{transactionsData.data.to || 0}</span> of <span className="font-medium">{transactionsData.data.total || 0}</span> results
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Rows per page:</span>
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoadingTransactions}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, transactionsData.data.last_page || 1) }, (_, i) => {
                let pNum = i + 1;
                if (transactionsData.data.last_page > 5) {
                  if (page > 3) pNum = page - 2 + i;
                  if (pNum > transactionsData.data.last_page) pNum = transactionsData.data.last_page - (4 - i);
                }
                
                // Ensure pNum is valid
                if (pNum <= 0) pNum = 1;

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
              onClick={() => setPage((p) => p + 1)}
              disabled={!transactionsData.data || page >= transactionsData.data.last_page || isLoadingTransactions}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Contribution Detail Modal */}
      {selectedContribution && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSelectedContribution(null)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[85vh] flex flex-col">
              {/* Modal Header */}
              <div className={`bg-gradient-to-br ${displayPackage.gradient} px-6 py-6 text-white flex-shrink-0`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">Contribution Details</h2>
                  <button
                    onClick={() => setSelectedContribution(null)}
                    className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
                  >
                    <span className="text-white text-xl">×</span>
                  </button>
                </div>
                <p className="text-white/90 text-sm">{selectedContribution.transactionId}</p>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-6 space-y-4 overflow-y-auto flex-1">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <User className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">User Information</p>
                    <p className="text-sm text-gray-700">{selectedContribution.userName}</p>
                    <p className="text-sm text-gray-600">{selectedContribution.userEmail}</p>
                    <p className="text-sm text-gray-600">{selectedContribution.userPhone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                    <p className="text-xs font-medium text-purple-700 mb-1">Month</p>
                    <p className="font-semibold text-gray-900">{selectedContribution.month}</p>
                  </div>
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <p className="text-xs font-medium text-indigo-700 mb-1">Slots</p>
                    <p className="font-semibold text-gray-900">{selectedContribution.quantity} {selectedContribution.quantity === 1 ? 'person' : 'people'}</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-xs font-medium text-emerald-700 mb-1">Total Amount</p>
                  <p className="font-semibold text-gray-900">₦{selectedContribution.amount.toLocaleString()}</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs font-medium text-blue-700 mb-2">Payment Details</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Method:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedContribution.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Reference:</span>
                      <span className="text-sm font-mono font-medium text-gray-900">{selectedContribution.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date & Time:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedContribution.date} {selectedContribution.time}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Proof Section */}
                {selectedContribution.proofUrl && (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gradient-to-br from-slate-50 to-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">Payment Proof</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Uploaded</span>
                    </div>
                    <button
                      onClick={() => setShowProofPreview(true)}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all text-white font-semibold flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Payment Proof
                    </button>
                  </div>
                )}

                <div className="p-4 bg-slate-100 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    {getStatusBadge(selectedContribution.status)}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-slate-50">
                {selectedContribution.status === 'pending' ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDecline(selectedContribution.id)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all text-white font-semibold flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Decline
                    </button>
                    <button
                      onClick={() => handleApprove(selectedContribution.id)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all text-white font-semibold flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedContribution(null)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 transition-all text-white font-semibold"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Proof Preview Modal */}
      {showProofPreview && selectedContribution && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowProofPreview(false)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
              {/* Modal Header */}
              <div className={`bg-gradient-to-br ${displayPackage.gradient} px-6 py-6 text-white`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">Proof Preview</h2>
                  <button
                    onClick={() => setShowProofPreview(false)}
                    className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
                  >
                    <span className="text-white text-xl">×</span>
                  </button>
                </div>
                <p className="text-white/90 text-sm">{selectedContribution.transactionId}</p>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-6 space-y-4">
                <div className="flex items-center justify-center">
                  <img
                    src={selectedContribution.proofUrl}
                    alt="Proof"
                    className="max-w-full max-h-96"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-slate-50">
                <button
                  onClick={() => setShowProofPreview(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 transition-all text-white font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}