import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Palette, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  X, 
  Save,
  Building,
  Users,
  Tag,
  Crown,
  FileText,
  Database,
  Sparkles,
  Globe,
  Moon,
  Sun,
  Languages,
  Euro,
  DollarSign,
  PoundSterling,
  Yen,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useIntl } from 'react-intl';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useStripe } from '../hooks/useStripe';
import { SUPPORTED_CURRENCIES } from '../utils/helpers';
import { STRIPE_PRODUCTS } from '../stripe-config';
import * as XLSX from 'xlsx';

const PersonalizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    categories, 
    clients, 
    addCategory, 
    deleteCategory, 
    addClient, 
    deleteClient, 
    transactions,
    enterpriseName,
    setEnterpriseName,
    isLoading
  } = useTransactions();
  const { isPremium } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { redirectToCheckout } = useStripe();
  const intl = useIntl();

  // Loading states
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  
  // Form states
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#3B82F6',
  });
  const [newClient, setNewClient] = useState({ name: '' });
  const [tempEnterpriseName, setTempEnterpriseName] = useState(enterpriseName);
  const [preferredCurrency, setPreferredCurrency] = useState(() => 
    localStorage.getItem('preferredCurrency') || 'EUR'
  );
  
  // UI states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
  }>>([]);

  // Initialize dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark));
  }, []);

  // Update enterprise name when context changes
  useEffect(() => {
    setTempEnterpriseName(enterpriseName);
  }, [enterpriseName]);

  const setLoading = (key: string, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleCurrencyChange = (currency: string) => {
    setPreferredCurrency(currency);
    localStorage.setItem('preferredCurrency', currency);
    addNotification('success', `Currency changed to ${currency}`);
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return;

    setLoading('addCategory', true);
    try {
      await addCategory(newCategory);
      setNewCategory({ name: '', type: 'expense', color: '#3B82F6' });
      setShowCategoryForm(false);
      addNotification('success', 'Category added successfully');
    } catch (error) {
      addNotification('error', 'Failed to add category');
    } finally {
      setLoading('addCategory', false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    setLoading(`deleteCategory-${id}`, true);
    try {
      await deleteCategory(id);
      addNotification('success', 'Category deleted successfully');
    } catch (error) {
      addNotification('error', 'Failed to delete category');
    } finally {
      setLoading(`deleteCategory-${id}`, false);
    }
  };

  const handleAddClient = async () => {
    if (!newClient.name.trim()) return;

    setLoading('addClient', true);
    try {
      await addClient(newClient);
      setNewClient({ name: '' });
      setShowClientForm(false);
      addNotification('success', 'Client added successfully');
    } catch (error) {
      addNotification('error', 'Failed to add client');
    } finally {
      setLoading('addClient', false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;

    setLoading(`deleteClient-${id}`, true);
    try {
      await deleteClient(id);
      addNotification('success', 'Client deleted successfully');
    } catch (error) {
      addNotification('error', 'Failed to delete client');
    } finally {
      setLoading(`deleteClient-${id}`, false);
    }
  };

  const handleSaveEnterpriseName = async () => {
    if (tempEnterpriseName === enterpriseName) return;

    setLoading('saveEnterprise', true);
    try {
      await setEnterpriseName(tempEnterpriseName);
      addNotification('success', 'Enterprise name saved successfully');
    } catch (error) {
      addNotification('error', 'Failed to save enterprise name');
    } finally {
      setLoading('saveEnterprise', false);
    }
  };

  const handleExportData = async (format: 'excel' | 'json') => {
    if (!isPremium) {
      if (window.confirm(`${format.toUpperCase()} export is a premium feature. Would you like to upgrade?`)) {
        setLoading('upgrade', true);
        try {
          await redirectToCheckout('premium_access');
        } catch (error) {
          addNotification('error', 'Failed to redirect to checkout');
        } finally {
          setLoading('upgrade', false);
        }
      }
      return;
    }

    setLoading(`export-${format}`, true);
    try {
      if (format === 'excel') {
        const ws = XLSX.utils.json_to_sheet(transactions.map(t => ({
          Date: t.date,
          Type: t.type,
          Category: t.category,
          Description: t.description,
          Client: t.client || '',
          Amount: t.amount
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        XLSX.writeFile(wb, `${enterpriseName || 'HKM-Cash'}-transactions.xlsx`);
      } else {
        const dataStr = JSON.stringify({ transactions, categories, clients }, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${enterpriseName || 'HKM-Cash'}-data.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
      addNotification('success', `Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      addNotification('error', `Failed to export ${format.toUpperCase()}`);
    } finally {
      setLoading(`export-${format}`, false);
    }
  };

  const handleUpgrade = async () => {
    setLoading('upgrade', true);
    try {
      await redirectToCheckout('premium_access');
    } catch (error) {
      addNotification('error', 'Failed to redirect to checkout');
    } finally {
      setLoading('upgrade', false);
    }
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'USD': return <DollarSign size={16} />;
      case 'GBP': return <PoundSterling size={16} />;
      case 'JPY': case 'CNY': return <Yen size={16} />;
      default: return <Euro size={16} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <Settings className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header - moved to background */}
      <div className="sticky top-0 z-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110">
                    <Settings className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles className="w-2 h-2 text-white" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                    Personnalisation
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configurez tous vos paramètres personnels en un seul endroit
                  </p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-md transition-all">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Sécurisé & Synchronisé
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md border animate-slide-up ${
                notification.type === 'success' 
                  ? 'bg-green-50/90 border-green-200 text-green-800 dark:bg-green-900/90 dark:border-green-800 dark:text-green-200'
                  : notification.type === 'error'
                  ? 'bg-red-50/90 border-red-200 text-red-800 dark:bg-red-900/90 dark:border-red-800 dark:text-red-200'
                  : 'bg-blue-50/90 border-blue-200 text-blue-800 dark:bg-blue-900/90 dark:border-blue-800 dark:text-blue-200'
              }`}
            >
              {notification.type === 'success' && <CheckCircle size={16} />}
              {notification.type === 'error' && <AlertTriangle size={16} />}
              {notification.type === 'info' && <Info size={16} />}
              <span className="text-sm font-medium">{notification.message}</span>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-current hover:opacity-70 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* General Settings */}
          <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all hover:scale-110">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Paramètres Généraux
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Langue, thème et devise
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Theme Toggle */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {darkMode ? <Moon className="w-5 h-5 text-blue-600" /> : <Sun className="w-5 h-5 text-yellow-600" />}
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          Mode Sombre
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Basculer entre les thèmes clair et sombre
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        darkMode ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Language Toggle */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Languages className="w-5 h-5 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          Langue
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Langue actuelle: {language === 'en' ? 'English' : 'العربية'}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="secondary"
                      onClick={toggleLanguage}
                      className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20"
                    >
                      {language === 'en' ? 'العربية' : 'English'}
                    </Button>
                  </div>
                </div>

                {/* Currency Selection */}
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    {getCurrencyIcon(preferredCurrency)}
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        Devise Préférée
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Choisissez votre devise pour l'affichage des montants
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {SUPPORTED_CURRENCIES.slice(0, 4).map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => handleCurrencyChange(currency.code)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition-all ${
                          preferredCurrency === currency.code
                            ? 'bg-yellow-500 text-white shadow-md'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/20'
                        }`}
                      >
                        {getCurrencyIcon(currency.code)}
                        <span>{currency.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Enterprise Settings */}
          <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all hover:scale-110">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Paramètres d'Entreprise
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nom de votre entreprise
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de l'Entreprise
                  </label>
                  <input
                    type="text"
                    value={tempEnterpriseName}
                    onChange={(e) => setTempEnterpriseName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                    placeholder="Entrez le nom de votre entreprise"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Ce nom apparaîtra sur vos reçus PDF et exports Excel
                  </p>
                </div>

                <Button
                  type="primary"
                  onClick={handleSaveEnterpriseName}
                  loading={loadingStates.saveEnterprise}
                  disabled={tempEnterpriseName === enterpriseName}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <Save size={18} />
                  Sauvegarder
                </Button>
              </div>
            </div>
          </Card>

          {/* Categories Management */}
          <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all hover:scale-110">
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      Gestion des Catégories
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {categories.length} catégories configurées
                    </p>
                  </div>
                </div>
                
                <Button
                  type="success"
                  onClick={() => setShowCategoryForm(!showCategoryForm)}
                  className="hover:scale-110 transition-transform"
                >
                  <Plus size={18} />
                  Ajouter
                </Button>
              </div>

              {showCategoryForm && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 animate-slide-up">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Nom de la catégorie"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Type
                        </label>
                        <select
                          value={newCategory.type}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="expense">Dépense</option>
                          <option value="income">Revenu</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Couleur
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newCategory.color}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                          className="w-12 h-10 border border-green-300 rounded-lg cursor-pointer"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {newCategory.color}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        type="success"
                        onClick={handleAddCategory}
                        loading={loadingStates.addCategory}
                        disabled={!newCategory.name.trim()}
                        className="flex-1"
                      >
                        <Plus size={16} />
                        Ajouter
                      </Button>
                      <Button
                        type="secondary"
                        onClick={() => setShowCategoryForm(false)}
                        className="flex-1"
                      >
                        <X size={16} />
                        Annuler
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="max-h-64 overflow-y-auto space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <div>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {category.name}
                        </span>
                        <Badge
                          type={category.type === 'income' ? 'income' : 'expense'}
                          className="ml-2"
                        >
                          {category.type === 'income' ? 'Revenu' : 'Dépense'}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      type="danger"
                      onClick={() => handleDeleteCategory(category.id)}
                      loading={loadingStates[`deleteCategory-${category.id}`]}
                      className="hover:scale-110 transition-transform"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Clients Management */}
          <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all hover:scale-110">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      Gestion des Clients
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {clients.length} clients enregistrés
                    </p>
                  </div>
                </div>
                
                <Button
                  type="primary"
                  onClick={() => setShowClientForm(!showClientForm)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-110 transition-all"
                >
                  <Plus size={18} />
                  Ajouter
                </Button>
              </div>

              {showClientForm && (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800 animate-slide-up">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nom du Client
                      </label>
                      <input
                        type="text"
                        value={newClient.name}
                        onChange={(e) => setNewClient({ name: e.target.value })}
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Entrez le nom du client"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        type="primary"
                        onClick={handleAddClient}
                        loading={loadingStates.addClient}
                        disabled={!newClient.name.trim()}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <Plus size={16} />
                        Ajouter
                      </Button>
                      <Button
                        type="secondary"
                        onClick={() => setShowClientForm(false)}
                        className="flex-1"
                      >
                        <X size={16} />
                        Annuler
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="max-h-64 overflow-y-auto space-y-2">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {client.name}
                      </span>
                    </div>
                    
                    <Button
                      type="danger"
                      onClick={() => handleDeleteClient(client.id)}
                      loading={loadingStates[`deleteClient-${client.id}`]}
                      className="hover:scale-110 transition-transform"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Data Management */}
          <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden lg:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all hover:scale-110">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Gestion des Données
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Exportez vos données ou passez à Premium
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Options */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Options d'Export
                  </h3>
                  
                  <div className="space-y-3">
                    <Button
                      type="secondary"
                      onClick={() => handleExportData('excel')}
                      loading={loadingStates['export-excel']}
                      className="w-full justify-start border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20"
                    >
                      <FileText size={18} />
                      {isPremium ? 'Exporter en Excel' : 'Excel (Premium)'}
                      {!isPremium && <Crown size={16} className="ml-auto text-yellow-500" />}
                    </Button>
                    
                    <Button
                      type="secondary"
                      onClick={() => handleExportData('json')}
                      loading={loadingStates['export-json']}
                      className="w-full justify-start border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    >
                      <Database size={18} />
                      {isPremium ? 'Exporter en JSON' : 'JSON (Premium)'}
                      {!isPremium && <Crown size={16} className="ml-auto text-yellow-500" />}
                    </Button>
                  </div>
                </div>

                {/* Premium Upgrade */}
                {!isPremium && (
                  <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <div className="text-center">
                      <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-bounce" />
                      <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                        Passez à {STRIPE_PRODUCTS.premium_access.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Débloquez toutes les fonctionnalités premium
                      </p>
                      
                      <div className="space-y-2 mb-4 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-500" />
                          <span>Transactions illimitées</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-500" />
                          <span>Reçus PDF</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-500" />
                          <span>Export Excel & JSON</span>
                        </div>
                      </div>
                      
                      <Button
                        type="primary"
                        onClick={handleUpgrade}
                        loading={loadingStates.upgrade}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                      >
                        <Crown size={18} />
                        Passer à Premium - €{STRIPE_PRODUCTS.premium_access.price}/mois
                      </Button>
                    </div>
                  </div>
                )}

                {/* Premium Status */}
                {isPremium && (
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                        Compte Premium Actif
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Profitez de toutes les fonctionnalités premium
                      </p>
                      
                      <Badge
                        type="neutral"
                        className="bg-gradient-to-r from-green-400 to-emerald-400 text-white border-0 shadow-md"
                      >
                        <Crown size={14} className="mr-1" />
                        {STRIPE_PRODUCTS.premium_access.name}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tous vos paramètres sont automatiquement sauvegardés et synchronisés
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationPage;