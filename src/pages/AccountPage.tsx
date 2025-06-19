import React from 'react';
import { User, Settings, FileText, Download, Upload } from 'lucide-react';
import { useIntl } from 'react-intl';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useTransactions } from '../context/TransactionContext';

const AccountPage: React.FC = () => {
  const intl = useIntl();
  const { transactions, categories, clients } = useTransactions();

  const handleExportData = () => {
    const data = {
      transactions,
      categories,
      clients,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hkm-cash-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Account Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Account Information
            </h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Account Type
              </label>
              <p className="text-gray-800 dark:text-white">Local Account</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Data Storage
              </label>
              <p className="text-gray-800 dark:text-white">Browser Local Storage</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Transactions
              </label>
              <p className="text-gray-800 dark:text-white">{transactions.length}</p>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Settings className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Data Management
            </h2>
          </div>
          
          <div className="space-y-3">
            <Button 
              type="secondary" 
              onClick={handleExportData}
              className="w-full"
            >
              <Download size={18} />
              Export Data
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
              Clear All Data
            </Button>
          </div>
        </Card>

        {/* Statistics */}
        <Card className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Statistics
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {transactions.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Transactions
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Categories
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {clients.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Clients
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {transactions.filter(t => t.type === 'income').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Income Records
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AccountPage;