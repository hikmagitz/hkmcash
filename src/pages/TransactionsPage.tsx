import React, { useState, useMemo } from 'react';
import { ChevronDown, Filter, X } from 'lucide-react';
import TransactionList from '../components/TransactionList';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useTransactions } from '../context/TransactionContext';
import { useIntl } from 'react-intl';

interface FilterState {
  dateFrom: string;
  dateTo: string;
  types: string[];
  categories: string[];
  searchTerm: string;
}

const TransactionsPage: React.FC = () => {
  const { categories, transactions } = useTransactions();
  const intl = useIntl();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    types: [],
    categories: [],
    searchTerm: '',
  });

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Date filter
      if (filters.dateFrom && transaction.date < filters.dateFrom) return false;
      if (filters.dateTo && transaction.date > filters.dateTo) return false;
      
      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(transaction.type)) return false;
      
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(transaction.category)) return false;
      
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesDescription = transaction.description.toLowerCase().includes(searchLower);
        const matchesCategory = transaction.category.toLowerCase().includes(searchLower);
        const matchesClient = transaction.client?.toLowerCase().includes(searchLower);
        const matchesAmount = transaction.amount.toString().includes(searchLower);
        
        if (!matchesDescription && !matchesCategory && !matchesClient && !matchesAmount) {
          return false;
        }
      }
      
      return true;
    });
  }, [transactions, filters]);

  const handleTypeChange = (type: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      types: checked 
        ? [...prev.types, type]
        : prev.types.filter(t => t !== type)
    }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      types: [],
      categories: [],
      searchTerm: '',
    });
  };

  const hasActiveFilters = filters.dateFrom || filters.dateTo || filters.types.length > 0 || 
                          filters.categories.length > 0 || filters.searchTerm;

  const activeFilterCount = [
    filters.dateFrom || filters.dateTo ? 1 : 0,
    filters.types.length,
    filters.categories.length,
    filters.searchTerm ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {intl.formatMessage({ id: 'nav.transactions' })}
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder={intl.formatMessage({ id: 'common.search' })}
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[44px]"
              />
            </div>
            
            {/* Filter Button */}
            <div className="relative">
              <Button 
                type="secondary" 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full sm:w-auto relative"
              >
                <Filter size={18} />
                {intl.formatMessage({ id: 'common.filter' })}
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {/* Filter Panel */}
              {isFilterOpen && (
                <Card className="absolute right-0 mt-2 w-80 z-30 max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {intl.formatMessage({ id: 'common.filter' })}
                      </h3>
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[40px]"
                          placeholder="From"
                        />
                        <input
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[40px]"
                          placeholder="To"
                        />
                      </div>
                    </div>
                    
                    {/* Transaction Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {intl.formatMessage({ id: 'transaction.type' })}
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input 
                            type="checkbox" 
                            checked={filters.types.includes('income')}
                            onChange={(e) => handleTypeChange('income', e.target.checked)}
                            className="mr-2 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {intl.formatMessage({ id: 'transaction.income' })}
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input 
                            type="checkbox" 
                            checked={filters.types.includes('expense')}
                            onChange={(e) => handleTypeChange('expense', e.target.checked)}
                            className="mr-2 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {intl.formatMessage({ id: 'transaction.expense' })}
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    {/* Categories */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {intl.formatMessage({ id: 'settings.categories' })}
                      </label>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {categories.map((category) => (
                          <label key={category.id} className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={filters.categories.includes(category.name)}
                              onChange={(e) => handleCategoryChange(category.name, e.target.checked)}
                              className="mr-2 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {category.name}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Button 
                        type="secondary" 
                        onClick={clearFilters}
                        className="flex-1"
                        disabled={!hasActiveFilters}
                      >
                        Clear All
                      </Button>
                      <Button 
                        type="primary" 
                        onClick={() => setIsFilterOpen(false)}
                        className="flex-1"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                Search: "{filters.searchTerm}"
                <button
                  onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
                  className="ml-2 text-teal-600 hover:text-teal-800 dark:text-teal-300"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            {(filters.dateFrom || filters.dateTo) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Date: {filters.dateFrom || '...'} to {filters.dateTo || '...'}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }))}
                  className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.types.map(type => (
              <span key={type} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {intl.formatMessage({ id: `transaction.${type}` })}
                <button
                  onClick={() => handleTypeChange(type, false)}
                  className="ml-2 text-green-600 hover:text-green-800 dark:text-green-300"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            {filters.categories.map(category => (
              <span key={category} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {category}
                <button
                  onClick={() => handleCategoryChange(category, false)}
                  className="ml-2 text-purple-600 hover:text-purple-800 dark:text-purple-300"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Results Summary */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Showing {filteredTransactions.length} of {transactions.length} transactions
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-2 text-teal-600 hover:text-teal-800 dark:text-teal-400 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>
      
      <TransactionList transactions={filteredTransactions} />
    </div>
  );
};

export default TransactionsPage;