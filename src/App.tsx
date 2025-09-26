import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Participant } from './types';
import {
  initializeData,
  authenticateParticipant,
  getCurrentUser,
  setCurrentUser
} from './services/storageService';

function App() {
  const [currentUser, setCurrentUserState] = useState<Participant | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'dashboard'>('login');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize data and check for existing user session
    initializeData();
    const existingUser = getCurrentUser();
    if (existingUser) {
      setCurrentUserState(existingUser);
      setCurrentView('dashboard');
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = async (phoneNumber: string) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      const participant = authenticateParticipant(phoneNumber);

      if (participant) {

        setCurrentUser(participant);
        setCurrentUserState(participant);
        setCurrentView('dashboard');
      } else {
        setLoginError('Phone number not found. Please check your number or contact event support.');
      }
    } catch (error) {
      setLoginError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    setCurrentView('login');
    setLoginError(null);
  };

  const navigateToLanding = () => {
    setCurrentView('landing');
    setLoginError(null);
  };

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
    return <Dashboard participant={currentUser} />;
  }

  if (currentView === 'landing') {
    return (
      <LandingPage
        onNavigateToLogin={navigateToLogin}
      />
    );
  }

  // Default to landing page
  return <LoginForm
    onLogin={handleLogin}
    onNavigateToLanding={navigateToLanding}
    error={loginError}
    isLoading={isLoading} />;
}

export default App;