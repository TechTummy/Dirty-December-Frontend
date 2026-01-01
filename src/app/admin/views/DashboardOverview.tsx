import { TrendingUp, Users, DollarSign, Package, Clock, CheckCircle, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '../../components/Card';
import { packages } from '../../data/packages';

interface DashboardOverviewProps {
  onPackageClick: (packageId: string) => void;
}

export function DashboardOverview({ onPackageClick }: DashboardOverviewProps) {
  const recentContributions = [
    { id: 1, user: 'Chioma Adebayo', package: 'Family Bundle', amount: 15000, status: 'pending', time: '2 mins ago' },
    { id: 2, user: 'Emeka Johnson', package: 'Basic Bundle', amount: 5000, status: 'confirmed', time: '15 mins ago' },
    { id: 3, user: 'Blessing Okeke', package: 'Premium Bundle', amount: 50000, status: 'pending', time: '1 hour ago' },
    { id: 4, user: 'Tunde Williams', package: 'Family Bundle', amount: 15000, status: 'confirmed', time: '2 hours ago' },
    { id: 5, user: 'Amaka Okafor', package: 'Basic Bundle', amount: 5000, status: 'confirmed', time: '3 hours ago' }
  ];

  const packageDistribution = [
    { name: 'Basic Bundle', count: 78, percentage: 50, color: 'bg-purple-500' },
    { name: 'Family Bundle', count: 62, percentage: 40, color: 'bg-emerald-500' },
    { name: 'Premium Bundle', count: 16, percentage: 10, color: 'bg-amber-500' }
  ];

  // Package summary data with contributions
  const packageSummaries = [
    {
      package: packages[0], // Basic Bundle
      users: 78,
      totalContributions: 15600000, // 78 users * 4 months avg * 5000
      avgMonthsContributed: 4.2
    },
    {
      package: packages[1], // Family Bundle
      users: 62,
      totalContributions: 37200000, // 62 users * 4 months avg * 15000
      avgMonthsContributed: 4.0
    },
    {
      package: packages[2], // Premium Bundle
      users: 16,
      totalContributions: 32000000, // 16 users * 4 months avg * 50000
      avgMonthsContributed: 4.0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Package Summary Cards */}
      <div>
        <h2 className="font-bold text-gray-900 text-lg mb-4">Package Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packageSummaries.map((summary, index) => (
            <Card 
              key={index} 
              className={`border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden relative`}
              onClick={() => onPackageClick(summary.package.id)}
            >
              {/* Gradient Background Accent */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${summary.package.gradient} opacity-5 rounded-full -mr-16 -mt-16`} />
              
              {/* Badge */}
              {summary.package.badge && (
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${summary.package.gradient} text-white shadow-lg ${summary.package.shadowColor} mb-4`}>
                  {summary.package.badge}
                </div>
              )}

              {/* Package Icon & Name */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${summary.package.gradient} flex items-center justify-center shadow-lg ${summary.package.shadowColor} flex-shrink-0`}>
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{summary.package.name}</h3>
                  <p className="text-xs text-gray-500">₦{summary.package.monthlyAmount.toLocaleString()}/month</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.users}</p>
                  </div>
                  <Users className="w-8 h-8 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <div>
                    <p className="text-xs text-emerald-700 mb-1 font-medium">Total Contributions</p>
                    <p className="text-2xl font-bold text-emerald-700">₦{(summary.totalContributions / 1000000).toFixed(1)}M</p>
                    <p className="text-xs text-emerald-600 mt-1">₦{summary.totalContributions.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-emerald-500" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Avg. Months</p>
                    <p className="font-bold text-gray-900">{summary.avgMonthsContributed}/12</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Progress</p>
                    <p className="font-bold text-gray-900">{Math.round((summary.avgMonthsContributed / 12) * 100)}%</p>
                  </div>
                </div>

                {/* Expected Total */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Expected at completion:</span>
                    <span className="font-bold text-gray-900">₦{((summary.users * summary.package.yearlyTotal) / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Contributions & Package Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contributions */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900 text-lg">Recent Contributions</h2>
            <button className="text-sm font-medium bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:opacity-80">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {recentContributions.map((contribution) => (
              <div
                key={contribution.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900">{contribution.user}</h3>
                    {contribution.status === 'pending' ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        Pending
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                        Confirmed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{contribution.package}</span>
                    <span>•</span>
                    <span>{contribution.time}</span>
                  </div>
                </div>
                <div className="font-bold text-gray-900">
                  ₦{contribution.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Package Distribution */}
        <Card className="border-0 shadow-lg">
          <h2 className="font-bold text-gray-900 text-lg mb-6">Package Distribution</h2>
          
          <div className="space-y-4">
            {packageDistribution.map((pkg, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{pkg.name}</span>
                  <span className="text-sm font-bold text-gray-900">{pkg.count} users</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`${pkg.color} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${pkg.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{pkg.percentage}%</div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 mb-1">156</p>
              <p className="text-sm text-gray-500">Total Members</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <h2 className="font-bold text-gray-900 text-lg mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all border border-purple-100">
            <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900">Approve Pending</p>
          </button>
          <button className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl hover:shadow-md transition-all border border-emerald-100">
            <Package className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900">Add Product</p>
          </button>
          <button className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl hover:shadow-md transition-all border border-amber-100">
            <TrendingUp className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900">View Reports</p>
          </button>
          <button className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:shadow-md transition-all border border-blue-100">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900">Add User</p>
          </button>
        </div>
      </Card>
    </div>
  );
}