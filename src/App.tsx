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
import { LanguageProvider } from './context/LanguageContext';

const AppContent = () => {
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
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;