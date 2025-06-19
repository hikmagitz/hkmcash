import React, { useState, useEffect } from 'react';
import { Plus, Moon, Sun, Languages, Settings } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useIntl } from 'react-intl';
import TransactionModal from './TransactionModal';
import Button from './UI/Button';

const Header: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
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
              <h1 className="text-lg font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
                {intl.formatMessage({ id: 'app.title' })}
              </h1>
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
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
              {intl.formatMessage({ id: 'app.title' })}
            </h1>
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