import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Moon, Sun, LogOut, Languages, Crown, User, ChevronDown, X, PlusCircle, Users, UserPlus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTransactions } from '../context/TransactionContext';
import { useIntl } from 'react-intl';
import Button from './UI/Button';
import Badge from './UI/Badge';
import { STRIPE_PRODUCTS } from '../stripe-config';

const Header: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const { signOut, isPremium, user, savedAccounts, switchAccount, removeAccount, addAccount } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { addTransaction, categories, clients, hasReachedLimit } = useTransactions();
  const intl = useIntl();
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'expense',
    date: new Date().toISOString().slice(0, 10),
    client: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
        setShowAccountSwitcher(false);
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

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    setIsProfileOpen(false); // Close dropdown
    try {
      await signOut();
      // Navigation will be handled by AuthContext since user will become null
    } catch (error) {
      console.error('Error logging out:', error);
      setIsLoggingOut(false);
    }
  };

  const getDisplayName = () => {
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const handleSwitchAccount = async (accountId: string) => {
    try {
      await switchAccount(accountId);
      setShowAccountSwitcher(false);
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Error switching account:', error);
    }
  };

  const handleRemoveAccount = (accountId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to remove this account from the list?')) {
      removeAccount(accountId);
    }
  };

  const handleAddAccount = () => {
    setShowAccountSwitcher(false);
    setIsProfileOpen(false);
    addAccount();
  };

  // Form handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData({ ...formData, type, category: '' });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isLoading) return;
    
    console.log('🔄 Form submission started');
    console.log('Form data:', formData);
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        console.log('✅ Form validation passed, adding transaction...');
        
        await addTransaction({
          amount: Number(formData.amount),
          description: formData.description,
          category: formData.category,
          type: formData.type as 'income' | 'expense',
          date: formData.date,
          client: formData.client || undefined,
        });
        
        console.log('✅ Transaction added successfully');
        
        // Reset form
        setFormData({
          amount: '',
          description: '',
          category: '',
          type: 'expense',
          date: new Date().toISOString().slice(0, 10),
          client: '',
        });
        
        // Clear any errors
        setErrors({});
        
        // Close modal
        setIsModalOpen(false);
        
        // Show success feedback
        console.log('✅ Form reset and modal closed');
        
      } catch (error) {
        console.error('❌ Error adding transaction:', error);
        if (error instanceof Error && error.message.includes('limit reached')) {
          alert('You have reached the transaction limit. Please upgrade to premium for unlimited transactions.');
        } else {
          console.error('Error adding transaction:', error);
          alert('Failed to add transaction. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('❌ Form validation failed:', errors);
    }
  };

  const filteredCategories = categories.filter(
    category => category.type === formData.type
  );

  return (
    <>
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
                  {isPremium && (
                    <Badge type="neutral" className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
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
              {!isPremium && (
                <Button 
                  type="secondary"
                  onClick={() => navigate('/premium')}
                  className="flex-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-black hover:from-yellow-200 hover:to-orange-200 border-0 font-bold"
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
              
              {/* Mobile Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-1 px-2 py-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
                >
                  <User size={16} className="text-gray-600 dark:text-gray-300" />
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Account</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                      </div>
                      
                      {/* Account Switcher */}
                      {savedAccounts.length > 0 && (
                        <>
                          <button
                            onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <Users size={16} />
                              <span>Switch Account</span>
                            </div>
                            <ChevronDown size={16} className={`transition-transform ${showAccountSwitcher ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {showAccountSwitcher && (
                            <div className="border-t border-gray-200/50 dark:border-gray-700/50">
                              {savedAccounts.map((account) => (
                                <div
                                  key={account.id}
                                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                  <button
                                    onClick={() => handleSwitchAccount(account.id)}
                                    className="flex-1 text-left flex items-center space-x-2"
                                  >
                                    <User size={14} />
                                    <div>
                                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                                        {account.name}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {account.email}
                                      </p>
                                    </div>
                                    {account.isPremium && (
                                      <Crown size={12} className="text-yellow-500" />
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) => handleRemoveAccount(account.id, e)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={handleAddAccount}
                                className="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 flex items-center space-x-2 transition-colors"
                              >
                                <UserPlus size={16} />
                                <span>Add Account</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 flex items-center space-x-2 disabled:opacity-50 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>{isLoggingOut ? 'Logging out...' : intl.formatMessage({ id: 'action.logout' })}</span>
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

              {!isPremium && (
                <Button 
                  type="secondary"
                  onClick={() => navigate('/premium')}
                  className="bg-gradient-to-r from-yellow-100 to-orange-100 text-black hover:from-yellow-200 hover:to-orange-200 border-0 font-bold"
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

              {/* Desktop Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
                >
                  <User size={18} className="text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Account</span>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-1 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 z-50">
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Account</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {isPremium ? 'Premium Member' : 'Free Account'}
                        </p>
                      </div>
                      
                      {/* Account Switcher */}
                      {savedAccounts.length > 0 && (
                        <>
                          <button
                            onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <Users size={16} />
                              <span>Switch Account ({savedAccounts.length})</span>
                            </div>
                            <ChevronDown size={16} className={`transition-transform ${showAccountSwitcher ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {showAccountSwitcher && (
                            <div className="border-t border-gray-200/50 dark:border-gray-700/50 max-h-64 overflow-y-auto">
                              {savedAccounts.map((account) => (
                                <div
                                  key={account.id}
                                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                  <button
                                    onClick={() => handleSwitchAccount(account.id)}
                                    className="flex-1 text-left flex items-center space-x-3"
                                  >
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                      <User size={14} className="text-white" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {account.name}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {account.email}
                                      </p>
                                      <p className="text-xs text-gray-400 dark:text-gray-500">
                                        Last used: {new Date(account.lastUsed).toLocaleDateString()}
                                      </p>
                                    </div>
                                    {account.isPremium && (
                                      <Crown size={14} className="text-yellow-500" />
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) => handleRemoveAccount(account.id, e)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Remove account"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={handleAddAccount}
                                className="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 flex items-center space-x-2 transition-colors border-t border-gray-200/50 dark:border-gray-700/50"
                              >
                                <UserPlus size={16} />
                                <span>Add Another Account</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 flex items-center space-x-2 disabled:opacity-50 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>{isLoggingOut ? 'Logging out...' : intl.formatMessage({ id: 'action.logout' })}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Modal rendered at footer level */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border-t border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-out">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Add Transaction</h2>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {hasReachedLimit ? (
                <div className="p-6 text-center">
                  <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Transaction Limit Reached</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You've reached the limit of 50 transactions. Upgrade to {STRIPE_PRODUCTS.premium_access.name} for unlimited transactions!
                  </p>
                  <Button 
                    type="primary"
                    onClick={() => navigate('/premium')}
                  >
                    <Crown size={18} />
                    Upgrade to {STRIPE_PRODUCTS.premium_access.name}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button
                      type="button"
                      className={`py-2 rounded-md transition-all ${
                        formData.type === 'expense'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                      onClick={() => handleTypeChange('expense')}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      className={`py-2 rounded-md transition-all ${
                        formData.type === 'income'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                      onClick={() => handleTypeChange('income')}
                    >
                      Income
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                        €
                      </span>
                      <input
                        type="number"
                        name="amount"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleChange}
                        className={`w-full pl-8 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          errors.amount ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="What was this transaction for?"
                      disabled={isLoading}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Client
                    </label>
                    <select
                      name="client"
                      value={formData.client}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300"
                      disabled={isLoading}
                    >
                      <option value="">Select Client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.name}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    >
                      <option value="">Select Category</option>
                      {filteredCategories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.date ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative overflow-hidden font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-lg shadow-sm hover:shadow-lg active:scale-95 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none disabled:shadow-sm px-4 py-2 text-sm md:text-base min-h-[44px] bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl focus:ring-sky-500/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity cursor-pointer hover:scale-105 w-full mt-6"
                  >
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <span className={`relative z-10 flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                      <PlusCircle size={18} />
                      {isLoading ? 'Adding...' : 'Add Transaction'}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;