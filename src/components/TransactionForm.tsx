import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import Button from './UI/Button';

interface TransactionFormProps {
  onClose?: () => void;
  isModal?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onClose, 
  isModal = false 
}) => {
  const { addTransaction, categories, clients } = useTransactions();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'expense',
    date: new Date().toISOString().slice(0, 10),
    client: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
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
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        await addTransaction({
          amount: Number(formData.amount),
          description: formData.description,
          category: formData.category,
          type: formData.type as 'income' | 'expense',
          date: formData.date,
          client: formData.client || undefined,
        });
        
        setFormData({
          amount: '',
          description: '',
          category: '',
          type: 'expense',
          date: new Date().toISOString().slice(0, 10),
          client: '',
        });
        
        if (onClose) {
          onClose();
        }
      } catch (error) {
        console.error('Error adding transaction:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredCategories = categories.filter(
    category => category.type === formData.type
  );

  return (
    <div className={`${isModal ? 'p-6' : 'p-0'}`}>
      {isModal && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Add Transaction</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
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
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-500">{errors.date}</p>
          )}
        </div>

        <Button 
          type="primary" 
          className="w-full mt-6"
          disabled={isLoading}
        >
          <PlusCircle size={18} />
          {isLoading ? 'Adding...' : 'Add Transaction'}
        </Button>
      </form>
    </div>
  );
};

export default TransactionForm;