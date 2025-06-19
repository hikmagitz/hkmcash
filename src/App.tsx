import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import PersonalizationPage from './pages/PersonalizationPage';
import AccountPage from './pages/AccountPage';
import PremiumPage from './pages/PremiumPage';
import SuccessPage from './pages/SuccessPage';
import AuthPage from './pages/AuthPage';
import { TransactionProvider } from './context/TransactionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

const AppContent = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading HKM Cash...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
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