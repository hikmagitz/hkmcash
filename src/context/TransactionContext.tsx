import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Transaction, 
  Category,
  Client,
  TransactionSummary 
} from '../types';
import { 
  calculateSummary, 
  generateId, 
  getDefaultCategories
} from '../utils/helpers';
import { useAuth } from './AuthContext';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface TransactionContextType {
  transactions: Transaction[];
  categories: Category[];
  clients: Client[];
  summary: TransactionSummary;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  deleteClient: (id: string) => void;
  hasReachedLimit: boolean;
  isLoading: boolean;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isPremium } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>(() => {
    const savedClients = localStorage.getItem('clients');
    return savedClients ? JSON.parse(savedClients) : [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const savedCategories = localStorage.getItem('categories');
    return savedCategories ? JSON.parse(savedCategories) : getDefaultCategories();
  });

  const [summary, setSummary] = useState<TransactionSummary>(() => 
    calculateSummary(transactions)
  );

  const FREE_TRANSACTION_LIMIT = 50;
  const hasReachedLimit = !isPremium && transactions.length >= FREE_TRANSACTION_LIMIT;

  // Load transactions from Supabase
  useEffect(() => {
    const loadTransactions = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) {
          throw error;
        }

        setTransactions(data || []);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [user]);

  // Update summary when transactions change
  useEffect(() => {
    setSummary(calculateSummary(transactions));
  }, [transactions]);

  // Save categories to localStorage
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  // Save clients to localStorage
  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) throw new Error('User must be authenticated');
    if (!isPremium && transactions.length >= FREE_TRANSACTION_LIMIT) {
      throw new Error('Transaction limit reached. Upgrade to premium for unlimited transactions.');
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      setTransactions(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (updatedTransaction: Transaction) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: updatedTransaction.amount,
          description: updatedTransaction.description,
          category: updatedTransaction.category,
          type: updatedTransaction.type,
          date: updatedTransaction.date,
          client: updatedTransaction.client,
        })
        .eq('id', updatedTransaction.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === updatedTransaction.id ? updatedTransaction : transaction
        )
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: generateId() };
    setCategories([...categories, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(category => category.id !== id));
  };

  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient = { 
      ...client, 
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setClients([...clients, newClient]);
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(client => client.id !== id));
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        categories,
        clients,
        summary,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        addCategory,
        deleteCategory,
        addClient,
        deleteClient,
        hasReachedLimit,
        isLoading
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};