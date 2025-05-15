import React from 'react';
import { LayoutDashboard, ListOrdered, Settings } from 'lucide-react';
import Header from '../components/Header';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentPage, onNavigate }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      
      <main className="flex-1 pb-16">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-10">
        <div className="max-w-6xl mx-auto flex justify-around items-center">
          <button
            className={`flex flex-col items-center py-3 px-6 ${
              currentPage === 'dashboard'
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => {
              onNavigate('dashboard');
              window.history.pushState({}, '', '/');
            }}
          >
            <LayoutDashboard size={24} />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          
          <button
            className={`flex flex-col items-center py-3 px-6 ${
              currentPage === 'transactions'
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => {
              onNavigate('transactions');
              window.history.pushState({}, '', '/transactions');
            }}
          >
            <ListOrdered size={24} />
            <span className="text-xs mt-1">Transactions</span>
          </button>
          
          <button
            className={`flex flex-col items-center py-3 px-6 ${
              currentPage === 'settings'
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => {
              onNavigate('settings');
              window.history.pushState({}, '', '/settings');
            }}
          >
            <Settings size={24} />
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;