import React, { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import TransactionForm from './TransactionForm';
import Button from './UI/Button';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId?: string;
  mode?: 'add' | 'edit';
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionId,
  mode = 'add',
}) => {
  const { transactions, updateTransaction, categories, clients } = useTransactions();
  const [transaction, setTransaction] = useState(
    transactions.find((t) => t.id === transactionId) || null
  );
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'expense',
    date: new Date().toISOString().slice(0, 10),
    client: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && transactionId) {
      const foundTransaction = transactions.find((t) => t.id === transactionId);
      if (foundTransaction) {
        setTransaction(foundTransaction);
        setFormData({
          amount: foundTransaction.amount.toString(),
          description: foundTransaction.description,
          category: foundTransaction.category,
          type: foundTransaction.type,
          date: foundTransaction.date,
          client: foundTransaction.client || '',
        });
      }
    }
  }, [transactionId, transactions, mode]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData({ ...formData, type, category: '' });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isLoading) return;
    
    console.log('🔄 Save changes form submission started');
    console.log('Form data:', formData);
    
    if (validateForm() && transaction) {
      try {
        setIsLoading(true);
        console.log('✅ Form validation passed, updating transaction...');
        
        await updateTransaction({
          ...transaction,
          amount: Number(formData.amount),
          description: formData.description,
          category: formData.category,
          type: formData.type as 'income' | 'expense',
          date: formData.date,
          client: formData.client || undefined,
        });
        
        console.log('✅ Transaction updated successfully');
        onClose();
      } catch (error) {
        console.error('❌ Error updating transaction:', error);
        setErrors({ general: 'Failed to update transaction. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('❌ Form validation failed:', errors);
    }
  };

  if (!isOpen) return null;

  if (mode === 'add') {
    return (
      <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border-t border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-out">
          <TransactionForm onClose={onClose} isModal={true} />
        </div>
      </div>
    );
  }

  // Edit mode
  const filteredCategories = categories.filter(
    category => category.type === formData.type
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border-t border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-out">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Edit Transaction</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{errors.general}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                type="button"
                className={`py-2 rounded-md transition-all ${
                  formData.type === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
                onClick={() => handleTypeChange('expense')}
                disabled={isLoading}
              >
                Expense
              </button>
              <button
                type="button"
                className={`py-2 rounded-md transition-all ${
                  formData.type === 'income'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
                onClick={() => handleTypeChange('income')}
                disabled={isLoading}
              >
                Income
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                  €
                </span>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  className={`w-full pl-8 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  disabled={isLoading}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="What was this transaction for?"
                disabled={isLoading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client
              </label>
              <select
                name="client"
                value={formData.client}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300"
                disabled={isLoading}
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.name}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                <option value="">Select Category</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="relative overflow-hidden font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-lg shadow-sm hover:shadow-lg active:scale-95 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none disabled:shadow-sm px-4 py-2 text-sm md:text-base min-h-[44px] bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl focus:ring-sky-500/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity cursor-pointer hover:scale-105 w-full mt-6"
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <span className={`relative z-10 flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                <Save size={18} />
                {isLoading ? 'Saving Changes...' : 'Save Changes'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;