import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Palette, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  Edit, 
  Save, 
  X, 
  Building, 
  FileText, 
  Crown,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useIntl } from 'react-intl';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { useStripe } from '../hooks/useStripe';
import { exportToExcel, exportToJSON } from '../utils/exportUtils';
import { SUPPORTED_CURRENCIES } from '../utils/helpers';
import { STRIPE_PRODUCTS } from '../stripe-config';

const PersonalizationPage: React.FC = () => {
  const intl = useIntl();
  const { 
    categories, 
    addCategory, 
    deleteCategory, 
    transactions, 
    clients,
    enterpriseName,
    setEnterpriseName
  } = useTransactions();
  const { isPremium, isOfflineMode } = useAuth();
  const { redirectToCheckout } = useStripe();

  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#3B82F6'
  });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState('EUR');
  const [tempEnterpriseName, setTempEnterpriseName] = useState('');
  const [isEditingEnterprise, setIsEditingEnterprise] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('preferredCurrency');
    if (saved) {
      setPreferredCurrency(saved);
    }
  }, []);

  useEffect(() => {
    setTempEnterpriseName(enterpriseName);
  }, [enterpriseName]);

  const handleCurrencyChange = (currency: string) => {
    setPreferredCurrency(currency);
    localStorage.setItem('preferredCurrency', currency);
  };

  const handleAddCategory = async () => {
    if (newCategory.name.trim()) {
      try {
        await addCategory(newCategory);
        setNewCategory({ name: '', type: 'expense', color: '#3B82F6' });
        setIsAddingCategory(false);
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

  const handleExportExcel = async () => {
    if (!isPremium && !isOfflineMode) {
      if (window.confirm('Excel export is a premium feature. Would you like to upgrade?')) {
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
    exportToExcel(transactions, enterpriseName);
  };

  const handleExportJSON = async () => {
    if (!isPremium && !isOfflineMode) {
      if (window.confirm('JSON export is a premium feature. Would you like to upgrade?')) {
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
    exportToJSON({ transactions, categories, clients }, enterpriseName);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.transactions) {
          localStorage.setItem('transactions', JSON.stringify(data.transactions));
        }
        if (data.categories) {
          localStorage.setItem('categories', JSON.stringify(data.categories));
        }
        if (data.clients) {
          localStorage.setItem('clients', JSON.stringify(data.clients));
        }
        
        alert('Data imported successfully! Please refresh the page to see the changes.');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone!')) {
      localStorage.removeItem('transactions');
      localStorage.removeItem('categories');
      localStorage.removeItem('clients');
      localStorage.removeItem('enterpriseName');
      alert('All data has been cleared! Please refresh the page.');
    }
  };

  const handleSaveEnterpriseName = async () => {
    try {
      await setEnterpriseName(tempEnterpriseName);
      setIsEditingEnterprise(false);
    } catch (error) {
      console.error('Error saving enterprise name:', error);
      alert('Failed to save enterprise name. Please try again.');
    }
  };

  const predefinedColors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {intl.formatMessage({ id: 'nav.settings' })}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Customize your experience and manage your data
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {transactions.length}
                </p>
                <p className="text-xs text-blue-500 dark:text-blue-300 truncate">
                  Reçus PDF générés
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {categories.length}
                </p>
                <p className="text-xs text-green-500 dark:text-green-300">
                  Categories
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {clients.length}
                </p>
                <p className="text-xs text-purple-500 dark:text-purple-300">
                  Clients
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {preferredCurrency}
                </p>
                <p className="text-xs text-orange-500 dark:text-orange-300">
                  Currency
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enterprise Settings */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Nom d'entreprise
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Utilisé sur les reçus PDF et exports Excel
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {isEditingEnterprise ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={tempEnterpriseName}
                    onChange={(e) => setTempEnterpriseName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                    placeholder="Entrez le nom de votre entreprise"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="success"
                      onClick={handleSaveEnterpriseName}
                      className="flex-1"
                    >
                      <Save size={18} />
                      Sauvegarder
                    </Button>
                    <Button
                      type="secondary"
                      onClick={() => {
                        setIsEditingEnterprise(false);
                        setTempEnterpriseName(enterpriseName);
                      }}
                      className="flex-1"
                    >
                      <X size={18} />
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                      {enterpriseName || 'Nom d\'entreprise non défini'}
                    </p>
                  </div>
                  <Button
                    type="primary"
                    onClick={() => setIsEditingEnterprise(true)}
                    className="w-full"
                  >
                    <Edit size={18} />
                    Modifier le nom
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Currency Settings */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {intl.formatMessage({ id: 'settings.currency' })}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {intl.formatMessage({ id: 'settings.currency.description' })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {SUPPORTED_CURRENCIES.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  className={`p-3 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                    preferredCurrency === currency.code
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {currency.symbol} {currency.code}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {currency.name}
                      </p>
                    </div>
                    {preferredCurrency === currency.code && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Categories Management */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {intl.formatMessage({ id: 'settings.categories' })}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your transaction categories
                  </p>
                </div>
              </div>
              <Button
                type="primary"
                onClick={() => setIsAddingCategory(true)}
                size="sm"
              >
                <Plus size={16} />
                Add
              </Button>
            </div>

            {/* Add Category Form */}
            {isAddingCategory && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Category name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newCategory.type}
                      onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'income' | 'expense' })}
                      className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                    
                    <input
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-8 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewCategory({ ...newCategory, color })}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          newCategory.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="success" onClick={handleAddCategory} className="flex-1">
                      <Save size={16} />
                      Save
                    </Button>
                    <Button 
                      type="secondary" 
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategory({ name: '', type: 'expense', color: '#3B82F6' });
                      }}
                      className="flex-1"
                    >
                      <X size={16} />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Categories List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium text-gray-800 dark:text-white">
                      {category.name}
                    </span>
                    <Badge type={category.type === 'income' ? 'income' : 'expense'}>
                      {category.type}
                    </Badge>
                  </div>
                  <Button
                    type="danger"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Data Management */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {intl.formatMessage({ id: 'settings.dataManagement' })}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Export, import, and manage your data
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                type="primary" 
                onClick={handleExportExcel}
                className="w-full"
                disabled={isLoading}
              >
                <Download size={18} />
                {isPremium || isOfflineMode ? 'Export to Excel' : 'Export to Excel (Premium)'}
                {!isPremium && !isOfflineMode && <Crown size={16} className="ml-2" />}
              </Button>
              
              <Button 
                type="primary" 
                onClick={handleExportJSON}
                className="w-full"
                disabled={isLoading}
              >
                <Download size={18} />
                {isPremium || isOfflineMode ? 'Export to JSON' : 'Export to JSON (Premium)'}
                {!isPremium && !isOfflineMode && <Crown size={16} className="ml-2" />}
              </Button>
              
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  id="import-file"
                />
                <Button 
                  type="secondary" 
                  onClick={() => document.getElementById('import-file')?.click()}
                  className="w-full"
                >
                  <Upload size={18} />
                  Import Data
                </Button>
              </div>
              
              <Button 
                type="danger" 
                onClick={clearAllData}
                className="w-full"
              >
                <Trash2 size={18} />
                Clear All Data
              </Button>
            </div>
          </Card>
        </div>

        {/* Premium Features Notice */}
        {!isPremium && !isOfflineMode && (
          <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                  Upgrade to {STRIPE_PRODUCTS.premium_access.name}
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Get unlimited transactions, PDF receipts, Excel exports, and more premium features.
                </p>
              </div>
              <Button
                type="primary"
                onClick={() => redirectToCheckout('premium_access')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                disabled={isLoading}
              >
                <Crown size={18} />
                Upgrade Now
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PersonalizationPage;