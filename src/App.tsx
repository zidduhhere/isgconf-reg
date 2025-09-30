import React from 'react';
import { LoginForm } from './components/LoginForm';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CouponProvider } from './contexts/CouponContext';

const AppContent: React.FC = () => {
  const { currentView, currentUser, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading Event Meal Pass...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'dashboard' && currentUser) {
    return (
      <CouponProvider participant={currentUser}>
        <Dashboard />
      </CouponProvider>
    );
  }

  if (currentView === 'landing') {
    return <LandingPage />;
  }

  // Default to login
  return <LoginForm />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;