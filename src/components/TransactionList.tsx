import React, { useState } from 'react';
import { Edit, Trash2, ChevronDown, ChevronUp, FileText, Crown } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { useStripe } from '../hooks/useStripe';
import { formatCurrency, formatDate } from '../utils/helpers';
import { generateTransactionReceipt } from '../utils/pdfGenerator';
import Badge from './UI/Badge';
import Button from './UI/Button';
import Card from './UI/Card';
import TransactionModal from './TransactionModal';

interface TransactionListProps {
  limit?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({ limit }) => {
  const { transactions, deleteTransaction, categories } = useTransactions();
  const { isPremium } = useAuth();
  const { redirectToCheckout } = useStripe();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<string | null>(null);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);

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

  const handleDownloadReceipt = (transaction: Transaction) => {
    if (!isPremium) {
      if (window.confirm('PDF receipts are a premium feature. Would you like to upgrade to premium?')) {
        redirectToCheckout('premium_access');
      }
      return;
    }
    generateTransactionReceipt(transaction);
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
                <div className="flex items-center space-x-3">
                  <div 
                    className={`w-2 h-10 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {transaction.description}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge 
                    type={transaction.type === 'income' ? 'income' : 'expense'}
                    color={getCategoryColor(transaction.category)}
                  >
                    {transaction.category}
                  </Badge>
                  <span 
                    className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                  {expandedTransaction === transaction.id ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </div>
              </div>
              
              {expandedTransaction === transaction.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                  <Button 
                    type="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadReceipt(transaction);
                    }}
                  >
                    {isPremium ? (
                      <>
                        <FileText size={16} />
                        Download Receipt
                      </>
                    ) : (
                      <>
                        <Crown size={16} />
                        Premium Receipt
                      </>
                    )}
                  </Button>
                  <Button 
                    type="secondary" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(transaction.id);
                    }}
                  >
                    <Edit size={16} />
                    Edit
                  </Button>
                  <Button 
                    type="danger" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(transaction.id);
                    }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
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