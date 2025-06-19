import React, { useState, useEffect } from 'react';
import { Download, Upload, Plus, Trash2, FileSpreadsheet, AlertTriangle, Crown, Building2, Users, Save, Edit3, Check, X, Euro, Settings, Palette, Database, ChevronRight, Info, ChevronDown, ChevronUp, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { useTransactions } from '../context/TransactionContext';
import { generateId, getDefaultCategories, SUPPORTED_CURRENCIES } from '../utils/helpers';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { useStripe } from '../hooks/useStripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    categories, 
    addCategory, 
    deleteCategory, 
    transactions, 
    clients, 
    addClient, 
    deleteClient,
    enterpriseName,
    setEnterpriseName 
  } = useTransactions();
  const { isPremium, user } = useAuth();
  const { redirectToCheckout } = useStripe();
  const intl = useIntl();
  
  const [newClient, setNewClient] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [isClientListOpen, setIsClientListOpen] = useState(false);

  // Category editing state
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryData, setEditCategoryData] = useState({
    name: '',
    color: '#6B7280'
  });

  // New category state
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense',
    color: '#6B7280',
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEditColorPicker, setShowEditColorPicker] = useState(false);

  // Enterprise name state management
  const [isEditingEnterprise, setIsEditingEnterprise] = useState(false);
  const [tempEnterpriseName, setTempEnterpriseName] = useState('');
  const [isSavingEnterprise, setIsSavingEnterprise] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Currency state management
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);
  const [tempCurrency, setTempCurrency] = useState('EUR');
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);
  const [currencySaveSuccess, setCurrencySaveSuccess] = useState(false);

  // Initialize temp name when component mounts or enterprise name changes
  useEffect(() => {
    setTempEnterpriseName(enterpriseName);
  }, [enterpriseName]);

  // Load saved currency preference
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency') || 'EUR';
    setSelectedCurrency(savedCurrency);
    setTempCurrency(savedCurrency);
  }, []);

  const getCurrentCurrencyInfo = () => {
    return SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency) || SUPPORTED_CURRENCIES[0];
  };

  const handleAddClient = () => {
    if (newClient.trim()) {
      addClient({ name: newClient.trim() });
      setNewClient('');
    }
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      addCategory({
        name: newCategory.name.trim(),
        type: newCategory.type as 'income' | 'expense',
        color: newCategory.color,
      });
      
      setNewCategory({
        name: '',
        type: 'expense',
        color: '#6B7280',
      });
    }
  };

  const handleStartEditCategory = (category: any) => {
    setEditingCategory(category.id);
    setEditCategoryData({
      name: category.name,
      color: category.color
    });
  };

  const handleSaveCategory = async (categoryId: string, type: 'income' | 'expense') => {
    if (!editCategoryData.name.trim()) return;

    try {
      // Delete the old category
      await deleteCategory(categoryId);
      
      // Add the updated category
      await addCategory({
        name: editCategoryData.name.trim(),
        type: type,
        color: editCategoryData.color,
      });
      
      setEditingCategory(null);
      setEditCategoryData({ name: '', color: '#6B7280' });
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category. Please try again.');
    }
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryData({ name: '', color: '#6B7280' });
  };

  // Enterprise name functions
  const handleStartEditingEnterprise = () => {
    setIsEditingEnterprise(true);
    setTempEnterpriseName(enterpriseName);
    setSaveSuccess(false);
  };

  const handleCancelEditingEnterprise = () => {
    setIsEditingEnterprise(false);
    setTempEnterpriseName(enterpriseName);
    setSaveSuccess(false);
  };

  const handleSaveEnterpriseName = async () => {
    setIsSavingEnterprise(true);
    setSaveSuccess(false);
    
    try {
      await setEnterpriseName(tempEnterpriseName.trim());
      setIsEditingEnterprise(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving enterprise name:', error);
      alert('Failed to save company name. Please try again.');
    } finally {
      setIsSavingEnterprise(false);
    }
  };

  // Currency functions
  const handleStartEditingCurrency = () => {
    setIsEditingCurrency(true);
    setTempCurrency(selectedCurrency);
    setCurrencySaveSuccess(false);
  };

  const handleCancelEditingCurrency = () => {
    setIsEditingCurrency(false);
    setTempCurrency(selectedCurrency);
    setCurrencySaveSuccess(false);
  };

  const handleSaveCurrency = async () => {
    setIsSavingCurrency(true);
    setCurrencySaveSuccess(false);
    
    try {
      setSelectedCurrency(tempCurrency);
      localStorage.setItem('preferredCurrency', tempCurrency);
      setIsEditingCurrency(false);
      setCurrencySaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setCurrencySaveSuccess(false);
        // Force a page refresh to update all currency displays
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error saving currency:', error);
      alert('Failed to save currency. Please try again.');
    } finally {
      setIsSavingCurrency(false);
    }
  };

  const handleExportData = async () => {
    if (!isPremium) {
      if (window.confirm(intl.formatMessage({ id: 'premium.upgradePrompt' }))) {
        await redirectToCheckout('premium_access');
      }
      return;
    }

    try {
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id);

      if (transactionsError) throw transactionsError;

      const data = {
        transactions,
        categories,
        enterpriseName,
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${enterpriseName || 'HikmaCash'}_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert(intl.formatMessage({ id: 'common.error' }));
    }
  };

  const handleImportData = async (file: File) => {
    if (!isPremium) {
      if (window.confirm(intl.formatMessage({ id: 'premium.upgradePrompt' }))) {
        await redirectToCheckout('premium_access');
      }
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          
          if (data.transactions && Array.isArray(data.transactions)) {
            // Delete existing transactions
            const { error: deleteError } = await supabase
              .from('transactions')
              .delete()
              .eq('user_id', user?.id);

            if (deleteError) throw deleteError;

            // Insert new transactions
            const { error: insertError } = await supabase
              .from('transactions')
              .insert(
                data.transactions.map((t: any) => ({
                  ...t,
                  user_id: user?.id
                }))
              );

            if (insertError) throw insertError;
          }

          if (data.categories && Array.isArray(data.categories)) {
            // Delete existing categories
            const { error: deleteCatError } = await supabase
              .from('categories')
              .delete()
              .eq('user_id', user?.id);

            if (deleteCatError) throw deleteCatError;

            // Insert new categories
            const { error: insertCatError } = await supabase
              .from('categories')
              .insert(
                data.categories.map((c: any) => ({
                  ...c,
                  user_id: user?.id
                }))
              );

            if (insertCatError) throw insertCatError;
          }

          if (data.enterpriseName) {
            await setEnterpriseName(data.enterpriseName);
          }

          window.location.reload();
        } catch (error) {
          console.error('Error importing data:', error);
          alert(intl.formatMessage({ id: 'common.error' }));
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error reading file:', error);
      alert(intl.formatMessage({ id: 'common.error' }));
    }
  };

  const handleExportExcel = () => {
    if (!isPremium) {
      if (window.confirm(intl.formatMessage({ id: 'premium.upgradePrompt' }))) {
        redirectToCheckout('premium_access');
      }
      return;
    }

    const transactionData = transactions.map(t => ({
      Date: new Date(t.date).toLocaleDateString(intl.locale),
      Type: intl.formatMessage({ id: `transaction.${t.type}` }),
      Category: t.category,
      Client: t.client || 'N/A',
      Description: t.description,
      Amount: t.amount,
    }));

    const wb = XLSX.utils.book_new();
    
    // Add enterprise information
    if (enterpriseName) {
      const infoSheet = XLSX.utils.aoa_to_sheet([
        ['Enterprise Name', enterpriseName],
        ['Export Date', new Date().toLocaleDateString()],
        [],
      ]);
      XLSX.utils.book_append_sheet(wb, infoSheet, 'Info');
    }

    const ws = XLSX.utils.json_to_sheet(transactionData);

    const colWidths = [
      { wch: 12 }, // Date
      { wch: 10 }, // Type
      { wch: 15 }, // Category
      { wch: 20 }, // Client
      { wch: 30 }, // Description
      { wch: 12 }, // Amount
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, `${enterpriseName || 'HikmaCash'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleClearData = async () => {
    if (window.confirm(intl.formatMessage({ id: 'settings.clearDataConfirm' }))) {
      try {
        if (user) {
          // Delete transactions
          const { error: transError } = await supabase
            .from('transactions')
            .delete()
            .eq('user_id', user.id);

          if (transError) throw transError;

          // Delete categories
          const { error: catError } = await supabase
            .from('categories')
            .delete()
            .eq('user_id', user.id);

          if (catError) throw catError;

          // Delete clients
          const { error: clientError } = await supabase
            .from('clients')
            .delete()
            .eq('user_id', user.id);

          if (clientError) throw clientError;

          // Reset enterprise name
          await setEnterpriseName('');
        }
        
        window.location.reload();
      } catch (error) {
        console.error('Error clearing data:', error);
        alert(intl.formatMessage({ id: 'common.error' }));
      }
    }
  };

  const colorOptions = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', 
    '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
    '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#6B7280'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-sky-500 to-purple-500 rounded-2xl mb-4 shadow-xl">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {intl.formatMessage({ id: 'nav.settings' })}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Gérez vos préférences, configurez vos données et personnalisez votre expérience HKM Cash
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Entreprise</p>
              <p className="text-xs text-blue-500 dark:text-blue-300 truncate">
                {enterpriseName || 'Non défini'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Catégories</p>
              <p className="text-xs text-purple-500 dark:text-purple-300">{categories.length} total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Clients</p>
              <p className="text-xs text-orange-500 dark:text-orange-300">{clients.length} total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Euro className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Devise</p>
              <p className="text-xs text-green-500 dark:text-green-300">{getCurrentCurrencyInfo().code}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Company Settings Card */}
        <Card className="hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Settings
          </h2>
          
          {/* Enterprise Name Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enterprise Name
            </label>
            
            {!isEditingEnterprise ? (
              // Display Mode
              <div className="space-y-3">
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-800 dark:text-white font-medium">
                      {enterpriseName || 'No company name set'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <Button
                    type="secondary"
                    onClick={handleStartEditingEnterprise}
                    className="w-full"
                  >
                    <Edit3 size={16} />
                    Modifier
                  </Button>
                </div>
                
                {saveSuccess && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                      <Check size={16} />
                      Company name saved successfully!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={tempEnterpriseName}
                    onChange={(e) => setTempEnterpriseName(e.target.value)}
                    placeholder="Enter enterprise name"
                    className="w-full px-4 py-3 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                    disabled={isSavingEnterprise}
                    autoFocus
                  />
                  {isSavingEnterprise && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    onClick={handleSaveEnterpriseName}
                    disabled={isSavingEnterprise || !tempEnterpriseName.trim()}
                    className="flex-1"
                  >
                    <Save size={16} />
                    {isSavingEnterprise ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    type="secondary"
                    onClick={handleCancelEditingEnterprise}
                    disabled={isSavingEnterprise}
                    className="flex-1"
                  >
                    <X size={16} />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                💡 This name will appear on your PDF receipts and Excel exports
              </p>
            </div>
          </div>

          {/* Currency Settings Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Currency
            </label>
            
            {!isEditingCurrency ? (
              // Display Mode
              <div className="space-y-3">
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center gap-3">
                    <Euro className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-800 dark:text-white font-medium">
                      {getCurrentCurrencyInfo().name} ({getCurrentCurrencyInfo().symbol})
                    </span>
                  </div>
                </div>
                
                <div>
                  <Button
                    type="secondary"
                    onClick={handleStartEditingCurrency}
                    className="w-full"
                  >
                    <Edit3 size={16} />
                    Modifier
                  </Button>
                </div>
                
                {currencySaveSuccess && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                      <Check size={16} />
                      Currency saved successfully!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-3">
                <div className="relative">
                  <select
                    value={tempCurrency}
                    onChange={(e) => setTempCurrency(e.target.value)}
                    className="w-full px-4 py-3 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                    disabled={isSavingCurrency}
                    autoFocus
                  >
                    {SUPPORTED_CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.name} ({currency.symbol})
                      </option>
                    ))}
                  </select>
                  {isSavingCurrency && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    onClick={handleSaveCurrency}
                    disabled={isSavingCurrency}
                    className="flex-1"
                  >
                    <Save size={16} />
                    {isSavingCurrency ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    type="secondary"
                    onClick={handleCancelEditingCurrency}
                    disabled={isSavingCurrency}
                    className="flex-1"
                  >
                    <X size={16} />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                💡 This currency will be used throughout the application
              </p>
            </div>
          </div>
        </Card>

        {/* Categories Management Card */}
        <Card className="hover:shadow-xl transition-all duration-300 lg:col-span-2 xl:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Catégories</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{categories.length} configurées</p>
            </div>
          </div>
          
          {/* Add Category Form */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nom de la catégorie"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white transition-all"
              />
              
              <div className="flex gap-2">
                <select
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                  className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white transition-all"
                >
                  <option value="expense">💸 Dépense</option>
                  <option value="income">💰 Revenu</option>
                </select>
                
                <div className="relative">
                  <button 
                    className="w-10 h-10 rounded-lg border border-purple-300 dark:border-purple-500 focus:outline-none hover:scale-110 transition-all shadow-md"
                    style={{ backgroundColor: newCategory.color }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  ></button>
                  
                  {showColorPicker && (
                    <div className="absolute right-0 mt-2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-20 border border-gray-200 dark:border-gray-700 w-64">
                      <div className="grid grid-cols-5 gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 hover:scale-110 transition-all shadow-sm"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              setNewCategory({ ...newCategory, color });
                              setShowColorPicker(false);
                            }}
                          ></button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <Button 
                  type="primary" 
                  onClick={handleAddCategory}
                  disabled={!newCategory.name.trim()}
                  className="!px-3"
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Categories List */}
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {/* Income Categories */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                  Revenus ({categories.filter(c => c.type === 'income').length})
                </h4>
              </div>
              <div className="space-y-2">
                {categories
                  .filter((category) => category.type === 'income')
                  .map((category) => (
                    <div 
                      key={category.id} 
                      className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all group"
                    >
                      {editingCategory === category.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <div className="relative">
                            <button 
                              className="w-6 h-6 rounded-lg border border-gray-300 dark:border-gray-600"
                              style={{ backgroundColor: editCategoryData.color }}
                              onClick={() => setShowEditColorPicker(!showEditColorPicker)}
                            ></button>
                            {showEditColorPicker && (
                              <div className="absolute left-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-5 gap-1">
                                  {colorOptions.map((color) => (
                                    <button
                                      key={color}
                                      className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                                      style={{ backgroundColor: color }}
                                      onClick={() => {
                                        setEditCategoryData({ ...editCategoryData, color });
                                        setShowEditColorPicker(false);
                                      }}
                                    ></button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <input
                            type="text"
                            value={editCategoryData.name}
                            onChange={(e) => setEditCategoryData({ ...editCategoryData, name: e.target.value })}
                            className="flex-1 px-2 py-1 text-sm border border-green-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <Button 
                              type="primary" 
                              className="!p-1"
                              onClick={() => handleSaveCategory(category.id, 'income')}
                            >
                              <Check size={12} />
                            </Button>
                            <Button 
                              type="secondary" 
                              className="!p-1"
                              onClick={handleCancelEditCategory}
                            >
                              <X size={12} />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full shadow-md"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {category.name}
                            </span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              type="secondary" 
                              className="!p-1.5"
                              onClick={() => handleStartEditCategory(category)}
                            >
                              <Edit3 size={12} />
                            </Button>
                            <Button 
                              type="danger" 
                              className="!p-1.5"
                              onClick={() => deleteCategory(category.id)}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                {categories.filter(c => c.type === 'income').length === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Aucune catégorie de revenu</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Expense Categories */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                  Dépenses ({categories.filter(c => c.type === 'expense').length})
                </h4>
              </div>
              <div className="space-y-2">
                {categories
                  .filter((category) => category.type === 'expense')
                  .map((category) => (
                    <div 
                      key={category.id} 
                      className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all group"
                    >
                      {editingCategory === category.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <div className="relative">
                            <button 
                              className="w-6 h-6 rounded-lg border border-gray-300 dark:border-gray-600"
                              style={{ backgroundColor: editCategoryData.color }}
                              onClick={() => setShowEditColorPicker(!showEditColorPicker)}
                            ></button>
                            {showEditColorPicker && (
                              <div className="absolute left-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-5 gap-1">
                                  {colorOptions.map((color) => (
                                    <button
                                      key={color}
                                      className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                                      style={{ backgroundColor: color }}
                                      onClick={() => {
                                        setEditCategoryData({ ...editCategoryData, color });
                                        setShowEditColorPicker(false);
                                      }}
                                    ></button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <input
                            type="text"
                            value={editCategoryData.name}
                            onChange={(e) => setEditCategoryData({ ...editCategoryData, name: e.target.value })}
                            className="flex-1 px-2 py-1 text-sm border border-red-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <Button 
                              type="primary" 
                              className="!p-1"
                              onClick={() => handleSaveCategory(category.id, 'expense')}
                            >
                              <Check size={12} />
                            </Button>
                            <Button 
                              type="secondary" 
                              className="!p-1"
                              onClick={handleCancelEditCategory}
                            >
                              <X size={12} />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full shadow-md"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {category.name}
                            </span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              type="secondary" 
                              className="!p-1.5"
                              onClick={() => handleStartEditCategory(category)}
                            >
                              <Edit3 size={12} />
                            </Button>
                            <Button 
                              type="danger" 
                              className="!p-1.5"
                              onClick={() => deleteCategory(category.id)}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                {categories.filter(c => c.type === 'expense').length === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Aucune catégorie de dépense</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Client Management Card */}
        <Card className="hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Clients</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{clients.length} enregistrés</p>
              </div>
            </div>
            
            <Button
              type="secondary"
              onClick={() => setIsClientListOpen(!isClientListOpen)}
              className="!p-2 hover:bg-orange-100 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-800"
            >
              {isClientListOpen ? (
                <ChevronUp size={16} className="text-orange-600" />
              ) : (
                <ChevronDown size={16} className="text-orange-600" />
              )}
            </Button>
          </div>
          
          {!isClientListOpen && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                      {clients.length} clients configurés
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-300">
                      Cliquez pour gérer
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-orange-500" />
              </div>
            </div>
          )}
          
          {isClientListOpen && (
            <>
              <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nom du client"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddClient()}
                    className="flex-1 px-3 py-2 text-sm border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white transition-all"
                  />
                  <Button 
                    type="primary" 
                    onClick={handleAddClient}
                    disabled={!newClient.trim()}
                    className="!px-3 !py-2"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {clients.map((client) => (
                  <div 
                    key={client.id} 
                    className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-orange-500 rounded-lg">
                        <Users className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {client.name}
                      </span>
                    </div>
                    <Button 
                      type="danger" 
                      className="!p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteClient(client.id)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                ))}
                {clients.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-orange-400" />
                    </div>
                    <p className="text-sm font-medium mb-1">Aucun client</p>
                    <p className="text-xs">Ajoutez des clients pour les sélectionner rapidement</p>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
        
        {/* Data Management Card */}
        <Card className="hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Gestion des Données</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Export, Import & Sauvegarde</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button 
              type="primary" 
              className="w-full justify-center"
              onClick={handleExportData}
            >
              {isPremium ? (
                <>
                  <Download size={16} />
                  JSON
                </>
              ) : (
                <>
                  <Crown size={16} />
                  Premium
                </>
              )}
            </Button>

            <Button 
              type="primary" 
              className="w-full justify-center"
              onClick={handleExportExcel}
            >
              {isPremium ? (
                <>
                  <FileSpreadsheet size={16} />
                  Excel
                </>
              ) : (
                <>
                  <Crown size={16} />
                  Premium
                </>
              )}
            </Button>
            
            <label className="block">
              <Button 
                type="secondary" 
                className="w-full justify-center"
                onClick={() => {
                  if (!isPremium) {
                    if (window.confirm(intl.formatMessage({ id: 'premium.upgradePrompt' }))) {
                      redirectToCheckout('premium_access');
                    }
                    return;
                  }
                  document.getElementById('file-input')?.click();
                }}
              >
                {isPremium ? (
                  <>
                    <Upload size={16} />
                    Import
                  </>
                ) : (
                  <>
                    <Crown size={16} />
                    Premium
                  </>
                )}
              </Button>
              <input 
                id="file-input"
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImportData(file);
                  }
                }}
              />
            </label>

            <Button 
              type="danger" 
              className="w-full justify-center"
              onClick={handleClearData}
            >
              <AlertTriangle size={16} />
              Supprimer
            </Button>
          </div>
          
          {!isPremium && (
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Crown size={18} className="text-yellow-600" />
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                  Fonctionnalités Premium
                </p>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                Débloquez l'export/import de données avec Premium
              </p>
              <Button
                type="primary"
                onClick={() => redirectToCheckout('premium_access')}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                <Crown size={16} />
                Passer à Premium
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Info */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tous les changements sont automatiquement sauvegardés dans le cloud
          </span>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;