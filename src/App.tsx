import React, { useState, useEffect } from 'react';
import MainLayout from './layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';
import { TransactionProvider } from './context/TransactionContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, loading } = useAuth();
  
  useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname;
      
      if (path === '/transactions') {
        setCurrentPage('transactions');
      } else if (path === '/settings') {
        setCurrentPage('settings');
      } else {
        setCurrentPage('dashboard');
      }
    };
    
    handleNavigation();
    
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <AuthPage />;
  }
  
  const renderPage = () => {
    switch (currentPage) {
      case 'transactions':
        return <TransactionsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <TransactionProvider>
      <MainLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </MainLayout>
    </TransactionProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;