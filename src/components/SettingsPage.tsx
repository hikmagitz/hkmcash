import React, { useState, useEffect } from 'react';
import { Download, Upload, Plus, Trash2, FileSpreadsheet, AlertTriangle, Crown, Building2, Users, Save, Edit3, Check, X, Euro, Settings, Palette, Database, ChevronRight, Info } from 'lucide-react';
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
    '#EF4444', '#F97316', '#F59E0B', '#10B981', '#14B8A6', 
    '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#6B7280',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Compact Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-sky-500 to-purple-500 rounded-xl mb-3 shadow-lg">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent mb-1">
          {intl.formatMessage({ id: 'nav.settings' })}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Personnalisez votre expérience et gérez vos données
        </p>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Entreprise</p>
              <p className="text-xs text-blue-500 dark:text-blue-300 truncate max-w-20">
                {enterpriseName || 'Non défini'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Catégories</p>
              <p className="text-xs text-purple-500 dark:text-purple-300">{categories.length} total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            <div>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Clients</p>
              <p className="text-xs text-orange-500 dark:text-orange-300">{clients.length} total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <Euro className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">Devise</p>
              <p className="text-xs text-green-500 dark:text-green-300">{getCurrentCurrencyInfo().code}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column - Company & Currency */}
        <div className="space-y-6">
          {/* Company Settings */}
          <Card className="group hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Entreprise</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Nom sur les reçus</p>
              </div>
            </div>
            
            {!isEditingEnterprise ? (
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {enterpriseName || 'Aucun nom défini'}
                  </p>
                </div>
                <Button
                  type="primary"
                  onClick={handleStartEditingEnterprise}
                  className="w-full !py-2"
                >
                  <Edit3 size={14} />
                  Modifier
                </Button>
                {saveSuccess && (
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-2">
                      <Check size={12} />
                      Sauvegardé !
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={tempEnterpriseName}
                  onChange={(e) => setTempEnterpriseName(e.target.value)}
                  placeholder="Nom de l'entreprise"
                  className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  disabled={isSavingEnterprise}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    onClick={handleSaveEnterpriseName}
                    disabled={isSavingEnterprise || !tempEnterpriseName.trim()}
                    className="flex-1 !py-2"
                  >
                    <Save size={14} />
                    {isSavingEnterprise ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                  <Button
                    type="secondary"
                    onClick={handleCancelEditingEnterprise}
                    disabled={isSavingEnterprise}
                    className="flex-1 !py-2"
                  >
                    <X size={14} />
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Currency Settings */}
          <Card className="group hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md">
                <Euro className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Devise</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Affichage des montants</p>
              </div>
            </div>
            
            {!isEditingCurrency ? (
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {getCurrentCurrencyInfo().name} ({getCurrentCurrencyInfo().symbol})
                  </p>
                </div>
                <Button
                  type="primary"
                  onClick={handleStartEditingCurrency}
                  className="w-full !py-2"
                >
                  <Edit3 size={14} />
                  Modifier
                </Button>
                {currencySaveSuccess && (
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-2">
                      <Check size={12} />
                      Devise sauvegardée !
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={tempCurrency}
                  onChange={(e) => setTempCurrency(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  disabled={isSavingCurrency}
                  autoFocus
                >
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name} ({currency.symbol})
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    onClick={handleSaveCurrency}
                    disabled={isSavingCurrency}
                    className="flex-1 !py-2"
                  >
                    <Save size={14} />
                    {isSavingCurrency ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                  <Button
                    type="secondary"
                    onClick={handleCancelEditingCurrency}
                    disabled={isSavingCurrency}
                    className="flex-1 !py-2"
                  >
                    <X size={14} />
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Data Management */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-md">
                <Database className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Données</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Export/Import</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button 
                type="primary" 
                className="w-full justify-center !py-2 text-xs"
                onClick={handleExportData}
              >
                {isPremium ? (
                  <>
                    <Download size={14} />
                    JSON
                  </>
                ) : (
                  <>
                    <Crown size={14} />
                    Premium
                  </>
                )}
              </Button>

              <Button 
                type="primary" 
                className="w-full justify-center !py-2 text-xs"
                onClick={handleExportExcel}
              >
                {isPremium ? (
                  <>
                    <FileSpreadsheet size={14} />
                    Excel
                  </>
                ) : (
                  <>
                    <Crown size={14} />
                    Premium
                  </>
                )}
              </Button>
              
              <label className="block">
                <Button 
                  type="secondary" 
                  className="w-full justify-center !py-2 text-xs"
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
                      <Upload size={14} />
                      Import
                    </>
                  ) : (
                    <>
                      <Crown size={14} />
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
                className="w-full justify-center !py-2 text-xs"
                onClick={handleClearData}
              >
                <AlertTriangle size={14} />
                Supprimer
              </Button>
            </div>
            
            {!isPremium && (
              <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={16} className="text-yellow-600" />
                  <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">
                    Premium requis
                  </p>
                </div>
                <Button
                  type="primary"
                  onClick={() => redirectToCheckout('premium_access')}
                  className="w-full !py-2 text-xs bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  <Crown size={14} />
                  Passer à Premium
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Middle Column - Categories */}
        <Card className="hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Catégories</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{categories.length} configurées</p>
            </div>
          </div>
          
          {/* Add Category Form */}
          <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nom de la catégorie"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white transition-all text-sm"
              />
              
              <div className="flex gap-2">
                <select
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                  className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white transition-all text-sm"
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
                    <div className="absolute right-0 mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-200 dark:border-gray-700 w-48">
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
                  className="!px-3 !py-2"
                >
                  <Plus size={14} />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Categories List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Income Categories */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                  Revenus ({categories.filter(c => c.type === 'income').length})
                </h4>
              </div>
              <div className="space-y-1">
                {categories
                  .filter((category) => category.type === 'income')
                  .map((category) => (
                    <div 
                      key={category.id} 
                      className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {category.name}
                        </span>
                      </div>
                      <Button 
                        type="danger" 
                        className="!p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteCategory(category.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))}
                {categories.filter(c => c.type === 'income').length === 0 && (
                  <div className="text-center py-3 text-gray-500 dark:text-gray-400">
                    <p className="text-xs">Aucune catégorie de revenu</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Expense Categories */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                  Dépenses ({categories.filter(c => c.type === 'expense').length})
                </h4>
              </div>
              <div className="space-y-1">
                {categories
                  .filter((category) => category.type === 'expense')
                  .map((category) => (
                    <div 
                      key={category.id} 
                      className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {category.name}
                        </span>
                      </div>
                      <Button 
                        type="danger" 
                        className="!p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteCategory(category.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))}
                {categories.filter(c => c.type === 'expense').length === 0 && (
                  <div className="text-center py-3 text-gray-500 dark:text-gray-400">
                    <p className="text-xs">Aucune catégorie de dépense</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column - Clients */}
        <Card className="hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-md">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Clients</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{clients.length} enregistrés</p>
            </div>
          </div>
          
          {/* Add Client Form */}
          <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nom du client"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddClient()}
                className="flex-1 px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white transition-all text-sm"
              />
              <Button 
                type="primary" 
                onClick={handleAddClient}
                disabled={!newClient.trim()}
                className="!px-3 !py-2"
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>
          
          {/* Clients List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {clients.map((client) => (
              <div 
                key={client.id} 
                className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-orange-500 rounded-lg">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {client.name}
                  </span>
                </div>
                <Button 
                  type="danger" 
                  className="!p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;