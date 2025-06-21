import React, { useState } from 'react';
import { User, Settings, FileText, Download, Upload, Shield, Lock, Users, UserPlus, Trash2, Crown, ChevronRight, Link, Unlink } from 'lucide-react';
import { useIntl } from 'react-intl';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { ChangePasswordForm, ForgotPasswordForm } from '../components/Auth/PasswordManagement';

const AccountPage: React.FC = () => {
  const intl = useIntl();
  const { transactions, categories, clients } = useTransactions();
  const { user, isPremium, isOfflineMode, savedAccounts, switchAccount, removeAccount, addAccount, linkAccount, unlinkAccount } = useAuth();
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

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

  const handleSwitchAccount = async (accountId: string) => {
    try {
      await switchAccount(accountId);
      setShowAccountSwitcher(false);
    } catch (error) {
      console.error('Error switching account:', error);
    }
  };

  const handleRemoveAccount = (accountId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to remove this account from the list?')) {
      removeAccount(accountId);
    }
  };

  const handleLinkAccount = async (accountId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await linkAccount(accountId);
    } catch (error) {
      console.error('Error linking account:', error);
      alert('Failed to link account. Please make sure you are signed in.');
    }
  };

  const handleUnlinkAccount = (accountId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to unlink this account? You will need to sign in manually next time.')) {
      unlinkAccount(accountId);
    }
  };

  const handleAddAccount = () => {
    setShowAccountSwitcher(false);
    addAccount();
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

      {/* Account Switcher Section */}
      {savedAccounts.length > 0 && (
        <div className="mb-8">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Account Switcher
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Switch between your saved accounts ({savedAccounts.length} accounts)
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    🔗 Linked accounts allow seamless switching without re-authentication
                  </p>
                </div>
                <Button
                  type="secondary"
                  onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
                  className="text-sm"
                >
                  <Users size={16} />
                  {showAccountSwitcher ? 'Hide Accounts' : 'Show Accounts'}
                </Button>
              </div>

              {showAccountSwitcher && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="grid grid-cols-1 gap-3">
                    {savedAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => handleSwitchAccount(account.id)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              {account.name}
                              {account.isPremium && (
                                <Crown size={16} className="text-yellow-500" />
                              )}
                              {account.isLinked && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  <Link size={10} className="mr-1" />
                                  Linked
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {account.email}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Last used: {new Date(account.lastUsed).toLocaleDateString()}
                              {account.isLinked && (
                                <span className="ml-2 text-green-600 dark:text-green-400">• Seamless switching enabled</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {account.isLinked ? (
                            <button
                              onClick={(e) => handleUnlinkAccount(account.id, e)}
                              className="p-2 text-orange-400 hover:text-orange-600 transition-colors"
                              title="Unlink account (will require manual sign in)"
                            >
                              <Unlink size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleLinkAccount(account.id, e)}
                              className="p-2 text-green-400 hover:text-green-600 transition-colors"
                              title="Link account for seamless switching"
                            >
                              <Link size={16} />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleRemoveAccount(account.id, e)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove account"
                          >
                            <Trash2 size={16} />
                          </button>
                          <ChevronRight size={20} className="text-gray-400" />
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={handleAddAccount}
                      className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
                    >
                      <UserPlus size={20} className="mr-2" />
                      Add Another Account
                    </button>
                  </div>
                  
                  {/* Linking Instructions */}
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      🔗 Account Linking
                    </h4>
                    <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <p>• <strong>Linked accounts:</strong> Switch instantly without re-entering credentials</p>
                      <p>• <strong>Unlinked accounts:</strong> Require manual sign-in when switching</p>
                      <p>• <strong>To link:</strong> Sign in to the account first, then click the link button</p>
                      <p>• <strong>Security:</strong> Tokens are stored locally and encrypted</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

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
              <p className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                {isOfflineMode ? 'Demo Account' : isPremium ? 'Premium Account' : 'Free Account'}
                {isPremium && <Crown size={18} className="text-yellow-500" />}
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
                {savedAccounts.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Saved Accounts
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