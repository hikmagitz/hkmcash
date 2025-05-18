import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListOrdered, Settings, Crown } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPremium } = useAuth();
  const currentPage = location.pathname.substring(1) || 'dashboard';

  const handleNavigate = (page: string) => {
    navigate(page === 'dashboard' ? '/' : `/${page}`);
  };

  // Don't show navigation for success page
  const showNavigation = !location.pathname.includes('/success');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {showNavigation && <Header />}
      
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      
      {showNavigation && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 safe-area-inset z-10">
          <div className="grid grid-cols-3 h-16">
            <button
              className={`flex flex-col items-center justify-center ${
                currentPage === 'dashboard'
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => handleNavigate('dashboard')}
            >
              <LayoutDashboard size={20} className="mb-1" />
              <span className="text-xs">Dashboard</span>
            </button>
            
            <button
              className={`flex flex-col items-center justify-center ${
                currentPage === 'transactions'
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => handleNavigate('transactions')}
            >
              <ListOrdered size={20} className="mb-1" />
              <span className="text-xs">Transactions</span>
            </button>
            
            <button
              className={`flex flex-col items-center justify-center ${
                currentPage === 'settings'
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => handleNavigate('settings')}
            >
              <Settings size={20} className="mb-1" />
              <span className="text-xs">Settings</span>
            </button>
            )}
          </div>
        </nav>
      )}
    </div>
  );
};

export default MainLayout;