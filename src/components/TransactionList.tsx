import React, { useState } from 'react';
import { Edit, Trash2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { useStripe } from '../hooks/useStripe';
import { formatCurrency, formatDate } from '../utils/helpers';
import { generateTransactionReceipt } from '../utils/pdfGenerator';
import { Transaction } from '../types';
import Button from './UI/Button';
import Card from './UI/Card';
import TransactionModal from './TransactionModal';

interface TransactionListProps {
  limit?: number;
  transactions?: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ limit, transactions: propTransactions }) => {
  const { transactions: contextTransactions, deleteTransaction, categories } = useTransactions();
  const { isPremium } = useAuth();
  const { redirectToCheckout } = useStripe();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<string | null>(null);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use provided transactions or context transactions
  const transactions = propTransactions || contextTransactions;
  
  const displayTransactions = limit
    ? transactions.slice(0, limit)
    : transactions;

  const handleEdit = (id: string) => {
    setCurrentTransaction(id);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  const handleDownloadReceipt = async (transaction: Transaction) => {
    if (!isPremium) {
      if (window.confirm('PDF receipts are a premium feature. Would you like to upgrade to premium?')) {
        setIsLoading(true);
        try {
          await redirectToCheckout('premium_access');
        } catch (error) {
          console.error('Error redirecting to checkout:', error);
          alert('Failed to redirect to checkout. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
      return;
    }
    const enterpriseName = localStorage.getItem('enterpriseName') || '';
    generateTransactionReceipt(transaction, enterpriseName);
  };

  const toggleExpand = (id: string) => {
    setExpandedTransaction(expandedTransaction === id ? null : id);
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((cat) => cat.name === categoryName);
    return category?.color || '#6B7280';
  };

  return (
    <>
      <div className="space-y-3">
        {displayTransactions.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No transactions found.</p>
          </Card>
        ) : (
          displayTransactions.map((transaction) => (
            <Card 
              key={transaction.id}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(transaction.id)}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-2 h-10 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {transaction.type === 'income' ? transaction.client || 'No Client' : transaction.description}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div 
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                    style={{ 
                      backgroundColor: `${getCategoryColor(transaction.category)}20`,
                      color: getCategoryColor(transaction.category)
                    }}
                  >
                    {transaction.category}
                  </div>
                  <span 
                    className={`font-semibold whitespace-nowrap ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                  {expandedTransaction === transaction.id ? (
                    <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </div>
              
              {expandedTransaction === transaction.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {transaction.type === 'income' ? transaction.description : transaction.client || 'No Client'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      type="secondary"
                      onClick={() => handleDownloadReceipt(transaction)}
                      disabled={isLoading}
                      className="flex-1 min-w-[120px]"
                    >
                      {isPremium ? (
                        <>
                          <FileText size={16} />
                          <span className="ml-1">Receipt</span>
                        </>
                      ) : (
                        <>
                          <FileText size={16} />
                          <span className="ml-1">
                            {isLoading ? 'Processing...' : 'Premium Receipt'}
                          </span>
                        </>
                      )}
                    </Button>
                    <Button 
                      type="secondary" 
                      onClick={() => handleEdit(transaction.id)}
                      className="flex-1 min-w-[120px]"
                    >
                      <Edit size={16} />
                      <span className="ml-1">Edit</span>
                    </Button>
                    <Button 
                      type="danger" 
                      onClick={() => handleDelete(transaction.id)}
                      className="flex-1 min-w-[120px]"
                    >
                      <Trash2 size={16} />
                      <span className="ml-1">Delete</span>
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {currentTransaction && (
        <TransactionModal 
          isOpen={isEditModalOpen} 
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentTransaction(null);
          }}
          transactionId={currentTransaction}
          mode="edit"
        />
      )}
    </>
  );
};

export default TransactionList;