import React, { useState, useEffect } from 'react';
import { Download, Upload, Plus, Trash2, FileSpreadsheet, AlertTriangle, Crown, Building2, Users, Save, Edit3, Check, X, Euro, Settings, Palette, Database } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
            <Settings className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {intl.formatMessage({ id: 'nav.settings' })}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez vos préférences, catégories et données d'entreprise
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        
        {/* General Settings Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Paramètres Généraux
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Settings */}
            <Card className="h-fit">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Nom de l'Entreprise
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Apparaîtra sur vos reçus PDF et exports Excel
                  </p>
                </div>
              </div>
              
              {!isEditingEnterprise ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800 dark:text-white font-medium">
                        {enterpriseName || 'Aucun nom défini'}
                      </span>
                      <Button
                        type="secondary"
                        onClick={handleStartEditingEnterprise}
                        className="!px-3 !py-1.5"
                      >
                        <Edit3 size={14} />
                        Modifier
                      </Button>
                    </div>
                  </div>
                  
                  {saveSuccess && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                        <Check size={16} />
                        Nom d'entreprise sauvegardé avec succès !
                      </p>
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
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                      disabled={isSavingEnterprise}
                      autoFocus
                    />
                    {isSavingEnterprise && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
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
                      <Save size={16} />
                      {isSavingEnterprise ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                    <Button
                      type="secondary"
                      onClick={handleCancelEditingEnterprise}
                      disabled={isSavingEnterprise}
                      className="flex-1"
                    >
                      <X size={16} />
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Currency Settings */}
            <Card className="h-fit">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Euro className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Devise Préférée
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Utilisée dans toute l'application
                  </p>
                </div>
              </div>
              
              {!isEditingCurrency ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800 dark:text-white font-medium">
                        {getCurrentCurrencyInfo().name} ({getCurrentCurrencyInfo().symbol})
                      </span>
                      <Button
                        type="secondary"
                        onClick={handleStartEditingCurrency}
                        className="!px-3 !py-1.5"
                      >
                        <Edit3 size={14} />
                        Modifier
                      </Button>
                    </div>
                  </div>
                  
                  {currencySaveSuccess && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                        <Check size={16} />
                        Devise sauvegardée avec succès !
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <select
                      value={tempCurrency}
                      onChange={(e) => setTempCurrency(e.target.value)}
                      className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
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
                      <Save size={16} />
                      {isSavingCurrency ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                    <Button
                      type="secondary"
                      onClick={handleCancelEditingCurrency}
                      disabled={isSavingCurrency}
                      className="flex-1"
                    >
                      <X size={16} />
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </section>

        {/* Data Management Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Gestion des Données
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Categories Management */}
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Catégories
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Organisez vos transactions par catégories
                  </p>
                </div>
              </div>
              
              {/* Add Category Form */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Ajouter une nouvelle catégorie
                </h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nom de la catégorie"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
                  />
                  
                  <div className="flex gap-2">
                    <select
                      value={newCategory.type}
                      onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
                    >
                      <option value="expense">Dépense</option>
                      <option value="income">Revenu</option>
                    </select>
                    
                    <div className="relative">
                      <button 
                        className="w-10 h-10 rounded-md border-2 border-gray-300 dark:border-gray-500 focus:outline-none hover:scale-105 transition-transform"
                        style={{ backgroundColor: newCategory.color }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                      ></button>
                      
                      {showColorPicker && (
                        <div className="absolute right-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-200 dark:border-gray-700 w-56">
                          <div className="grid grid-cols-5 gap-3">
                            {colorOptions.map((color) => (
                              <button
                                key={color}
                                className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform shadow-sm"
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
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Categories List */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Revenus ({categories.filter(c => c.type === 'income').length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {categories
                      .filter((category) => category.type === 'income')
                      .map((category) => (
                        <div 
                          key={category.id} 
                          className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-500"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="text-sm text-gray-800 dark:text-gray-200">
                              {category.name}
                            </span>
                          </div>
                          <Button 
                            type="danger" 
                            className="!p-1.5"
                            onClick={() => deleteCategory(category.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    Dépenses ({categories.filter(c => c.type === 'expense').length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {categories
                      .filter((category) => category.type === 'expense')
                      .map((category) => (
                        <div 
                          key={category.id} 
                          className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-500"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="text-sm text-gray-800 dark:text-gray-200">
                              {category.name}
                            </span>
                          </div>
                          <Button 
                            type="danger" 
                            className="!p-1.5"
                            onClick={() => deleteCategory(category.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Clients Management */}
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Clients
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gérez votre liste de clients
                  </p>
                </div>
              </div>
              
              {/* Add Client Form */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Ajouter un nouveau client
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nom du client"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddClient()}
                    className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
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
              
              {/* Clients List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {clients.map((client) => (
                  <div 
                    key={client.id} 
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-orange-100 dark:bg-orange-900 rounded-full">
                        <Users className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span className="text-sm text-gray-800 dark:text-gray-200">
                        {client.name}
                      </span>
                    </div>
                    <Button 
                      type="danger" 
                      className="!p-1.5"
                      onClick={() => deleteClient(client.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
                {clients.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun client ajouté</p>
                    <p className="text-xs">Ajoutez des clients pour les sélectionner rapidement</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </section>

        {/* Data Export/Import Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Sauvegarde et Données
            </h2>
          </div>
          
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Database className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Gestion des Données
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Exportez, importez ou supprimez vos données
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                type="primary" 
                className="w-full justify-center"
                onClick={handleExportData}
              >
                {isPremium ? (
                  <>
                    <Download size={18} />
                    Export JSON
                  </>
                ) : (
                  <>
                    <Crown size={18} />
                    Premium requis
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
                    <FileSpreadsheet size={18} />
                    Export Excel
                  </>
                ) : (
                  <>
                    <Crown size={18} />
                    Premium requis
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
                      <Upload size={18} />
                      Importer
                    </>
                  ) : (
                    <>
                      <Crown size={18} />
                      Premium requis
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
                <AlertTriangle size={18} />
                Tout supprimer
              </Button>
            </div>
            
            {!isPremium && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                  <Crown size={16} />
                  Les fonctions d'export et d'import nécessitent un abonnement Premium
                </p>
              </div>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;