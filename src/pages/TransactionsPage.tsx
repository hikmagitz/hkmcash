import React, { useState } from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import TransactionList from '../components/TransactionList';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useTransactions } from '../context/TransactionContext';

const TransactionsPage: React.FC = () => {
  const { categories } = useTransactions();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">All Transactions</h1>
        
        <div className="relative">
          <Button 
            type="secondary" 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter size={18} />
            Filter
            <ChevronDown size={16} />
          </Button>
          
          {isFilterOpen && (
            <Card className="absolute right-0 mt-2 w-64 z-10">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="From"
                    />
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="To"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Income</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Expense</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categories
                  </label>
                  <div className="max-h-32 overflow-y-auto">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center mb-1">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    type="secondary" 
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      <TransactionList />
    </div>
  );
};

export default TransactionsPage;