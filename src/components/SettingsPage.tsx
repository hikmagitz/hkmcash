import React, { useState, useEffect } from 'react';
import { Download, Upload, Plus, Trash2, FileSpreadsheet, AlertTriangle, Crown, Building2, Users, Save, Edit3, Check, X, Euro, DollarSign } from 'lucide-react';
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
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense',
    color: '#6B7280',
  });

  const [newClient, setNewClient] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  
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

  const handleAddClient = () => {
    if (newClient.trim()) {
      addClient({ name: newClient.trim() });
      setNewClient('');
    }
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
    '#EF4444', // red
    '#F97316', // orange
    '#F59E0B', // amber
    '#10B981', // emerald
    '#14B8A6', // teal
    '#3B82F6', // blue
    '#6366F1', // indigo
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#6B7280', // gray
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        {intl.formatMessage({ id: 'nav.settings' })}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Settings
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enterprise Name
            </label>
            
            {!isEditingEnterprise ? (
              // Display Mode
              <div className="space-y-3">
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-800 dark:text-white font-medium">
                        {enterpriseName || 'No company name set'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="secondary"
                    onClick={handleStartEditingEnterprise}
                    className="flex-1"
                  >
                    <Edit3 size={16} />
                    Modify
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
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Client Management
          </h2>
          
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter client name"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddClient()}
                className="flex-grow px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[44px]"
              />
              <Button 
                type="primary" 
                onClick={handleAddClient}
                disabled={!newClient.trim()}
              >
                <Plus size={18} />
                Add
              </Button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {clients.map((client) => (
                <div 
                  key={client.id} 
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <Users className="w-4 h-4 text-gray-500 flex-shrink-0 mr-3" />
                    <span className="text-gray-800 dark:text-gray-200 truncate">
                      {client.name}
                    </span>
                  </div>
                  <Button 
                    type="danger" 
                    className="ml-2 !p-2 flex-shrink-0"
                    onClick={() => deleteClient(client.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              {clients.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No clients added yet</p>
                  <p className="text-sm">Add clients to quickly select them when creating transactions</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            {intl.formatMessage({ id: 'settings.categories' })}
          </h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
              {intl.formatMessage({ id: 'settings.addCategory' })}
            </h3>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder={intl.formatMessage({ id: 'settings.categoryName' })}
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[44px]"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                  className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[44px]"
                >
                  <option value="expense">
                    {intl.formatMessage({ id: 'transaction.expense' })}
                  </option>
                  <option value="income">
                    {intl.formatMessage({ id: 'transaction.income' })}
                  </option>
                </select>
                
                <div className="relative">
                  <button 
                    className="w-[44px] h-[44px] rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none"
                    style={{ backgroundColor: newCategory.color }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  ></button>
                  
                  {showColorPicker && (
                    <div className="absolute right-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-5 gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
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
                  className="w-full sm:w-auto"
                >
                  <Plus size={18} />
                  {intl.formatMessage({ id: 'action.add' })}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                {intl.formatMessage({ id: 'transaction.income' })}
              </h3>
              <div className="space-y-2">
                {categories
                  .filter((category) => category.type === 'income')
                  .map((category) => (
                    <div 
                      key={category.id} 
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div 
                          className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-gray-800 dark:text-gray-200 truncate">
                          {category.name}
                        </span>
                      </div>
                      <Button 
                        type="danger" 
                        className="ml-2 !p-2 flex-shrink-0"
                        onClick={() => deleteCategory(category.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                {intl.formatMessage({ id: 'transaction.expense' })}
              </h3>
              <div className="space-y-2">
                {categories
                  .filter((category) => category.type === 'expense')
                  .map((category) => (
                    <div 
                      key={category.id} 
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div 
                          className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-gray-800 dark:text-gray-200 truncate">
                          {category.name}
                        </span>
                      </div>
                      <Button 
                        type="danger" 
                        className="ml-2 !p-2 flex-shrink-0"
                        onClick={() => deleteCategory(category.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            {intl.formatMessage({ id: 'settings.dataManagement' })}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {intl.formatMessage({ id: 'settings.exportData' })}
          </p>
          
          <div className="space-y-4">
            <Button 
              type="primary" 
              className="w-full"
              onClick={handleExportData}
            >
              {isPremium ? (
                <>
                  <Download size={18} />
                  {intl.formatMessage({ id: 'settings.exportData' })} (JSON)
                </>
              ) : (
                <>
                  <Crown size={18} />
                  {intl.formatMessage({ id: 'premium.upgrade' })}
                </>
              )}
            </Button>

            <Button 
              type="primary" 
              className="w-full"
              onClick={handleExportExcel}
            >
              {isPremium ? (
                <>
                  <FileSpreadsheet size={18} />
                  {intl.formatMessage({ id: 'settings.exportData' })} (Excel)
                </>
              ) : (
                <>
                  <Crown size={18} />
                  {intl.formatMessage({ id: 'premium.upgrade' })}
                </>
              )}
            </Button>
            
            <label className="block">
              <Button 
                type="secondary" 
                className="w-full"
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
                    <Upload size={18} />
                    {intl.formatMessage({ id: 'settings.importData' })}
                  </>
                ) : (
                  <>
                    <Crown size={18} />
                    {intl.formatMessage({ id: 'premium.upgrade' })}
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

            <hr className="border-gray-200 dark:border-gray-700" />

            <Button 
              type="danger" 
              className="w-full"
              onClick={handleClearData}
            >
              <AlertTriangle size={18} />
              {intl.formatMessage({ id: 'settings.clearData' })}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;