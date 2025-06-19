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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-sky-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {intl.formatMessage({ id: 'nav.settings' })}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Personnalisez votre expérience et gérez vos données d'entreprise
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Entreprise</p>
              <p className="text-xs text-blue-500 dark:text-blue-300 truncate max-w-24">
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
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Catégories</p>
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
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Clients</p>
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
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Devise</p>
              <p className="text-xs text-green-500 dark:text-green-300">{getCurrentCurrencyInfo().code}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        
        {/* Company & Currency Settings */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Configuration Générale
            </h2>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Settings */}
            <Card className="group hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Nom de l'Entreprise
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Apparaîtra sur vos reçus PDF et exports
                    </p>
                  </div>
                </div>
                {!isEditingEnterprise && (
                  <Button
                    type="secondary"
                    onClick={handleStartEditingEnterprise}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit3 size={16} />
                  </Button>
                )}
              </div>
              
              {!isEditingEnterprise ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                          Nom actuel
                        </p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {enterpriseName || 'Aucun nom défini'}
                        </p>
                      </div>
                      <Button
                        type="primary"
                        onClick={handleStartEditingEnterprise}
                        className="!px-4 !py-2"
                      >
                        <Edit3 size={16} />
                        Modifier
                      </Button>
                    </div>
                  </div>
                  
                  {saveSuccess && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-green-500 rounded-full">
                          <Check size={14} className="text-white" />
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                          Nom d'entreprise sauvegardé avec succès !
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={tempEnterpriseName}
                      onChange={(e) => setTempEnterpriseName(e.target.value)}
                      placeholder="Entrez le nom de l'entreprise"
                      className="w-full px-4 py-4 border-2 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all text-lg"
                      disabled={isSavingEnterprise}
                      autoFocus
                    />
                    {isSavingEnterprise && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      type="primary"
                      onClick={handleSaveEnterpriseName}
                      disabled={isSavingEnterprise || !tempEnterpriseName.trim()}
                      className="flex-1"
                    >
                      <Save size={18} />
                      {isSavingEnterprise ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                    <Button
                      type="secondary"
                      onClick={handleCancelEditingEnterprise}
                      disabled={isSavingEnterprise}
                      className="flex-1"
                    >
                      <X size={18} />
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Currency Settings */}
            <Card className="group hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                    <Euro className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Devise Préférée
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Utilisée dans toute l'application
                    </p>
                  </div>
                </div>
                {!isEditingCurrency && (
                  <Button
                    type="secondary"
                    onClick={handleStartEditingCurrency}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit3 size={16} />
                  </Button>
                )}
              </div>
              
              {!isEditingCurrency ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                          Devise actuelle
                        </p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {getCurrentCurrencyInfo().name} ({getCurrentCurrencyInfo().symbol})
                        </p>
                      </div>
                      <Button
                        type="primary"
                        onClick={handleStartEditingCurrency}
                        className="!px-4 !py-2"
                      >
                        <Edit3 size={16} />
                        Modifier
                      </Button>
                    </div>
                  </div>
                  
                  {currencySaveSuccess && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-green-500 rounded-full">
                          <Check size={14} className="text-white" />
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                          Devise sauvegardée avec succès !
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <select
                      value={tempCurrency}
                      onChange={(e) => setTempCurrency(e.target.value)}
                      className="w-full px-4 py-4 border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all text-lg"
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
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      type="primary"
                      onClick={handleSaveCurrency}
                      disabled={isSavingCurrency}
                      className="flex-1"
                    >
                      <Save size={18} />
                      {isSavingCurrency ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                    <Button
                      type="secondary"
                      onClick={handleCancelEditingCurrency}
                      disabled={isSavingCurrency}
                      className="flex-1"
                    >
                      <X size={18} />
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </section>

        {/* Categories & Clients Management */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Gestion des Données
            </h2>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Categories Management */}
            <Card className="hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    Catégories
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {categories.length} catégories configurées
                  </p>
                </div>
              </div>
              
              {/* Add Category Form */}
              <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Nouvelle catégorie
                </h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nom de la catégorie"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white transition-all"
                  />
                  
                  <div className="flex gap-3">
                    <select
                      value={newCategory.type}
                      onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                      className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white transition-all"
                    >
                      <option value="expense">💸 Dépense</option>
                      <option value="income">💰 Revenu</option>
                    </select>
                    
                    <div className="relative">
                      <button 
                        className="w-12 h-12 rounded-lg border-2 border-purple-300 dark:border-purple-500 focus:outline-none hover:scale-110 transition-all shadow-lg"
                        style={{ backgroundColor: newCategory.color }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                      ></button>
                      
                      {showColorPicker && (
                        <div className="absolute right-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-20 border border-gray-200 dark:border-gray-700 w-64">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Choisir une couleur
                          </h5>
                          <div className="grid grid-cols-5 gap-3">
                            {colorOptions.map((color) => (
                              <button
                                key={color}
                                className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-all shadow-md hover:shadow-lg"
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
                      className="!px-4 !py-3"
                    >
                      <Plus size={18} />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Categories List */}
              <div className="space-y-6">
                {/* Income Categories */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Revenus ({categories.filter(c => c.type === 'income').length})
                    </h4>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categories
                      .filter((category) => category.type === 'income')
                      .map((category) => (
                        <div 
                          key={category.id} 
                          className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-5 h-5 rounded-full border-2 border-white shadow-md"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {category.name}
                            </span>
                          </div>
                          <Button 
                            type="danger" 
                            className="!p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteCategory(category.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    {categories.filter(c => c.type === 'income').length === 0 && (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <p className="text-sm">Aucune catégorie de revenu</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Expense Categories */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-500 rounded-full"></div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Dépenses ({categories.filter(c => c.type === 'expense').length})
                    </h4>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categories
                      .filter((category) => category.type === 'expense')
                      .map((category) => (
                        <div 
                          key={category.id} 
                          className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-5 h-5 rounded-full border-2 border-white shadow-md"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {category.name}
                            </span>
                          </div>
                          <Button 
                            type="danger" 
                            className="!p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteCategory(category.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    {categories.filter(c => c.type === 'expense').length === 0 && (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <p className="text-sm">Aucune catégorie de dépense</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Clients Management */}
            <Card className="hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    Clients
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {clients.length} clients enregistrés
                  </p>
                </div>
              </div>
              
              {/* Add Client Form */}
              <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Nouveau client
                </h4>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Nom du client"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddClient()}
                    className="flex-1 px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white transition-all"
                  />
                  <Button 
                    type="primary" 
                    onClick={handleAddClient}
                    disabled={!newClient.trim()}
                    className="!px-4 !py-3"
                  >
                    <Plus size={18} />
                    Ajouter
                  </Button>
                </div>
              </div>
              
              {/* Clients List */}
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {clients.map((client) => (
                  <div 
                    key={client.id} 
                    className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg shadow-md">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {client.name}
                      </span>
                    </div>
                    <Button 
                      type="danger" 
                      className="!p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteClient(client.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                {clients.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-orange-400" />
                    </div>
                    <p className="text-lg font-medium mb-2">Aucun client</p>
                    <p className="text-sm">Ajoutez des clients pour les sélectionner rapidement lors de la création de transactions</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </section>

        {/* Data Export/Import Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Sauvegarde et Données
            </h2>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          
          <Card className="hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  Gestion des Données
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Exportez, importez ou supprimez vos données
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Button 
                type="primary" 
                className="w-full justify-center h-16 text-base"
                onClick={handleExportData}
              >
                {isPremium ? (
                  <div className="flex flex-col items-center gap-1">
                    <Download size={20} />
                    <span>Export JSON</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Crown size={20} />
                    <span>Premium requis</span>
                  </div>
                )}
              </Button>

              <Button 
                type="primary" 
                className="w-full justify-center h-16 text-base"
                onClick={handleExportExcel}
              >
                {isPremium ? (
                  <div className="flex flex-col items-center gap-1">
                    <FileSpreadsheet size={20} />
                    <span>Export Excel</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Crown size={20} />
                    <span>Premium requis</span>
                  </div>
                )}
              </Button>
              
              <label className="block">
                <Button 
                  type="secondary" 
                  className="w-full justify-center h-16 text-base"
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
                    <div className="flex flex-col items-center gap-1">
                      <Upload size={20} />
                      <span>Importer</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Crown size={20} />
                      <span>Premium requis</span>
                    </div>
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
                className="w-full justify-center h-16 text-base"
                onClick={handleClearData}
              >
                <div className="flex flex-col items-center gap-1">
                  <AlertTriangle size={20} />
                  <span>Tout supprimer</span>
                </div>
              </Button>
            </div>
            
            {!isPremium && (
              <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <Crown size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      Fonctionnalités Premium
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                      Les fonctions d'export et d'import nécessitent un abonnement Premium pour protéger et sauvegarder vos données.
                    </p>
                    <Button
                      type="primary"
                      onClick={() => redirectToCheckout('premium_access')}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      <Crown size={16} />
                      Passer à Premium
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;