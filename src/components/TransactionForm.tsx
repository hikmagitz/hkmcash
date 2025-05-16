import React, { useState } from 'react';
import { PlusCircle, X, Crown } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { useStripe } from '../hooks/useStripe';
import { STRIPE_PRODUCTS } from '../stripe-config';
import Button from './UI/Button';

interface TransactionFormProps {
  onClose?: () => void;
  isModal?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onClose, 
  isModal = false 
}) => {
  const { addTransaction, categories, clients, hasReachedLimit } = useTransactions();
  const { redirectToCheckout } = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [newClient, setNewClient] = useState('');
  
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
        addTransaction({
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
        if (error instanceof Error && error.message.includes('limit reached')) {
          if (window.confirm('You have reached the transaction limit. Would you like to upgrade to premium for unlimited transactions?')) {
            setIsLoading(true);
            try {
              await redirectToCheckout('premium_access');
            } catch (checkoutError) {
              console.error('Error redirecting to checkout:', checkoutError);
              alert('Failed to redirect to checkout. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      }
    }
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await redirectToCheckout('premium_access');
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      alert('Failed to redirect to checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClient = () => {
    if (newClient.trim()) {
      addClient({ name: newClient.trim() });
      setNewClient('');
      setShowClientForm(false);
    }
  };

  const filteredCategories = categories.filter(
    category => category.type === formData.type
  );

  if (hasReachedLimit) {
    return (
      <div className="p-6 text-center">
        <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Transaction Limit Reached</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You've reached the limit of 50 transactions. Upgrade to {STRIPE_PRODUCTS.premium_access.name} for unlimited transactions!
        </p>
        <Button 
          type="primary"
          onClick={handleUpgrade}
          disabled={isLoading}
        >
          <Crown size={18} />
          {isLoading ? 'Processing...' : `Upgrade to ${STRIPE_PRODUCTS.premium_access.name}`}
        </Button>
      </div>
    );
  }

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
              $
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
          <div className="flex gap-2">
            <select
              name="client"
              value={formData.client}
              onChange={handleChange}
              className="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300"
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.name}>
                  {client.name}
                </option>
              ))}
            </select>
            <Button
              type="secondary"
              onClick={() => setShowClientForm(true)}
              className="whitespace-nowrap"
            >
              Add New
            </Button>
          </div>
        </div>

        {showClientForm && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="flex gap-2">
              <input
                type="text"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                placeholder="Enter client name"
                className="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Button type="primary" onClick={handleAddClient}>
                Add
              </Button>
              <Button type="secondary" onClick={() => setShowClientForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

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
          {isLoading ? 'Processing...' : 'Add Transaction'}
        </Button>
      </form>
    </div>
  );
};

export default TransactionForm;