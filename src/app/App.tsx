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
import { PaymentCallback } from './screens/PaymentCallback';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';
import { InstallPWA } from './components/InstallPWA';
import { TermsModal } from './components/TermsModal';

type Screen = 'landing' | 'login' | 'forgot-password' | 'onboarding' | 'dashboard' | 'contribute' | 'value-preview' | 'announcements' | 'admin-login' | 'admin-dashboard' | 'profile';
type UserStatus = 'active' | 'reserved';

export default function App() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(() => {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser).email : '';
  });
  const [userPhone, setUserPhone] = useState(() => {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser).phone : '';
  });
  const [userName, setUserName] = useState(() => {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser).name : 'Chioma';
  });

  // ... (existing code)

  const [userStatus, setUserStatus] = useState<UserStatus>(() => {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? (JSON.parse(savedUser).status || 'active') : 'active';
  });
  const [selectedPackage, setSelectedPackage] = useState<string>(() => {
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // Map backend ID to frontend name if needed, or use name if available
      // Assuming naive mapping for now based on previous context or defaults
      if (user.package_id === 1) return 'Basic Bundle';
      if (user.package_id === 2) return 'Family Bundle';
      if (user.package_id === 3) return 'Premium Bundle';
      if (user.package?.name) return user.package.name;
    }
    return 'Basic Bundle';
  });
  const [quantity, setQuantity] = useState<number>(() => {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? (JSON.parse(savedUser).slots || 1) : 1;
  });
  const [preSelectedPackageId, setPreSelectedPackageId] = useState<string | null>(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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

  const handleOnboardingComplete = (status: UserStatus = 'active', packageName?: string, userQuantity?: number) => {
    setUserStatus(status);
    if (packageName) {
      setSelectedPackage(packageName);
    }
    if (userQuantity) {
      setQuantity(userQuantity);
    }
    
    // Show terms modal on first login
    if (!hasAcceptedTerms) {
      setShowTermsModal(true);
    }

    navigate('/dashboard');
  };

  const handleAcceptTerms = () => {
    setHasAcceptedTerms(true);
    setShowTermsModal(false);
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
                  quantity={quantity}
                />
              } />
              <Route path="/contribute" element={
                <Contribute 
                  onBack={() => navigate('/dashboard')} 
                  userPackage={selectedPackage}
                  userQuantity={quantity}
                  userEmail={userEmail}
                />
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
              <Route path="/payment/callback" element={<PaymentCallback />} />
              <Route path="/profile" element={
                <Profile 
                  onNavigate={handleNavigate}
                  userName={userName}
                  userEmail={userEmail}
                  userPhone={userPhone}
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
      
      {/* Terms Modal */}
      <TermsModal 
        isOpen={showTermsModal}
        onAccept={handleAcceptTerms}
      />
    </>
  );
}