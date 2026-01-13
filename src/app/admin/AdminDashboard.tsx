import { useState } from 'react';
import { LayoutDashboard, Users, Package, Megaphone, Menu, X, LogOut, Calendar } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { DashboardOverview } from './views/DashboardOverview';
import { UsersManagement } from './views/UsersManagement';
import { PackagesManagement } from './views/PackagesManagement';
import { AnnouncementsManagement } from './views/AnnouncementsManagement';
import { PackageDetailsView } from './views/PackageDetailsView';
import { ContributionsView } from './views/ContributionsView';
import { Reserved2027 } from './views/Reserved2027';

interface AdminDashboardProps {
  onLogout: () => void;
}

const navItems = [
  { id: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { id: '/admin/dashboard/users', label: 'Users', icon: Users },
  { id: '/admin/dashboard/reserved2027', label: `Reserved for ${new Date().getFullYear() + 1}`, icon: Calendar },
  { id: '/admin/dashboard/packages', label: 'Packages', icon: Package },
  { id: '/admin/dashboard/announcements', label: 'Announcements', icon: Megaphone },
] as const;

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to determine active state
  const isPathActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path || location.pathname === path + '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200 h-full flex-shrink-0">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Admin Portal</h2>
              <p className="text-xs text-gray-500">Detty December</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isPathActive(item.id, (item as any).exact);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 lg:hidden flex flex-col h-full ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Admin Portal</h2>
              <p className="text-xs text-gray-500">Detty December</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isPathActive(item.id, (item as any).exact);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex-shrink-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="font-bold text-gray-900 text-lg">
                  {navItems.find(item => isPathActive(item.id, (item as any).exact))?.label || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">Manage your platform</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-emerald-700">Online</span>
              </div>
              <button
                onClick={onLogout}
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto scrollbar-hide">
          <Routes>
            <Route index element={
              <DashboardOverview onPackageClick={(packageId) => {
                navigate(`/admin/dashboard/packages/${packageId}`);
              }} />
            } />
            <Route path="users" element={<UsersManagement />} />
            <Route path="packages" element={<PackagesManagement />} />
            <Route path="announcements" element={<AnnouncementsManagement />} />
            <Route path="reserved2027" element={<Reserved2027 />} />
            
            {/* Dynamic Routes for Details */}
            <Route path="packages/:packageId" element={<PackageRouterWrapper />} />
             <Route path="packages/:packageId/contributions" element={<ContributionsRouterWrapper />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// Wrapper to extract params for PackageDetailsView
function PackageRouterWrapper() {
  const params = useParams();
  const navigate = useNavigate();
  
  return (
    <PackageDetailsView 
      packageId={params.packageId || 'basic'} 
      onBack={() => navigate('/admin/dashboard')}
      onViewContributions={(packageId) => {
        navigate(`/admin/dashboard/packages/${packageId}/contributions`);
      }}
    />
  );
}

// Wrapper for ContributionsView
function ContributionsRouterWrapper() {
  const params = useParams();
  const navigate = useNavigate();

  return (
     <ContributionsView 
      packageId={params.packageId || 'basic'} 
      onBack={() => navigate(`/admin/dashboard/packages/${params.packageId}`)} 
    />
  );
}