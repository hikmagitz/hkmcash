import React, { useState } from 'react';
import { Download, Upload, Plus, Trash2, FileSpreadsheet, AlertTriangle, Crown, Building2, Users } from 'lucide-react';
import { useIntl } from 'react-intl';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { useTransactions } from '../context/TransactionContext';
import { generateId, getDefaultCategories } from '../utils/helpers';
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
  const [isExporting, setIsExporting] = useState(false);

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

  const handleEnterpriseNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    await setEnterpriseName(value);
  };

  const handleExportData = async () => {
    if (!isPremium) {
      if (window.confirm(intl.formatMessage({ id: 'premium.upgradePrompt' }))) {
        await redirectToCheckout('premium_access');
      }
      return;
    }

    if (!user) {
      alert(intl.formatMessage({ id: 'auth.sessionExpired' }));
      return;
    }

    try {
      setIsExporting(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('No session found');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          format: 'json',
          enterpriseName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const { downloadUrl } = await response.json();
      window.location.href = downloadUrl;
    } catch (error) {
      console.error('Error exporting data:', error);
      alert(intl.formatMessage({ id: 'common.error' }));
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!isPremium) {
      if (window.confirm(intl.formatMessage({ id: 'premium.upgradePrompt' }))) {
        await redirectToCheckout('premium_access');
      }
      return;
    }

    if (!user) {
      alert(intl.formatMessage({ id: 'auth.sessionExpired' }));
      return;
    }

    try {
      setIsExporting(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('No session found');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          format: 'excel',
          enterpriseName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const { downloadUrl } = await response.json();
      window.location.href = downloadUrl;
    } catch (error) {
      console.error('Error exporting data:', error);
      alert(intl.formatMessage({ id: 'common.error' }));
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (file: File) => {
    if (!isPremium) {
      if (window.confirm(intl.formatMessage({ id: 'premium.upgradePrompt' }))) {
        await redirectToCheckout('premium_access');
      }
      return;
    }

    if (!user) {
      alert(intl.formatMessage({ id: 'auth.sessionExpired' }));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('No session found');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to import data');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error importing data:', error);
      alert(intl.formatMessage({ id: 'common.error' }));
    }
  };

  const handleClearData = async () => {
    if (window.confirm(intl.formatMessage({ id: 'settings.clearDataConfirm' }))) {
      try {
        if (user) {
          const { error: deleteError } = await supabase
            .from('transactions')
            .delete()
            .eq('user_id', user.id);

          if (deleteError) throw deleteError;
        }
        
        localStorage.setItem('categories', JSON.stringify(getDefaultCategories()));
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
    <div className="max-w-6xl mx-auto space-y-6 py-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white px-4">
        {intl.formatMessage({ id: 'nav.settings' })}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Enterprise Settings
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Enterprise Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={enterpriseName}
                onChange={handleEnterpriseNameChange}
                placeholder="Enter enterprise name"
                className="flex-grow px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[44px]"
              />
              <div className="flex items-center">
                <Building2 className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              This name will appear on your PDF receipts and Excel exports
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Clients
          </h2>
          
          <div className="mb-6">
            <div className="flex flex-col gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter client name"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[44px]"
              />
              <Button 
                type="primary" 
                onClick={handleAddClient}
                className="w-full justify-center"
              >
                <Plus size={18} />
                Add Client
              </Button>
            </div>
            
            <div className="space-y-2">
              {clients.map((client) => (
                <div 
                  key={client.id} 
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md"
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
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
              {clients.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No clients added yet
                </p>
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
                        <Trash2 size={18} />
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
                        <Trash2 size={18} />
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
              disabled={isExporting}
            >
              {isPremium ? (
                <>
                  <Download size={18} />
                  {isExporting ? 'Exporting...' : `${intl.formatMessage({ id: 'settings.exportData' })} (JSON)`}
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
              disabled={isExporting}
            >
              {isPremium ? (
                <>
                  <FileSpreadsheet size={18} />
                  {isExporting ? 'Exporting...' : `${intl.formatMessage({ id: 'settings.exportData' })} (Excel)`}
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