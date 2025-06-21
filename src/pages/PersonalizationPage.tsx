import React, { useState } from 'react';
import { Plus, Trash2, Edit, Save, X, Search, Users, Palette, Building, Download, Upload, AlertTriangle } from 'lucide-react';
import { useIntl } from 'react-intl';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { useStripe } from '../hooks/useStripe';
import { exportToExcel, exportToJSON } from '../utils/exportUtils';
import { STRIPE_PRODUCTS } from '../stripe-config';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const PersonalizationPage: React.FC = () => {
  const intl = useIntl();
  const { 
    categories, 
    clients, 
    addCategory, 
    deleteCategory, 
    addClient, 
    deleteClient,
    updateClient,
    transactions,
    enterpriseName,
    setEnterpriseName
  } = useTransactions();
  const { isPremium } = useAuth();
  const { redirectToCheckout } = useStripe();

  // Category state
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#3B82F6'
  });

  // Client state
  const [newClient, setNewClient] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [editingClientName, setEditingClientName] = useState('');

  // Enterprise name state
  const [tempEnterpriseName, setTempEnterpriseName] = useState(enterpriseName);
  const [isEditingEnterprise, setIsEditingEnterprise] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleAddCategory = async () => {
    if (newCategory.name.trim()) {
      try {
        await addCategory(newCategory);
        setNewCategory({ name: '', type: 'expense', color: '#3B82F6' });
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

  const handleAddClient = async () => {
    if (newClient.trim()) {
      try {
        await addClient({ name: newClient.trim() });
        setNewClient('');
      } catch (error) {
        console.error('Error adding client:', error);
      }
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(id);
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const handleEditClient = (client: any) => {
    setEditingClient(client.id);
    setEditingClientName(client.name);
  };

  const handleSaveClient = async () => {
    if (editingClient && editingClientName.trim()) {
      try {
        await updateClient(editingClient, editingClientName.trim());
        setEditingClient(null);
        setEditingClientName('');
      } catch (error) {
        console.error('Error updating client:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
    setEditingClientName('');
  };

  const handleSaveEnterpriseName = async () => {
    try {
      await setEnterpriseName(tempEnterpriseName);
      setIsEditingEnterprise(false);
    } catch (error) {
      console.error('Error updating enterprise name:', error);
    }
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
    exportToExcel(transactions, enterpriseName);
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
    exportToJSON(transactions, categories, clients, enterpriseName);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {intl.formatMessage({ id: 'nav.settings' })}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your experience and manage your data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Enterprise Settings */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {intl.formatMessage({ id: 'settings.enterpriseName' })}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {intl.formatMessage({ id: 'settings.enterpriseName.description' })}
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
                    placeholder="Enter enterprise name"
                  />
                  <div className="flex gap-2">
                    <Button type="success" onClick={handleSaveEnterpriseName} className="flex-1">
                      <Save size={16} />
                      Save
                    </Button>
                    <Button 
                      type="secondary" 
                      onClick={() => {
                        setIsEditingEnterprise(false);
                        setTempEnterpriseName(enterpriseName);
                      }}
                      className="flex-1"
                    >
                      <X size={16} />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                    <p className="font-medium text-blue-900 dark:text-blue-200">
                      {enterpriseName || 'No enterprise name set'}
                    </p>
                  </div>
                  <Button 
                    type="primary" 
                    onClick={() => setIsEditingEnterprise(true)}
                    className="w-full"
                  >
                    <Edit size={16} />
                    Edit Name
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Categories Management */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {intl.formatMessage({ id: 'settings.categories' })}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {categories.length} configured
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">
                  {intl.formatMessage({ id: 'settings.addCategory' })}
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={intl.formatMessage({ id: 'settings.categoryName' })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newCategory.type}
                      onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'income' | 'expense' })}
                      className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="expense">{intl.formatMessage({ id: 'transaction.expense' })}</option>
                      <option value="income">{intl.formatMessage({ id: 'transaction.income' })}</option>
                    </select>
                    <input
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      className="w-full h-10 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <Button type="success" onClick={handleAddCategory} className="w-full">
                    <Plus size={16} />
                    {intl.formatMessage({ id: 'action.add' })}
                  </Button>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-gray-800 dark:text-white">{category.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        category.type === 'income' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {intl.formatMessage({ id: `transaction.${category.type}` })}
                      </span>
                    </div>
                    <Button type="danger" onClick={() => handleDeleteCategory(category.id)} size="sm">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Clients Management */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Clients
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {clients.length} configured
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Add New Client */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-3">
                  New Client
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    className="flex-1 px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Client name"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddClient()}
                  />
                  <Button type="primary" onClick={handleAddClient}>
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              {/* Search Clients */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Search clients..."
                />
              </div>

              {/* Clients List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredClients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {clientSearch ? 'No clients found matching your search' : 'No clients added yet'}
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      {editingClient === client.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingClientName}
                            onChange={(e) => setEditingClientName(e.target.value)}
                            className="flex-1 px-2 py-1 border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveClient()}
                            autoFocus
                          />
                          <Button type="success" onClick={handleSaveClient} size="sm">
                            <Save size={14} />
                          </Button>
                          <Button type="secondary" onClick={handleCancelEdit} size="sm">
                            <X size={14} />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium text-gray-800 dark:text-white">{client.name}</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button type="secondary" onClick={() => handleEditClient(client)} size="sm">
                              <Edit size={14} />
                            </Button>
                            <Button type="danger" onClick={() => handleDeleteClient(client.id)} size="sm">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Data Management */}
          <Card className="lg:col-span-2 xl:col-span-3 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {intl.formatMessage({ id: 'settings.dataManagement' })}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Export, import, and manage your financial data
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                type="success" 
                onClick={handleExportExcel}
                disabled={isLoading}
                className="flex flex-col items-center p-6 h-auto"
              >
                <Download className="w-8 h-8 mb-2" />
                <span className="font-semibold">Export Excel</span>
                <span className="text-xs opacity-75">
                  {isPremium ? 'Available' : 'Premium Feature'}
                </span>
              </Button>

              <Button 
                type="primary" 
                onClick={handleExportJSON}
                disabled={isLoading}
                className="flex flex-col items-center p-6 h-auto"
              >
                <Download className="w-8 h-8 mb-2" />
                <span className="font-semibold">Export JSON</span>
                <span className="text-xs opacity-75">
                  {isPremium ? 'Available' : 'Premium Feature'}
                </span>
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
                  className="w-full flex flex-col items-center p-6 h-auto"
                >
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="font-semibold">Import Data</span>
                  <span className="text-xs opacity-75">JSON Format</span>
                </Button>
              </div>

              <Button 
                type="danger" 
                onClick={clearAllData}
                className="flex flex-col items-center p-6 h-auto"
              >
                <AlertTriangle className="w-8 h-8 mb-2" />
                <span className="font-semibold">Clear All</span>
                <span className="text-xs opacity-75">Permanent Action</span>
              </Button>
            </div>

            {!isPremium && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      Upgrade to {STRIPE_PRODUCTS.premium_access.name}
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                      Get access to advanced export features, unlimited transactions, and PDF receipts.
                    </p>
                    <Button 
                      type="primary"
                      onClick={() => window.open('/premium', '_blank')}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      Upgrade Now - €{STRIPE_PRODUCTS.premium_access.price}/month
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationPage;