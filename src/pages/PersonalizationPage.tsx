import React, { useState } from 'react';
import { Plus, Trash2, Edit, Save, X, Search, User, Building, Palette, Download, Upload, AlertTriangle, Check } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { useStripe } from '../hooks/useStripe';
import { useIntl } from 'react-intl';
import { generateId } from '../utils/helpers';
import { exportToExcel, exportToJSON } from '../utils/exportUtils';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const PersonalizationPage: React.FC = () => {
  const { 
    categories, 
    clients, 
    addCategory, 
    deleteCategory, 
    addClient, 
    deleteClient,
    updateClient,
    enterpriseName,
    setEnterpriseName,
    transactions
  } = useTransactions();
  const { isPremium } = useAuth();
  const { redirectToCheckout } = useStripe();
  const intl = useIntl();

  // Category state
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense', color: '#6B7280' });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryData, setEditCategoryData] = useState({ name: '', color: '' });

  // Client state
  const [newClient, setNewClient] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [editClientName, setEditClientName] = useState('');

  // Enterprise state
  const [tempEnterpriseName, setTempEnterpriseName] = useState(enterpriseName);
  const [isEditingEnterprise, setIsEditingEnterprise] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  const handleAddCategory = async () => {
    if (newCategory.name.trim()) {
      try {
        await addCategory({
          name: newCategory.name.trim(),
          type: newCategory.type as 'income' | 'expense',
          color: newCategory.color,
        });
        setNewCategory({ name: '', type: 'expense', color: '#6B7280' });
      } catch (error) {
        console.error('Error adding category:', error);
      }
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category.id);
    setEditCategoryData({ name: category.name, color: category.color });
  };

  const handleSaveCategory = async () => {
    // Note: This would require an updateCategory function in the context
    // For now, we'll just cancel the edit
    setEditingCategory(null);
    setEditCategoryData({ name: '', color: '' });
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

  const handleEditClient = (client: any) => {
    setEditingClient(client.id);
    setEditClientName(client.name);
  };

  const handleSaveClient = async () => {
    if (editingClient && editClientName.trim()) {
      try {
        await updateClient(editingClient, editClientName.trim());
        setEditingClient(null);
        setEditClientName('');
      } catch (error) {
        console.error('Error updating client:', error);
        alert('Failed to update client. Please try again.');
      }
    }
  };

  const handleCancelEditClient = () => {
    setEditingClient(null);
    setEditClientName('');
  };

  const handleDeleteClient = async (id: string) => {
    const client = clients.find(c => c.id === id);
    const clientName = client?.name || 'this client';
    
    // Count transactions that use this client
    const transactionCount = transactions.filter(t => t.client === clientName).length;
    
    let confirmMessage = `Are you sure you want to delete "${clientName}"?`;
    if (transactionCount > 0) {
      confirmMessage += `\n\nThis will also remove the client reference from ${transactionCount} transaction${transactionCount > 1 ? 's' : ''}.`;
    }
    
    if (window.confirm(confirmMessage)) {
      try {
        await deleteClient(id);
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const handleSaveEnterpriseName = async () => {
    try {
      await setEnterpriseName(tempEnterpriseName);
      setIsEditingEnterprise(false);
    } catch (error) {
      console.error('Error saving enterprise name:', error);
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
    exportToExcel(transactions, categories, clients, enterpriseName);
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
            Customize your categories, manage clients, and configure your preferences
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
                    <p className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                      {enterpriseName || 'Not set'}
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

            {/* Add new category */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
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
                <div className="flex gap-2">
                  <select
                    value={newCategory.type}
                    onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                    className="flex-1 px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="expense">{intl.formatMessage({ id: 'transaction.expense' })}</option>
                    <option value="income">{intl.formatMessage({ id: 'transaction.income' })}</option>
                  </select>
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="w-12 h-10 border border-green-300 rounded-lg cursor-pointer"
                  />
                </div>
                <Button type="success" onClick={handleAddCategory} className="w-full">
                  <Plus size={16} />
                  {intl.formatMessage({ id: 'action.add' })}
                </Button>
              </div>
            </div>

            {/* Categories list */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  {editingCategory === category.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editCategoryData.name}
                        onChange={(e) => setEditCategoryData({ ...editCategoryData, name: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      />
                      <input
                        type="color"
                        value={editCategoryData.color}
                        onChange={(e) => setEditCategoryData({ ...editCategoryData, color: e.target.value })}
                        className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                      />
                      <Button type="success" onClick={handleSaveCategory} size="sm">
                        <Save size={14} />
                      </Button>
                      <Button type="secondary" onClick={() => setEditingCategory(null)} size="sm">
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          category.type === 'income' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {intl.formatMessage({ id: `transaction.${category.type}` })}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button type="secondary" onClick={() => handleEditCategory(category)} size="sm">
                          <Edit size={14} />
                        </Button>
                        <Button type="danger" onClick={() => handleDeleteCategory(category.id)} size="sm">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Clients Management */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                <User className="w-6 h-6 text-white" />
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

            {/* Add new client */}
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
              <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-3">
                Nouveau client
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="flex-1 px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Nom du client"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddClient()}
                />
                <Button type="primary" onClick={handleAddClient}>
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            {/* Search bar for clients */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Search clients..."
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Clients list */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredClients.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {clientSearchTerm ? 'No clients found matching your search' : 'No clients added yet'}
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    {editingClient === client.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <input
                          type="text"
                          value={editClientName}
                          onChange={(e) => setEditClientName(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveClient()}
                          autoFocus
                        />
                        <Button type="success" onClick={handleSaveClient} size="sm">
                          <Check size={14} />
                        </Button>
                        <Button type="secondary" onClick={handleCancelEditClient} size="sm">
                          <X size={14} />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {client.name}
                          </span>
                        </div>
                        <div className="flex gap-1">
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
                className="w-full"
              >
                {isPremium ? (
                  <>
                    <Download size={18} />
                    Export Excel
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Premium Excel
                  </>
                )}
              </Button>
              
              <Button 
                type="primary" 
                onClick={handleExportJSON}
                disabled={isLoading}
                className="w-full"
              >
                {isPremium ? (
                  <>
                    <Download size={18} />
                    Export JSON
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Premium JSON
                  </>
                )}
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
                <AlertTriangle size={18} />
                Clear All
              </Button>
            </div>

            {!isPremium && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Premium Features
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Excel and JSON exports are premium features. Upgrade to access advanced data export options.
                    </p>
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