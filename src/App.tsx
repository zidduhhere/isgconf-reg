import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm, Dashboard } from './components/participant';
import { AdminLogin, AdminDashboard } from './components/admin';
import { ExhibitorApp } from './components/exhibitor';
import { Navigation } from './components/shared';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CouponProvider } from './contexts/CouponContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';

// Protected route for user dashboard
const ProtectedUserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

// Protected route for admin dashboard
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentAdmin } = useAdmin();
  return currentAdmin ? <>{children}</> : <Navigate to="/admin/login" />;
};

// User Dashboard Wrapper with CouponProvider
const UserDashboardWrapper: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <CouponProvider participant={currentUser}>
      <Dashboard />
    </CouponProvider>
  );
};

// Loading component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-neutral-600">Loading Event Meal Pass...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* User Routes */}
      <Route path="/" element={
        <>
          <Navigation />
          <LoginForm />
        </>
      } />
      <Route path="/login" element={
        <>
          <Navigation />
          <LoginForm />
        </>
      } />
      <Route path="/dashboard" element={
        <ProtectedUserRoute>
          <UserDashboardWrapper />
        </ProtectedUserRoute>
      } />

      {/* Exhibitor Routes */}
      <Route path="/exhibitor" element={<ExhibitorApp />} />
      <Route path="/exhibitor/*" element={<ExhibitorApp />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={
        <>
          <Navigation />
          <AdminLogin />
        </>
      } />
      <Route path="/admin/dashboard" element={
        <ProtectedAdminRoute>
          <AdminDashboard />
        </ProtectedAdminRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <AppContent />
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;