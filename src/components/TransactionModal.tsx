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
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && transactionId) {
      const foundTransaction = transactions.find((t) => t.id === transactionId);
      if (foundTransaction) {
        setTransaction(foundTransaction);
        const initialFormData = {
          amount: foundTransaction.amount.toString(),
          description: foundTransaction.description,
          category: foundTransaction.category,
          type: foundTransaction.type,
          date: foundTransaction.date,
          client: foundTransaction.client || '',
        };
        setFormData(initialFormData);
        setHasChanges(false);
      }
    }
  }, [transactionId, transactions, mode]);

  // Track changes to enable/disable save button
  useEffect(() => {
    if (transaction) {
      const hasFormChanges = 
        formData.amount !== transaction.amount.toString() ||
        formData.description !== transaction.description ||
        formData.category !== transaction.category ||
        formData.type !== transaction.type ||
        formData.date !== transaction.date ||
        formData.client !== (transaction.client || '');
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, transaction]);

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
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData(prev => {
      const newFormData = { ...prev, type };
      
      // If changing type and current category doesn't exist for new type, 
      // try to find a suitable category or clear it
      const categoriesForNewType = categories.filter(cat => cat.type === type);
      const currentCategoryExists = categoriesForNewType.some(cat => cat.name === prev.category);
      
      if (!currentCategoryExists) {
        // Try to find a similar category name in the new type
        const similarCategory = categoriesForNewType.find(cat => 
          cat.name.toLowerCase().includes(prev.category.toLowerCase()) ||
          prev.category.toLowerCase().includes(cat.name.toLowerCase())
        );
        
        if (similarCategory) {
          newFormData.category = similarCategory.name;
        } else if (categoriesForNewType.length > 0) {
          // If no similar category found, select the first available category
          newFormData.category = categoriesForNewType[0].name;
        } else {
          // If no categories available for this type, clear the category
          newFormData.category = '';
        }
      }
      
      return newFormData;
    });
    
    // Clear category error when type changes
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Amount validation
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }
    
    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    } else if (formData.description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }
    
    // Category validation
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    } else {
      // Check if the selected category exists for the current type
      const categoryExists = categories.some(cat => 
        cat.name === formData.category && cat.type === formData.type
      );
      if (!categoryExists) {
        newErrors.category = `Category "${formData.category}" is not available for ${formData.type} transactions`;
      }
    }
    
    // Date validation
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);
      
      if (selectedDate > oneYearFromNow) {
        newErrors.date = 'Date cannot be more than one year in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isLoading) {
      console.log('⚠️ Form submission already in progress, ignoring duplicate request');
      return;
    }

    // Check if there are actually changes to save
    if (!hasChanges) {
      console.log('ℹ️ No changes detected, closing modal');
      onClose();
      return;
    }
    
    console.log('🔄 Save changes form submission started');
    console.log('Form data:', { ...formData, amount: parseFloat(formData.amount) });
    
    // Clear any previous general errors
    setErrors(prev => ({ ...prev, general: '' }));
    
    if (!validateForm()) {
      console.log('❌ Form validation failed:', errors);
      return;
    }

    if (!transaction) {
      console.error('❌ No transaction found to update');
      setErrors(prev => ({ ...prev, general: 'Transaction not found. Please try again.' }));
      return;
    }

    try {
      setIsLoading(true);
      console.log('✅ Form validation passed, updating transaction...');
      
      const updatedTransaction = {
        ...transaction,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        category: formData.category,
        type: formData.type as 'income' | 'expense',
        date: formData.date,
        client: formData.client.trim() || undefined,
      };
      
      await updateTransaction(updatedTransaction);
      
      console.log('✅ Transaction updated successfully');
      
      // Small delay to show success state
      setTimeout(() => {
        onClose();
      }, 300);
      
    } catch (error: any) {
      console.error('❌ Error updating transaction:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to update transaction. Please try again.';
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        errorMessage = 'You do not have permission to update this transaction.';
      } else if (error.message?.includes('not found')) {
        errorMessage = 'Transaction not found. It may have been deleted.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors(prev => ({ ...prev, general: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape' && !isLoading) {
        onClose();
      }
      
      // Ctrl/Cmd + S to save
      if (isOpen && (e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasChanges && !isLoading) {
          handleSubmit(e as any);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasChanges, isLoading, handleSubmit]);

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

  // Enhanced form validation for button state
  const isFormValid = formData.amount && 
                     formData.description.trim() && 
                     formData.category && 
                     formData.date &&
                     !isNaN(parseFloat(formData.amount)) &&
                     parseFloat(formData.amount) > 0 &&
                     formData.description.trim().length >= 3 &&
                     categories.some(cat => cat.name === formData.category && cat.type === formData.type);

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border-t border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-out">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Edit Transaction</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              <X size={24} />
            </button>
          </div>
          
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <span className="font-medium">Error:</span>
                {errors.general}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                type="button"
                className={`py-2 rounded-md transition-all font-medium ${
                  formData.type === 'expense'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                onClick={() => handleTypeChange('expense')}
                disabled={isLoading}
              >
                Expense
              </button>
              <button
                type="button"
                className={`py-2 rounded-md transition-all font-medium ${
                  formData.type === 'income'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                onClick={() => handleTypeChange('income')}
                disabled={isLoading}
              >
                Income
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                  €
                </span>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  className={`w-full pl-8 pr-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="What was this transaction for?"
                disabled={isLoading}
                required
                minLength={3}
                maxLength={200}
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
                className="w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300 transition-all"
                disabled={isLoading}
              >
                <option value="">Select Client (Optional)</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.name}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category * 
                <span className="text-xs text-gray-500 ml-1">
                  ({formData.type} categories)
                </span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
                required
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
              {filteredCategories.length === 0 && (
                <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">
                  No categories available for {formData.type} transactions. Please add categories in Settings.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
                required
                max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            {/* Enhanced Save Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isLoading || !isFormValid || !hasChanges}
                className={`flex-1 relative overflow-hidden font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-lg shadow-sm hover:shadow-lg active:scale-95 focus:outline-none focus:ring-4 px-4 py-3 text-white min-h-[48px] ${
                  isLoading || !isFormValid || !hasChanges
                    ? 'bg-gray-400 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 shadow-lg hover:shadow-xl focus:ring-sky-500/30 cursor-pointer hover:scale-105 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity'
                }`}
              >
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <span className={`relative z-10 flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                  <Save size={18} />
                  {!hasChanges ? 'No Changes' : isLoading ? 'Saving...' : 'Save Changes'}
                </span>
              </button>
            </div>

            {/* Debug info for development */}
            {import.meta.env.DEV && (
              <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                <p>Debug: hasChanges={hasChanges.toString()}, isFormValid={isFormValid.toString()}</p>
                <p>Type: {formData.type}, Category: {formData.category}</p>
                <p>Available categories: {filteredCategories.length}</p>
              </div>
            )}

            {/* Keyboard shortcut hint */}
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+S</kbd> to save or <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Esc</kbd> to cancel
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;