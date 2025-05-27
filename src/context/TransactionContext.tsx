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
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  hasReachedLimit: boolean;
  isLoading: boolean;
  enterpriseName: string;
  setEnterpriseName: (name: string) => Promise<void>;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [enterpriseName, setEnterpriseNameState] = useState('');

  const [summary, setSummary] = useState<TransactionSummary>(() => 
    calculateSummary(transactions)
  );

  const FREE_TRANSACTION_LIMIT = 50;
  const hasReachedLimit = !isPremium && transactions.length >= FREE_TRANSACTION_LIMIT;

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Load transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (transactionsError) throw transactionsError;
        setTransactions(transactionsData || []);

        // Load categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id);

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData?.length ? categoriesData : getDefaultCategories());

        // Load clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id);

        if (clientsError) throw clientsError;
        setClients(clientsData || []);

        // Load enterprise settings - Using maybeSingle() instead of single()
        const { data: settingsData, error: settingsError } = await supabase
          .from('enterprise_settings')
          .select('name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (settingsError) throw settingsError;
        setEnterpriseNameState(settingsData?.name || '');

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Update summary when transactions change
  useEffect(() => {
    setSummary(calculateSummary(transactions));
  }, [transactions]);

  const setEnterpriseName = async (name: string) => {
    if (!user) return;

    try {
      // Use upsert with maybeSingle to handle the case where the record might not exist
      const { error } = await supabase
        .from('enterprise_settings')
        .upsert({ user_id: user.id, name })
        .eq('user_id', user.id);

      if (error) throw error;
      setEnterpriseNameState(name);
    } catch (error) {
      console.error('Error updating enterprise name:', error);
      throw error;
    }
  };

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

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...category, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      setCategories(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) throw new Error('User must be authenticated');
    
    // Validate UUID format before making the request
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid category ID format');
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const addClient = async (client: Omit<Client, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...client, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      setClients(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setClients(prev => prev.filter(client => client.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
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
        isLoading,
        enterpriseName,
        setEnterpriseName
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};