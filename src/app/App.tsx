import { useState } from 'react';
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
import { TermsModal } from './components/TermsModal';
import { contributionHistory } from './data/mockData';

type Screen = 'landing' | 'login' | 'forgot-password' | 'onboarding' | 'dashboard' | 'contribute' | 'value-preview' | 'announcements' | 'admin-login' | 'admin-dashboard' | 'profile';
type UserStatus = 'active' | 'reserved';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [userName, setUserName] = useState('Chioma');
  const [userStatus, setUserStatus] = useState<UserStatus>('active');
  const [selectedPackage, setSelectedPackage] = useState<string>('Basic Bundle');
  const [quantity, setQuantity] = useState<number>(1);
  const [preSelectedPackageId, setPreSelectedPackageId] = useState<string | null>(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleGetStarted = (packageId?: string) => {
    if (packageId) {
      setPreSelectedPackageId(packageId);
    }
    setCurrentScreen('onboarding');
  };

  const handleSignIn = () => {
    setCurrentScreen('login');
  };

  const handleAdminAccess = () => {
    setCurrentScreen('admin-login');
  };

  const handleLogin = () => {
    setCurrentScreen('dashboard');
  };

  const handleForgotPassword = () => {
    setCurrentScreen('forgot-password');
  };

  const handlePasswordReset = () => {
    setCurrentScreen('login');
  };

  const handleAdminLogin = () => {
    setCurrentScreen('admin-dashboard');
  };

  const handleAdminLogout = () => {
    setCurrentScreen('landing');
  };

  const handleBackToLanding = () => {
    setCurrentScreen('landing');
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
    
    setCurrentScreen('dashboard');
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentScreen('landing');
  };

  const handleAcceptTerms = () => {
    setHasAcceptedTerms(true);
    setShowTermsModal(false);
  };

  const handleDeclineTerms = () => {
    setShowTermsModal(false);
  };

  return (
    <>
      {(currentScreen === 'admin-login' || currentScreen === 'admin-dashboard') ? (
        <>
          {currentScreen === 'admin-login' && (
            <AdminLogin onLogin={handleAdminLogin} />
          )}
          
          {currentScreen === 'admin-dashboard' && (
            <AdminDashboard onLogout={handleAdminLogout} />
          )}
        </>
      ) : (
        <div className="max-w-[430px] mx-auto min-h-screen bg-white">
          {currentScreen === 'landing' && (
            <Landing onGetStarted={handleGetStarted} onSignIn={handleSignIn} onAdminAccess={handleAdminAccess} />
          )}
          
          {currentScreen === 'login' && (
            <Login onLogin={handleLogin} onBackToLanding={handleBackToLanding} onForgotPassword={handleForgotPassword} />
          )}
          
          {currentScreen === 'forgot-password' && (
            <ForgotPassword onBackToLogin={handleSignIn} onPasswordReset={handlePasswordReset} />
          )}
          
          {currentScreen === 'onboarding' && (
            <Onboarding 
              onComplete={handleOnboardingComplete} 
              preSelectedPackageId={preSelectedPackageId}
              onBack={handleBackToLanding}
            />
          )}
          
          {currentScreen === 'dashboard' && (
            <Dashboard 
              onNavigate={handleNavigate}
              userName={userName}
              onLogout={handleLogout}
              userStatus={userStatus}
              selectedPackage={selectedPackage}
              quantity={quantity}
            />
          )}
          
          {currentScreen === 'contribute' && (
            <Contribute 
              onBack={handleBackToDashboard} 
              userPackage={selectedPackage}
              userQuantity={quantity}
              userEmail="chioma@email.com"
            />
          )}
          
          {currentScreen === 'value-preview' && (
            <ValuePreview onBack={handleBackToDashboard} selectedPackage={selectedPackage} />
          )}
          
          {currentScreen === 'announcements' && (
            <Announcements onBack={handleBackToDashboard} />
          )}
          
          {currentScreen === 'profile' && (
            <Profile 
              onNavigate={handleNavigate}
              userName={userName}
              selectedPackage={selectedPackage}
              userStatus={userStatus}
            />
          )}
        </div>
      )}
      
      {/* Terms Modal */}
      <TermsModal 
        isOpen={showTermsModal}
        onAccept={handleAcceptTerms}
      />
    </>
  );
}