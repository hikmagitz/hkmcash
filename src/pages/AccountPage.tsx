import React from 'react';
import { User, Settings, FileText, Download, Upload, Shield, Lock } from 'lucide-react';
import { useIntl } from 'react-intl';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { ChangePasswordForm, ForgotPasswordForm } from '../components/Auth/PasswordManagement';

const AccountPage: React.FC = () => {
  const intl = useIntl();
  const { transactions, categories, clients } = useTransactions();
  const { user, isPremium, isOfflineMode } = useAuth();

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
          Account Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account security, preferences, and data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Password Management */}
        <ChangePasswordForm />
        <ForgotPasswordForm />
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
          
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  Email Address
                </span>
              </div>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {user?.email || 'Not available'}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 rounded-xl border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                  Account Type
                </span>
              </div>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {isOfflineMode ? 'Demo Account' : isPremium ? 'Premium Account' : 'Free Account'}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border-l-4 border-purple-500">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                  Data Storage
                </span>
              </div>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {isOfflineMode ? 'Local Storage' : 'Cloud Database'}
              </p>
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
              Account Statistics
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {transactions.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Transactions
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Categories
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {clients.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Clients
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
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

      {/* Security Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all">
          <Shield className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isOfflineMode 
              ? 'Demo mode - Your data is stored locally in your browser'
              : 'Your data is protected with bank-level encryption'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;