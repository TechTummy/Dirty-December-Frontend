import { useState } from 'react';
import { Toaster } from 'sonner';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Landing } from './screens/Landing';
import { Login } from './screens/Login';
import { ForgotPassword } from './screens/ForgotPassword';
import { Onboarding } from './screens/Onboarding';
import { Dashboard } from './screens/Dashboard';
import { Contribute } from './screens/Contribute';
import { ValuePreview } from './screens/ValuePreview';
import { Announcements } from './screens/Announcements';
import { Profile } from './screens/Profile';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';
import { InstallPWA } from './components/InstallPWA';

type Screen = 'landing' | 'login' | 'forgot-password' | 'onboarding' | 'dashboard' | 'contribute' | 'value-preview' | 'announcements' | 'admin-login' | 'admin-dashboard' | 'profile';
type UserStatus = 'active' | 'reserved';

export default function App() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Chioma');
  const [userStatus, setUserStatus] = useState<UserStatus>('active');
  const [selectedPackage, setSelectedPackage] = useState<string>('Basic Bundle');
  const [preSelectedPackageId, setPreSelectedPackageId] = useState<string | null>(null);

  const handleNavigate = (screen: Screen) => {
    switch (screen) {
      case 'landing':
        navigate('/');
        break;
      case 'admin-login':
        navigate('/admin/login');
        break;
      case 'admin-dashboard':
        navigate('/admin/dashboard');
        break;
      default:
        navigate(`/${screen}`);
    }
  };

  const handleGetStarted = (packageId?: string) => {
    if (packageId) {
      setPreSelectedPackageId(packageId);
    }
    navigate('/onboarding');
  };

  const handleOnboardingComplete = (status: UserStatus = 'active', packageName?: string) => {
    setUserStatus(status);
    if (packageName) {
      setSelectedPackage(packageName);
    }
    navigate('/dashboard');
  };

  return (
    <>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={
          <AdminLogin onLogin={() => navigate('/admin/dashboard')} />
        } />
        <Route path="/admin/dashboard/*" element={
          <AdminDashboard onLogout={() => navigate('/')} />
        } />

        {/* User Routes - Wrapped in Layout */}
        <Route path="*" element={
          <div className="max-w-[430px] mx-auto min-h-screen bg-white">
            <Routes>
              <Route path="/" element={
                <Landing 
                  onGetStarted={handleGetStarted} 
                  onSignIn={() => navigate('/login')} 
                  onAdminAccess={() => navigate('/admin/login')} 
                />
              } />
              <Route path="/login" element={
                <Login 
                  onLogin={() => navigate('/dashboard')} 
                  onBackToLanding={() => navigate('/')} 
                  onForgotPassword={() => navigate('/forgot-password')} 
                />
              } />
              <Route path="/forgot-password" element={
                <ForgotPassword 
                  onBackToLogin={() => navigate('/login')} 
                  onPasswordReset={() => navigate('/login')} 
                />
              } />
              <Route path="/onboarding" element={
                <Onboarding 
                  onComplete={handleOnboardingComplete} 
                  preSelectedPackageId={preSelectedPackageId}
                  onBack={() => navigate('/')} 
                />
              } />
              <Route path="/dashboard" element={
                <Dashboard 
                  onNavigate={handleNavigate}
                  userName={userName}
                  onLogout={() => navigate('/')}
                  userStatus={userStatus}
                  selectedPackage={selectedPackage}
                />
              } />
              <Route path="/contribute" element={
                <Contribute onBack={() => navigate('/dashboard')} />
              } />
              <Route path="/value-preview" element={
                <ValuePreview 
                  onBack={() => navigate('/dashboard')} 
                  selectedPackage={selectedPackage} 
                />
              } />
              <Route path="/announcements" element={
                <Announcements onBack={() => navigate('/dashboard')} />
              } />
              <Route path="/profile" element={
                <Profile 
                  onNavigate={handleNavigate}
                  userName={userName}
                  selectedPackage={selectedPackage}
                  userStatus={userStatus}
                />
              } />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        } />
      </Routes>
      <div className="fixed bottom-0 right-0 z-50">
      <InstallPWA />
      </div>
      <Toaster position="top-center" />
    </>
  );
}