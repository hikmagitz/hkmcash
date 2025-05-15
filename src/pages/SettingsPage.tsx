import React, { useState } from 'react';
import { Download, Upload, Plus, Trash2, FileSpreadsheet, AlertTriangle, Crown } from 'lucide-react';
import { useIntl } from 'react-intl';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { useTransactions } from '../context/TransactionContext';
import { generateId, getDefaultCategories } from '../utils/helpers';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const SettingsPage: React.FC = () => {
  const { categories, addCategory, deleteCategory, transactions } = useTransactions();
  const { isPremium, user } = useAuth();
  const intl = useIntl();
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense',
    color: '#6B7280',
  });
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  
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

  const handleExportData = () => {
    const data = {
      transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
      categories: JSON.parse(localStorage.getItem('categories') || '[]'),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_tracker_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    if (!isPremium) {
      window.location.href = '/premium';
      return;
    }

    const transactionData = transactions.map(t => ({
      Date: new Date(t.date).toLocaleDateString(intl.locale),
      Type: intl.formatMessage({ id: `transaction.${t.type}` }),
      Category: t.category,
      Description: t.description,
      Amount: t.amount,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(transactionData);

    const colWidths = [
      { wch: 12 }, // Date
      { wch: 10 }, // Type
      { wch: 15 }, // Category
      { wch: 30 }, // Description
      { wch: 12 }, // Amount
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, `finance_tracker_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleClearData = async () => {
    if (window.confirm(intl.formatMessage({ id: 'settings.clearDataConfirm' }))) {
      try {
        if (user) {
          const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('user_id', user.id);

          if (error) {
            throw error;
          }
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
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        {intl.formatMessage({ id: 'nav.settings' })}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                  className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                    className="w-10 h-10 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none"
                    style={{ backgroundColor: newCategory.color }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  ></button>
                  
                  {showColorPicker && (
                    <div className="absolute right-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-5 gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
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
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-gray-800 dark:text-gray-200">{category.name}</span>
                      </div>
                      <Button 
                        type="danger" 
                        className="!p-1 !px-2"
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
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-gray-800 dark:text-gray-200">{category.name}</span>
                      </div>
                      <Button 
                        type="danger" 
                        className="!p-1 !px-2"
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
              <Download size={18} />
              {intl.formatMessage({ id: 'settings.exportData' })} (JSON)
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
              >
                <Upload size={18} />
                {intl.formatMessage({ id: 'settings.importData' })}
              </Button>
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target?.result as string);
                        if (data.transactions && data.categories) {
                          localStorage.setItem('transactions', JSON.stringify(data.transactions));
                          localStorage.setItem('categories', JSON.stringify(data.categories));
                          window.location.reload();
                        }
                      } catch (error) {
                        alert(intl.formatMessage({ id: 'common.error' }));
                      }
                    };
                    reader.readAsText(file);
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