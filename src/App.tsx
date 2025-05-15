import React, { useState, useEffect } from 'react';
import MainLayout from './layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import SettingsPage from './pages/SettingsPage';
import PremiumPage from './pages/PremiumPage';
import AuthPage from './pages/AuthPage';
import { TransactionProvider } from './context/TransactionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

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
      } else if (path === '/premium') {
        setCurrentPage('premium');
      } else {
        setCurrentPage('dashboard');
      }
    };
    
    handleNavigation();
    
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
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
      case 'premium':
        return <PremiumPage />;
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
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;