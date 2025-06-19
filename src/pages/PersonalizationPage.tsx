import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
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
  FileText,
  Crown,
  Sparkles
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { useStripe } from '../hooks/useStripe';
import { SUPPORTED_CURRENCIES } from '../utils/helpers';
import { exportToExcel, exportToJSON } from '../utils/exportUtils';
import { STRIPE_PRODUCTS } from '../stripe-config';

const PersonalizationPage: React.FC = () => {
  const intl = useIntl();
  const { 
    categories, 
    addCategory, 
    deleteCategory, 
    enterpriseName, 
    setEnterpriseName 
  } = useTransactions();
  const { isPremium } = useAuth();
  const { redirectToCheckout } = useStripe();
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#3B82F6',
  });
  
  const [tempEnterpriseName, setTempEnterpriseName] = useState(enterpriseName);
  const [isLoading, setIsLoading] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState(() => 
    localStorage.getItem('preferredCurrency') || 'EUR'
  );

  useEffect(() => {
    setTempEnterpriseName(enterpriseName);
  }, [enterpriseName]);

  const handleAddCategory = async () => {
    if (newCategory.name.trim()) {
      try {
        await addCategory(newCategory);
        setNewCategory({
          name: '',
          type: 'expense',
          color: '#3B82F6',
        });
      } catch (error) {
        console.error('Error adding category:', error);
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleSaveEnterpriseName = async () => {
    try {
      await setEnterpriseName(tempEnterpriseName);
    } catch (error) {
      console.error('Error saving enterprise name:', error);
    }
  };

  const handleCurrencyChange = (currency: string) => {
    setPreferredCurrency(currency);
    localStorage.setItem('preferredCurrency', currency);
  };

  const handleExportExcel = async () => {
    if (!isPremium) {
      if (window.confirm('Excel export is a premium feature. Would you like to upgrade to premium?')) {
        setIsLoading(true);
        try {
          await redirectToCheckout('premium_access');
        } catch (error) {
          console.error('Error redirecting to checkout:', error);
          alert('Failed to redirect to checkout. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
      return;
    }
    exportToExcel(enterpriseName);
  };

  const handleExportJSON = async () => {
    if (!isPremium) {
      if (window.confirm('JSON export is a premium feature. Would you like to upgrade to premium?')) {
        setIsLoading(true);
        try {
          await redirectToCheckout('premium_access');
        } catch (error) {
          console.error('Error redirecting to checkout:', error);
          alert('Failed to redirect to checkout. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
      return;
    }
    exportToJSON(enterpriseName);
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header - Now in Background */}
      <div className="relative bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm border-b border-white/10 dark:border-gray-700/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500/80 via-pink-500/80 to-orange-500/80 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400/80 to-emerald-400/80 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-2 h-2 text-white" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-orange-600/90 bg-clip-text text-transparent">
                    {intl.formatMessage({ id: 'nav.settings' })}
                  </h1>
                  <p className="text-sm text-gray-600/80 dark:text-gray-400/80">
                    Configurez tous vos paramètres personnels en un seul endroit
                  </p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-500/80 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-700/80 dark:text-gray-300/80">
                Sécurisé & Synchronisé
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* General Settings */}
          <Card className="hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {intl.formatMessage({ id: 'settings.general' })}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Paramètres de base de l'application
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Currency Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {intl.formatMessage({ id: 'settings.currency' })}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {intl.formatMessage({ id: 'settings.currency.description' })}
                </p>
                <select
                  value={preferredCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                >
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Enterprise Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Building className="w-4 h-4 inline mr-2" />
                  {intl.formatMessage({ id: 'settings.enterpriseName' })}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {intl.formatMessage({ id: 'settings.enterpriseName.description' })}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempEnterpriseName}
                    onChange={(e) => setTempEnterpriseName(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                    placeholder="Nom de votre entreprise"
                  />
                  <Button
                    type="primary"
                    onClick={handleSaveEnterpriseName}
                    disabled={tempEnterpriseName === enterpriseName}
                  >
                    <Save size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Data Management */}
          <Card className="hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {intl.formatMessage({ id: 'settings.dataManagement' })}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Exportez et gérez vos données
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                type="success"
                onClick={handleExportExcel}
                disabled={isLoading}
                className="w-full"
              >
                {isPremium ? (
                  <>
                    <Download size={18} />
                    {intl.formatMessage({ id: 'settings.exportData' })} (Excel)
                  </>
                ) : (
                  <>
                    <Crown size={18} />
                    {isLoading ? 'Processing...' : 'Premium Excel Export'}
                  </>
                )}
              </Button>

              <Button
                type="secondary"
                onClick={handleExportJSON}
                disabled={isLoading}
                className="w-full"
              >
                {isPremium ? (
                  <>
                    <Download size={18} />
                    {intl.formatMessage({ id: 'settings.exportData' })} (JSON)
                  </>
                ) : (
                  <>
                    <Crown size={18} />
                    {isLoading ? 'Processing...' : 'Premium JSON Export'}
                  </>
                )}
              </Button>
            </div>

            {!isPremium && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Crown className="w-5 h-5 text-yellow-600 animate-pulse" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Upgrade to {STRIPE_PRODUCTS.premium_access.name}
                    </h3>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Unlock advanced export features
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Categories Management */}
          <Card className="lg:col-span-2 hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {intl.formatMessage({ id: 'settings.categories' })}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gérez vos catégories de revenus et dépenses
                </p>
              </div>
            </div>

            {/* Add New Category */}
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4">
                {intl.formatMessage({ id: 'settings.addCategory' })}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={intl.formatMessage({ id: 'settings.categoryName' })}
                  className="px-4 py-3 border-2 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                />
                
                <select
                  value={newCategory.type}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                  className="px-4 py-3 border-2 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                >
                  <option value="expense">{intl.formatMessage({ id: 'transaction.expense' })}</option>
                  <option value="income">{intl.formatMessage({ id: 'transaction.income' })}</option>
                </select>
                
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-12 border-2 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
                
                <Button
                  type="primary"
                  onClick={handleAddCategory}
                  disabled={!newCategory.name.trim()}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  <Plus size={18} />
                  Add
                </Button>
              </div>
            </div>

            {/* Categories Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Income Categories */}
              <div>
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  {intl.formatMessage({ id: 'transaction.income' })} Categories ({incomeCategories.length})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {incomeCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {category.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {incomeCategories.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No income categories yet
                    </p>
                  )}
                </div>
              </div>

              {/* Expense Categories */}
              <div>
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  {intl.formatMessage({ id: 'transaction.expense' })} Categories ({expenseCategories.length})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {expenseCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {category.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {expenseCategories.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No expense categories yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationPage;