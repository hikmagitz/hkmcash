import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import PersonalizationPage from './pages/PersonalizationPage';
import AccountPage from './pages/AccountPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import PremiumPage from './pages/PremiumPage';
import SuccessPage from './pages/SuccessPage';
import { TransactionProvider } from './context/TransactionContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

const AppContent = () => {
  const [loading, setLoading] = useState(true);
  
  // Simulate a brief loading period
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-sky-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mr-3"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Loading HKM Cash...</p>
          </div>
          <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-auto">
            <div className="bg-gradient-to-r from-sky-500 to-purple-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            🎉 Demo Mode - No login required!
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <TransactionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="settings" element={<PersonalizationPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="premium" element={<PremiumPage />} />
            <Route path="success" element={<SuccessPage />} />
          </Route>
          <Route path="/account-settings" element={<AccountSettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
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