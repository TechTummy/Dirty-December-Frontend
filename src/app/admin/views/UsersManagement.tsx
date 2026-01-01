import { useState } from 'react';
import { Search, Filter, Eye, Ban, CheckCircle, Clock, Plus, Download, X, MapPin, Save } from 'lucide-react';
import { Card } from '../../components/Card';
import { GradientButton } from '../../components/GradientButton';

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
  deliveryAddress?: string;
  deliveryState?: string;
  deliveryLga?: string;
}

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

export function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPackage, setFilterPackage] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    package: 'Basic Bundle',
    status: 'active',
    deliveryType: 'pickup' as 'pickup' | 'delivery',
    deliveryAddress: '',
    deliveryState: '',
    deliveryLga: ''
  });

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'Chioma Adebayo',
      phone: '080 1234 5678',
      email: 'chioma@email.com',
      package: 'Family Bundle',
      status: 'active',
      contributions: 4,
      totalPaid: 60000,
      joinedDate: 'Jan 2024',
      deliveryType: 'delivery',
      deliveryAddress: '15 Allen Avenue',
      deliveryState: 'Lagos',
      deliveryLga: 'Ikeja'
    },
    {
      id: 2,
      name: 'Emeka Johnson',
      phone: '081 2345 6789',
      email: 'emeka@email.com',
      package: 'Basic Bundle',
      status: 'active',
      contributions: 4,
      totalPaid: 20000,
      joinedDate: 'Jan 2024'
    },
    {
      id: 3,
      name: 'Blessing Okeke',
      phone: '090 3456 7890',
      email: 'blessing@email.com',
      package: 'Premium Bundle',
      status: 'active',
      contributions: 3,
      totalPaid: 150000,
      joinedDate: 'Feb 2024'
    },
    {
      id: 4,
      name: 'Tunde Williams',
      phone: '070 4567 8901',
      email: 'tunde@email.com',
      package: 'Family Bundle',
      status: 'reserved',
      contributions: 2,
      totalPaid: 30000,
      joinedDate: 'Mar 2024'
    },
    {
      id: 5,
      name: 'Amaka Okafor',
      phone: '080 5678 9012',
      email: 'amaka@email.com',
      package: 'Basic Bundle',
      status: 'active',
      contributions: 4,
      totalPaid: 20000,
      joinedDate: 'Jan 2024'
    },
    {
      id: 6,
      name: 'Ngozi Eze',
      phone: '081 6789 0123',
      email: 'ngozi@email.com',
      package: 'Premium Bundle',
      status: 'active',
      contributions: 4,
      totalPaid: 200000,
      joinedDate: 'Jan 2024'
    }
  ]);

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
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesPackage = filterPackage === 'all' || user.package === filterPackage;
    
    return matchesSearch && matchesStatus && matchesPackage;
  });

  const handleAddUser = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      package: 'Basic Bundle',
      status: 'active',
      deliveryType: 'pickup' as 'pickup' | 'delivery',
      deliveryAddress: '',
      deliveryState: '',
      deliveryLga: ''
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
      package: user.package,
      status: user.status,
      deliveryType: user.deliveryType || 'pickup' as 'pickup' | 'delivery',
      deliveryAddress: user.deliveryAddress || '',
      deliveryState: user.deliveryState || '',
      deliveryLga: user.deliveryLga || ''
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
      const updatedUsers = users.map(user => 
        user.id === editingUser.id ? { ...user, ...formData } : user
      );
      setUsers(updatedUsers);
    } else {
      const newUser: User = {
        id: users.length + 1,
        ...formData,
        contributions: 0,
        totalPaid: 0,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      };
      setUsers([...users, newUser]);
    }
    setShowModal(false);
  };

  const handleDeleteUser = (userId: number) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-500 mt-1">{filteredUsers.length} registered users</p>
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
                  <option value="suspended">Suspended</option>
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
                  <option value="Basic Bundle">Basic Bundle</option>
                  <option value="Family Bundle">Family Bundle</option>
                  <option value="Premium Bundle">Premium Bundle</option>
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
        <div className="lg:hidden space-y-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4 bg-slate-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/30">
                    <span className="text-white font-bold text-sm">{user.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{user.name}</h3>
                    <p className="text-xs text-gray-500">{user.phone}</p>
                  </div>
                </div>
                {getStatusBadge(user.status)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Package: </span>
                  <span className="font-medium text-gray-900">{user.package}</span>
                </div>
                <div>
                  <span className="text-gray-500">Paid: </span>
                  <span className="font-medium text-emerald-600">₦{user.totalPaid.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => handleViewUser(user)}
                  className="flex-1 text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors font-medium"
                >
                  View
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/30 flex-shrink-0">
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
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all"
                          style={{ width: `${(user.contributions / 12) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{user.contributions}/12</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-emerald-600 text-sm">₦{user.totalPaid.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{user.joinedDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <Card className="border-0 shadow-md text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">No users found</h3>
          <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
        </Card>
      )}

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">
            Previous
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg shadow-lg shadow-purple-500/30 font-medium text-sm">
            1
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">
            2
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">
            3
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">
            Next
          </button>
        </div>
      )}

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Package</label>
                      <select
                        value={formData.package}
                        onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                      >
                        <option value="Basic Bundle">Basic Bundle</option>
                        <option value="Family Bundle">Family Bundle</option>
                        <option value="Premium Bundle">Premium Bundle</option>
                      </select>
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
                      </select>
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
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Delivery Type</label>
                      <select
                        value={formData.deliveryType}
                        onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value as 'pickup' | 'delivery' })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                      >
                        <option value="pickup">Pickup at Collection Point</option>
                        <option value="delivery">Home Delivery</option>
                      </select>
                    </div>
                    
                    {formData.deliveryType === 'delivery' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Delivery Address</label>
                          <input
                            type="text"
                            placeholder="Enter street address"
                            value={formData.deliveryAddress}
                            onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">State</label>
                          <select
                            value={formData.deliveryState}
                            onChange={(e) => setFormData({ ...formData, deliveryState: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                          >
                            <option value="">Select State</option>
                            {nigerianStates.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">LGA</label>
                          <input
                            type="text"
                            placeholder="Enter LGA"
                            value={formData.deliveryLga}
                            onChange={(e) => setFormData({ ...formData, deliveryLga: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Package</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPackageBadge(viewingUser.package)}`}>
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