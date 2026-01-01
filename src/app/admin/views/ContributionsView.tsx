import { useState } from 'react';
import { ArrowLeft, Search, CheckCircle, XCircle, Clock, Eye, MessageCircle, Filter, DollarSign, Calendar, User, X, Image as ImageIcon } from 'lucide-react';
import { Card } from '../../components/Card';
import { getPackageById } from '../../data/packages';

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
  amount: number;
  status: 'pending' | 'confirmed' | 'declined';
  date: string;
  transactionId: string;
  paymentMethod: string;
  reference: string;
  time: string;
  proofUrl: string;
}

export function ContributionsView({ packageId, onBack }: ContributionsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [showProofPreview, setShowProofPreview] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([
    {
      id: 'CONT-001',
      userId: '1',
      userName: 'Chioma Adebayo',
      userEmail: 'chioma@email.com',
      userPhone: '080 1234 5678',
      month: 'January',
      amount: 15000,
      status: 'confirmed',
      date: '2024-01-15',
      transactionId: 'DD-2024-JAN-001542',
      paymentMethod: 'Bank Transfer',
      reference: 'FLW-234891234',
      time: '14:23 PM',
      proofUrl: 'https://example.com/proofs/CONT-001.jpg'
    },
    {
      id: 'CONT-002',
      userId: '1',
      userName: 'Chioma Adebayo',
      userEmail: 'chioma@email.com',
      userPhone: '080 1234 5678',
      month: 'February',
      amount: 15000,
      status: 'pending',
      date: '2024-02-15',
      transactionId: 'DD-2024-FEB-001789',
      paymentMethod: 'Card Payment',
      reference: 'PSK-567234891',
      time: '09:45 AM',
      proofUrl: 'https://example.com/proofs/CONT-002.jpg'
    },
    {
      id: 'CONT-003',
      userId: '4',
      userName: 'Tunde Williams',
      userEmail: 'tunde@email.com',
      userPhone: '070 4567 8901',
      month: 'January',
      amount: 15000,
      status: 'pending',
      date: '2024-01-20',
      transactionId: 'DD-2024-JAN-001678',
      paymentMethod: 'Bank Transfer',
      reference: 'GTB-789456123',
      time: '16:12 PM',
      proofUrl: 'https://example.com/proofs/CONT-003.jpg'
    },
    {
      id: 'CONT-004',
      userId: '8',
      userName: 'Funmi Adeyemi',
      userEmail: 'funmi@email.com',
      userPhone: '081 8901 2345',
      month: 'March',
      amount: 15000,
      status: 'confirmed',
      date: '2024-03-10',
      transactionId: 'DD-2024-MAR-002103',
      paymentMethod: 'USSD',
      reference: 'UBA-891234567',
      time: '11:30 AM',
      proofUrl: 'https://example.com/proofs/CONT-004.jpg'
    },
    {
      id: 'CONT-005',
      userId: '4',
      userName: 'Tunde Williams',
      userEmail: 'tunde@email.com',
      userPhone: '070 4567 8901',
      month: 'February',
      amount: 15000,
      status: 'declined',
      date: '2024-02-20',
      transactionId: 'DD-2024-FEB-001890',
      paymentMethod: 'Bank Transfer',
      reference: 'ZEN-123456789',
      time: '10:15 AM',
      proofUrl: 'https://example.com/proofs/CONT-005.jpg'
    },
    {
      id: 'CONT-006',
      userId: '1',
      userName: 'Chioma Adebayo',
      userEmail: 'chioma@email.com',
      userPhone: '080 1234 5678',
      month: 'March',
      amount: 15000,
      status: 'confirmed',
      date: '2024-03-15',
      transactionId: 'DD-2024-MAR-002234',
      paymentMethod: 'Card Payment',
      reference: 'FLW-345678901',
      time: '13:20 PM',
      proofUrl: 'https://example.com/proofs/CONT-006.jpg'
    },
    {
      id: 'CONT-007',
      userId: '8',
      userName: 'Funmi Adeyemi',
      userEmail: 'funmi@email.com',
      userPhone: '081 8901 2345',
      month: 'April',
      amount: 15000,
      status: 'pending',
      date: '2024-04-12',
      transactionId: 'DD-2024-APR-002456',
      paymentMethod: 'Bank Transfer',
      reference: 'ACC-567890123',
      time: '15:45 PM',
      proofUrl: 'https://example.com/proofs/CONT-007.jpg'
    },
  ]);

  const packageData = getPackageById(packageId);

  if (!packageData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Package not found</p>
      </div>
    );
  }

  const handleApprove = (contributionId: string) => {
    setContributions(contributions.map(c => 
      c.id === contributionId ? { ...c, status: 'confirmed' as const } : c
    ));
    setSelectedContribution(null);
  };

  const handleDecline = (contributionId: string) => {
    setContributions(contributions.map(c => 
      c.id === contributionId ? { ...c, status: 'declined' as const } : c
    ));
    setSelectedContribution(null);
  };

  const filteredContributions = contributions.filter(contribution => {
    const matchesSearch = contribution.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contribution.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contribution.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || contribution.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: contributions.length,
    pending: contributions.filter(c => c.status === 'pending').length,
    confirmed: contributions.filter(c => c.status === 'confirmed').length,
    declined: contributions.filter(c => c.status === 'declined').length,
    totalAmount: contributions.reduce((sum, c) => sum + c.amount, 0),
    confirmedAmount: contributions.filter(c => c.status === 'confirmed').reduce((sum, c) => sum + c.amount, 0)
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
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${packageData.gradient} p-8 shadow-xl ${packageData.shadowColor}`}>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">{packageData.name} Contributions</h1>
          <p className="text-white/90">Manage and review all contribution submissions for this package</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
      </div>

      {/* Stats Cards */}
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
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${packageData.gradient} flex items-center justify-center shadow-lg ${packageData.shadowColor}`}>
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₦{(stats.confirmedAmount / 1000).toFixed(0)}K</h3>
          <p className="text-sm text-gray-500">Confirmed Amount</p>
        </Card>
      </div>

      {/* Contributions Table */}
      <Card className="border-0 shadow-lg">
        <div className="mb-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">Contribution Submissions</h2>
          
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
                  <span className="text-gray-900 font-medium">{contribution.month}</span>
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
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
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
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-700">{contribution.month}</p>
                  </td>
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

      {/* Contribution Detail Modal */}
      {selectedContribution && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSelectedContribution(null)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
              {/* Modal Header */}
              <div className={`bg-gradient-to-br ${packageData.gradient} px-6 py-6 text-white`}>
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
              <div className="px-6 py-6 space-y-4">
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
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-xs font-medium text-emerald-700 mb-1">Amount</p>
                    <p className="font-semibold text-gray-900">₦{selectedContribution.amount.toLocaleString()}</p>
                  </div>
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
              <div className={`bg-gradient-to-br ${packageData.gradient} px-6 py-6 text-white`}>
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