import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Moon, Sun, LogOut, Languages, Crown, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useIntl } from 'react-intl';
import TransactionModal from './TransactionModal';
import Button from './UI/Button';
import Badge from './UI/Badge';
import { STRIPE_PRODUCTS } from '../stripe-config';

const Header: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isPremium, user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const intl = useIntl();
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setDarkMode(!darkMode);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleLogout = () => {
    // In demo mode, just show a message
    alert('This is demo mode - logout is disabled. All data is stored locally in your browser.');
    setIsProfileOpen(false);
  };

  const getDisplayName = () => {
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Demo User';
  };

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md py-4 px-4 md:px-6 shadow-lg border-b border-white/20 dark:border-gray-700/50 sticky top-0 z-40 transition-all">
      <div className="max-w-6xl mx-auto">
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-purple-500 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div className="flex items-center">
                <h1 className="text-lg font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
                  {intl.formatMessage({ id: 'app.title' })}
                </h1>
                <Badge type="neutral" className="ml-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white border-0">
                  <span className="text-xs">DEMO</span>
                </Badge>
                {isPremium && (
                  <Badge type="neutral" className="ml-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
                    <Crown size={12} className="mr-1" />
                    {STRIPE_PRODUCTS.premium_access.name}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleLanguage}
                className="p-1.5 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
                aria-label={intl.formatMessage({ id: 'common.language' })}
              >
                <Languages className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button 
                onClick={toggleTheme}
                className="p-1.5 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              type="primary" 
              onClick={() => setIsModalOpen(true)}
              className="flex-1"
            >
              <Plus size={16} />
              {intl.formatMessage({ id: 'action.addTransaction' })}
            </Button>
            
            {/* Mobile Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-1 px-2 py-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
              >
                <User size={16} className="text-gray-600 dark:text-gray-300" />
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Demo Account</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 flex items-center space-x-2 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Demo Mode Info</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
                {intl.formatMessage({ id: 'app.title' })}
              </h1>
              <Badge type="neutral" className="ml-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white border-0 shadow-md">
                <span className="text-xs font-bold">DEMO</span>
              </Badge>
              {isPremium && (
                <Badge type="neutral" className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 shadow-md">
                  <Crown size={14} className="mr-1" />
                  {STRIPE_PRODUCTS.premium_access.name}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
              aria-label={intl.formatMessage({ id: 'common.language' })}
            >
              <Languages className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            
            <Button 
              type="primary" 
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} />
              {intl.formatMessage({ id: 'action.addTransaction' })}
            </Button>

            {/* Desktop Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
              >
                <User size={18} className="text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Demo Account</span>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 z-50">
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Demo Account</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        🎉 All Features Unlocked
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 flex items-center space-x-2 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Demo Mode Info</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </header>
  );
};

export default Header;