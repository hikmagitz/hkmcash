import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Transaction, 
  Category, 
  TransactionSummary 
} from '../types';
import { 
  calculateSummary, 
  generateId, 
  getSampleTransactions,
  getDefaultCategories
} from '../utils/helpers';
import { useAuth } from './AuthContext';

interface TransactionContextType {
  transactions: Transaction[];
  categories: Category[];
  summary: TransactionSummary;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (transaction: Transaction) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  hasReachedLimit: boolean;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

const FREE_TRANSACTION_LIMIT = 50;

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isPremium } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : getSampleTransactions();
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const savedCategories = localStorage.getItem('categories');
    return savedCategories ? JSON.parse(savedCategories) : getDefaultCategories();
  });

  const [summary, setSummary] = useState<TransactionSummary>(() => 
    calculateSummary(transactions)
  );

  const hasReachedLimit = !isPremium && transactions.length >= FREE_TRANSACTION_LIMIT;

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('categories', JSON.stringify(categories));
    setSummary(calculateSummary(transactions));
  }, [transactions, categories]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    if (!isPremium && transactions.length >= FREE_TRANSACTION_LIMIT) {
      throw new Error('Transaction limit reached. Upgrade to premium for unlimited transactions.');
    }
    const newTransaction = { ...transaction, id: generateId() };
    setTransactions([newTransaction, ...transactions]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(transaction => transaction.id !== id));
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(
      transactions.map(transaction => 
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
      )
    );
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: generateId() };
    setCategories([...categories, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(category => category.id !== id));
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        categories,
        summary,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        addCategory,
        deleteCategory,
        hasReachedLimit
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};