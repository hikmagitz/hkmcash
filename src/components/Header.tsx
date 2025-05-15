import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Moon, Sun, LogOut, Languages, Crown } from 'lucide-react';
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
  const { signOut, isPremium } = useAuth();
  const { language, setLanguage } = useLanguage();
  const intl = useIntl();
  const navigate = useNavigate();
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
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

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 py-3 md:py-4 px-3 md:px-6 shadow-sm sticky top-0 z-10 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <img 
                src="https://raw.githubusercontent.com/hikmagitz/hkmcash/refs/heads/main/files_4787970-1747344275123-ChatGPT_Image_15_mai_2025_20_14_10.png" 
                alt="Hikma Cash Logo"
                className="h-8 w-8 mr-2"
              />
              <div className="flex items-center">
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                  {intl.formatMessage({ id: 'app.title' })}
                </h1>
                {isPremium && (
                  <Badge type="neutral" className="ml-2 bg-yellow-100 text-yellow-800">
                    <Crown size={12} className="mr-1" />
                    {STRIPE_PRODUCTS.premium_access.name}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleLanguage}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={intl.formatMessage({ id: 'common.language' })}
              >
                <Languages className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button 
                onClick={toggleTheme}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
            {!isPremium && (
              <Button 
                type="secondary"
                onClick={() => navigate('/premium')}
                className="flex-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              >
                <Crown size={16} />
                {intl.formatMessage({ id: 'premium.upgrade' })}
              </Button>
            )}
            <Button 
              type="primary" 
              onClick={() => setIsModalOpen(true)}
              className="flex-1"
            >
              <Plus size={16} />
              {intl.formatMessage({ id: 'action.addTransaction' })}
            </Button>
            <Button 
              type="secondary"
              onClick={handleLogout}
              className="!px-2"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="https://raw.githubusercontent.com/hikmagitz/hkmcash/refs/heads/main/files_4787970-1747344275123-ChatGPT_Image_15_mai_2025_20_14_10.png" 
              alt="Hikma Cash Logo"
              className="h-10 w-10 mr-3"
            />
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                {intl.formatMessage({ id: 'app.title' })}
              </h1>
              {isPremium && (
                <Badge type="neutral" className="ml-2 bg-yellow-100 text-yellow-800">
                  <Crown size={14} className="mr-1" />
                  {STRIPE_PRODUCTS.premium_access.name}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={intl.formatMessage({ id: 'common.language' })}
            >
              <Languages className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {!isPremium && (
              <Button 
                type="secondary"
                onClick={() => navigate('/premium')}
                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              >
                <Crown size={18} />
                {intl.formatMessage({ id: 'premium.upgrade' })}
              </Button>
            )}
            
            <Button 
              type="primary" 
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} />
              {intl.formatMessage({ id: 'action.addTransaction' })}
            </Button>

            <Button 
              type="secondary"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              {intl.formatMessage({ id: 'action.logout' })}
            </Button>
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