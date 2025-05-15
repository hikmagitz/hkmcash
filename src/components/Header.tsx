import React, { useState, useEffect } from 'react';
import { Plus, Moon, Sun, LogOut, Languages } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useIntl } from 'react-intl';
import TransactionModal from './TransactionModal';
import Button from './UI/Button';

const Header: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const intl = useIntl();
  
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
    <header className="bg-white dark:bg-gray-800 py-4 px-6 shadow-sm sticky top-0 z-10 transition-colors">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-teal-600 text-white p-2 rounded-md mr-3">
            <span className="font-bold text-xl">$</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {intl.formatMessage({ id: 'app.title' })}
          </h1>
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
      
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </header>
  );
};

export default Header;