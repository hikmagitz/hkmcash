import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListOrdered, Settings, User } from 'lucide-react';
import Header from '../components/Header';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.substring(1) || 'dashboard';

  const handleNavigate = (page: string) => {
    navigate(page === 'dashboard' ? '/' : `/${page}`);
  };

  // Don't show navigation for success page
  const showNavigation = !location.pathname.includes('/success');

  return (
    <div className="flex flex-col min-h-[100dvh] w-full transition-colors">
      {showNavigation && <Header />}
      
      <main className="flex-1 w-full pb-24 px-4 md:px-6">
        <Outlet />
      </main>
      
      {showNavigation && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-2xl border-t border-white/20 dark:border-gray-700/50 safe-area-inset z-10">
          <div className="grid grid-cols-4 h-16">
            <button
              className={`flex flex-col items-center justify-center transition-all duration-200 ${
                currentPage === 'dashboard'
                  ? 'text-sky-600 dark:text-sky-400 bg-gradient-to-t from-sky-50 to-transparent dark:from-sky-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400'
              }`}
              onClick={() => handleNavigate('dashboard')}
            >
              <LayoutDashboard size={20} className="mb-1" />
              <span className="text-xs font-medium">Dashboard</span>
            </button>
            
            <button
              className={`flex flex-col items-center justify-center transition-all duration-200 ${
                currentPage === 'transactions'
                  ? 'text-sky-600 dark:text-sky-400 bg-gradient-to-t from-sky-50 to-transparent dark:from-sky-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400'
              }`}
              onClick={() => handleNavigate('transactions')}
            >
              <ListOrdered size={20} className="mb-1" />
              <span className="text-xs font-medium">Transactions</span>
            </button>
            
            <button
              className={`flex flex-col items-center justify-center transition-all duration-200 ${
                currentPage === 'settings'
                  ? 'text-sky-600 dark:text-sky-400 bg-gradient-to-t from-sky-50 to-transparent dark:from-sky-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400'
              }`}
              onClick={() => handleNavigate('settings')}
            >
              <Settings size={20} className="mb-1" />
              <span className="text-xs font-medium">Settings</span>
            </button>
            
            <button
              className={`flex flex-col items-center justify-center transition-all duration-200 ${
                currentPage === 'account'
                  ? 'text-sky-600 dark:text-sky-400 bg-gradient-to-t from-sky-50 to-transparent dark:from-sky-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400'
              }`}
              onClick={() => handleNavigate('account')}
            >
              <User size={20} className="mb-1" />
              <span className="text-xs font-medium">Account</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default MainLayout;