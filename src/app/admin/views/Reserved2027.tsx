import { useState } from 'react';
import { Search, Filter, Eye, Edit, CheckCircle, Calendar, Plus, Download, X, MapPin, Save } from 'lucide-react';
import { Card } from '../../components/Card';
import { GradientButton } from '../../components/GradientButton';

interface ReservedUser {
  id: number;
  name: string;
  phone: string;
  email: string;
  package: string;
  reservationDate: string;
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

export function Reserved2027() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPackage, setFilterPackage] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<ReservedUser | null>(null);
  const [viewingUser, setViewingUser] = useState<ReservedUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    package: 'Basic Bundle',
    deliveryType: 'pickup' as 'pickup' | 'delivery',
    deliveryAddress: '',
    deliveryState: '',
    deliveryLga: ''
  });

  const [reservedUsers, setReservedUsers] = useState<ReservedUser[]>([
    {
      id: 1,
      name: 'Tunde Williams',
      phone: '070 4567 8901',
      email: 'tunde@email.com',
      package: 'Family Bundle',
      reservationDate: 'Jan 15, 2025',
      deliveryType: 'pickup'
    },
    {
      id: 2,
      name: 'Folake Adeyemi',
      phone: '080 9876 5432',
      email: 'folake@email.com',
      package: 'Premium Bundle',
      reservationDate: 'Jan 20, 2025',
      deliveryType: 'delivery',
      deliveryAddress: '10 Lekki Phase 1',
      deliveryState: 'Lagos',
      deliveryLga: 'Eti-Osa'
    },
    {
      id: 3,
      name: 'Ibrahim Yusuf',
      phone: '081 2468 1357',
      email: 'ibrahim@email.com',
      package: 'Basic Bundle',
      reservationDate: 'Feb 5, 2025',
      deliveryType: 'pickup'
    }
  ]);

  const getPackageBadge = (packageName: string) => {
    const colors = {
      'Basic Bundle': 'bg-purple-100 text-purple-700',
      'Family Bundle': 'bg-emerald-100 text-emerald-700',
      'Premium Bundle': 'bg-amber-100 text-amber-700'
    };
    return colors[packageName as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

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
    a.download = `reserved-2027-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredUsers = reservedUsers.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPackage = filterPackage === 'all' || user.package === filterPackage;
    
    return matchesSearch && matchesPackage;
  });

  const handleAddUser = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      package: 'Basic Bundle',
      deliveryType: 'pickup' as 'pickup' | 'delivery',
      deliveryAddress: '',
      deliveryState: '',
      deliveryLga: ''
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
      deliveryType: user.deliveryType || 'pickup' as 'pickup' | 'delivery',
      deliveryAddress: user.deliveryAddress || '',
      deliveryState: user.deliveryState || '',
      deliveryLga: user.deliveryLga || ''
    });
    setEditingUser(user);
    setShowModal(true);
  };

  const handleViewUser = (user: ReservedUser) => {
    setViewingUser(user);
    setEditingUser(null);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      const updatedUsers = reservedUsers.map(user => 
        user.id === editingUser.id ? { ...user, ...formData } : user
      );
      setReservedUsers(updatedUsers);
    } else {
      const newUser: ReservedUser = {
        id: reservedUsers.length + 1,
        ...formData,
        reservationDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      setReservedUsers([...reservedUsers, newUser]);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reserved for 2027</h1>
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
            <h3 className="font-semibold text-gray-900 mb-1">2027 Reservations</h3>
            <p className="text-sm text-gray-600">
              Users listed here have reserved their spots for the 2027 cycle. They will begin making contributions in January 2027.
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
                      value={formData.package}
                      onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      <option value="Basic Bundle">Basic Bundle</option>
                      <option value="Family Bundle">Family Bundle</option>
                      <option value="Premium Bundle">Premium Bundle</option>
                    </select>
                  </div>
                </div>

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
    </div>
  );
}
