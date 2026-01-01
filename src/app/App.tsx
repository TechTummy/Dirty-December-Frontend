import { useState } from 'react';
import { Landing } from './screens/Landing';
import { Login } from './screens/Login';
import { Onboarding } from './screens/Onboarding';
import { Dashboard } from './screens/Dashboard';
import { Contribute } from './screens/Contribute';
import { ValuePreview } from './screens/ValuePreview';
import { Announcements } from './screens/Announcements';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';
import { contributionHistory } from './data/mockData';

type Screen = 'landing' | 'login' | 'onboarding' | 'dashboard' | 'contribute' | 'value-preview' | 'announcements' | 'admin-login' | 'admin-dashboard';
type UserStatus = 'active' | 'reserved';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [userName, setUserName] = useState('Chioma');
  const [userStatus, setUserStatus] = useState<UserStatus>('active');
  const [selectedPackage, setSelectedPackage] = useState<string>('Basic Bundle');

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleGetStarted = () => {
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

  const handleAdminLogin = () => {
    setCurrentScreen('admin-dashboard');
  };

  const handleAdminLogout = () => {
    setCurrentScreen('landing');
  };

  const handleBackToLanding = () => {
    setCurrentScreen('landing');
  };

  const handleOnboardingComplete = (status: UserStatus = 'active', packageName?: string) => {
    setUserStatus(status);
    if (packageName) {
      setSelectedPackage(packageName);
    }
    setCurrentScreen('dashboard');
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentScreen('landing');
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
            <Login onLogin={handleLogin} onBackToLanding={handleBackToLanding} />
          )}
          
          {currentScreen === 'onboarding' && (
            <Onboarding onComplete={handleOnboardingComplete} />
          )}
          
          {currentScreen === 'dashboard' && (
            <Dashboard 
              onNavigate={handleNavigate}
              userName={userName}
              onLogout={handleLogout}
              userStatus={userStatus}
              selectedPackage={selectedPackage}
            />
          )}
          
          {currentScreen === 'contribute' && (
            <Contribute onBack={handleBackToDashboard} />
          )}
          
          {currentScreen === 'value-preview' && (
            <ValuePreview onBack={handleBackToDashboard} selectedPackage={selectedPackage} />
          )}
          
          {currentScreen === 'announcements' && (
            <Announcements onBack={handleBackToDashboard} />
          )}
        </div>
      )}
    </>
  );
}