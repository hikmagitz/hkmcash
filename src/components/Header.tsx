import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Moon, Sun, LogOut, Languages, Crown, User, ChevronDown, X, PlusCircle, Search } from 'lucide-react';
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
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const { signOut, isPremium, user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { addTransaction, categories, clients, hasReachedLimit } = useTransactions();
  const intl = useIntl();
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);
  const clientDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
        setClientSearchTerm('');
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
        setCategorySearchTerm('');
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

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  // Filter categories based on search term
  const searchFilteredCategories = filteredCategories.filter(category =>
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const handleClientSelect = (clientName: string) => {
    setFormData({ ...formData, client: clientName });
    setIsClientDropdownOpen(false);
    setClientSearchTerm('');
  };

  const handleCategorySelect = (categoryName: string) => {
    setFormData({ ...formData, category: categoryName });
    setIsCategoryDropdownOpen(false);
    setCategorySearchTerm('');
  };

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
                    <div className="relative" ref={clientDropdownRef}>
                      <div
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300 cursor-pointer flex items-center justify-between"
                        onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                      >
                        <span className={formData.client ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                          {formData.client || 'Select Client'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {isClientDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {/* Search input */}
                          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <input
                                type="text"
                                value={clientSearchTerm}
                                onChange={(e) => setClientSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-600 dark:text-white text-sm"
                                placeholder="Search clients..."
                                autoFocus
                              />
                            </div>
                          </div>
                          
                          {/* Clear selection option */}
                          <div
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600"
                            onClick={() => handleClientSelect('')}
                          >
                            <span className="italic">No Client</span>
                          </div>
                          
                          {/* Filtered clients */}
                          {filteredClients.length === 0 && clientSearchTerm ? (
                            <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                              No clients found matching "{clientSearchTerm}"
                            </div>
                          ) : (
                            filteredClients.map((client) => (
                              <div
                                key={client.id}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white flex items-center"
                                onClick={() => handleClientSelect(client.name)}
                              >
                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                {client.name}
                              </div>
                            ))
                          )}
                          
                          {clients.length === 0 && (
                            <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                              No clients available. Add clients in Settings.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <div className="relative" ref={categoryDropdownRef}>
                      <div
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300 cursor-pointer flex items-center justify-between"
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                      >
                        <span className={formData.category ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                          {formData.category || 'Select Category'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {isCategoryDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {/* Search input */}
                          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <input
                                type="text"
                                value={categorySearchTerm}
                                onChange={(e) => setCategorySearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-600 dark:text-white text-sm"
                                placeholder="Search categories..."
                                autoFocus
                              />
                            </div>
                          </div>
                          
                          {/* Filtered categories */}
                          {searchFilteredCategories.length === 0 && categorySearchTerm ? (
                            <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                              No categories found matching "{categorySearchTerm}"
                            </div>
                          ) : (
                            searchFilteredCategories.map((category) => (
                              <div
                                key={category.id}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white flex items-center"
                                onClick={() => handleCategorySelect(category.name)}
                              >
                                <div 
                                  className="w-4 h-4 rounded-full mr-2"
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            ))
                          )}
                          
                          {filteredCategories.length === 0 && (
                            <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                              No categories available for {formData.type}. Add categories in Settings.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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