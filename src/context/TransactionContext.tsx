import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enterpriseName, setEnterpriseNameState] = useState('HKM Cash Demo');

  const [summary, setSummary] = useState<TransactionSummary>(() => 
    calculateSummary(transactions)
  );

  const hasReachedLimit = false; // No limits in demo mode

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        // Load transactions
        const savedTransactions = localStorage.getItem('demo_transactions');
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions));
        } else {
          // Add some demo transactions
          const demoTransactions: Transaction[] = [
            {
              id: generateId(),
              amount: 3500,
              description: 'Monthly Salary',
              category: 'Salary',
              type: 'income',
              date: new Date().toISOString().slice(0, 10),
              client: 'ABC Company'
            },
            {
              id: generateId(),
              amount: 1200,
              description: 'Rent Payment',
              category: 'Housing',
              type: 'expense',
              date: new Date().toISOString().slice(0, 10)
            },
            {
              id: generateId(),
              amount: 250,
              description: 'Groceries',
              category: 'Food',
              type: 'expense',
              date: new Date(Date.now() - 86400000).toISOString().slice(0, 10)
            },
            {
              id: generateId(),
              amount: 800,
              description: 'Freelance Project',
              category: 'Freelance',
              type: 'income',
              date: new Date(Date.now() - 172800000).toISOString().slice(0, 10),
              client: 'XYZ Corp'
            }
          ];
          setTransactions(demoTransactions);
          localStorage.setItem('demo_transactions', JSON.stringify(demoTransactions));
        }

        // Load categories
        const savedCategories = localStorage.getItem('demo_categories');
        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        } else {
          const defaultCategories = getDefaultCategories();
          setCategories(defaultCategories);
          localStorage.setItem('demo_categories', JSON.stringify(defaultCategories));
        }

        // Load clients
        const savedClients = localStorage.getItem('demo_clients');
        if (savedClients) {
          setClients(JSON.parse(savedClients));
        } else {
          const demoClients: Client[] = [
            { id: generateId(), name: 'ABC Company', createdAt: new Date().toISOString() },
            { id: generateId(), name: 'XYZ Corp', createdAt: new Date().toISOString() },
            { id: generateId(), name: 'Tech Solutions Ltd', createdAt: new Date().toISOString() }
          ];
          setClients(demoClients);
          localStorage.setItem('demo_clients', JSON.stringify(demoClients));
        }

        // Load enterprise name
        const savedEnterpriseName = localStorage.getItem('demo_enterpriseName');
        if (savedEnterpriseName) {
          setEnterpriseNameState(savedEnterpriseName);
        }

      } catch (error) {
        console.error('Error loading demo data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update summary when transactions change
  useEffect(() => {
    setSummary(calculateSummary(transactions));
  }, [transactions]);

  const setEnterpriseName = async (name: string) => {
    try {
      setEnterpriseNameState(name);
      localStorage.setItem('demo_enterpriseName', name);
    } catch (error) {
      console.error('Error updating enterprise name:', error);
      throw error;
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const newTransaction: Transaction = {
        ...transaction,
        id: generateId()
      };
      
      const updatedTransactions = [newTransaction, ...transactions];
      setTransactions(updatedTransactions);
      localStorage.setItem('demo_transactions', JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const updatedTransactions = transactions.filter(transaction => transaction.id !== id);
      setTransactions(updatedTransactions);
      localStorage.setItem('demo_transactions', JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (updatedTransaction: Transaction) => {
    try {
      const updatedTransactions = transactions.map(transaction =>
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
      );
      setTransactions(updatedTransactions);
      localStorage.setItem('demo_transactions', JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const newCategory: Category = {
        ...category,
        id: generateId()
      };
      
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      localStorage.setItem('demo_categories', JSON.stringify(updatedCategories));
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const updatedCategories = categories.filter(category => category.id !== id);
      setCategories(updatedCategories);
      localStorage.setItem('demo_categories', JSON.stringify(updatedCategories));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const addClient = async (client: Omit<Client, 'id' | 'createdAt'>) => {
    try {
      const newClient: Client = {
        ...client,
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      
      const updatedClients = [...clients, newClient];
      setClients(updatedClients);
      localStorage.setItem('demo_clients', JSON.stringify(updatedClients));
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const updatedClients = clients.filter(client => client.id !== id);
      setClients(updatedClients);
      localStorage.setItem('demo_clients', JSON.stringify(updatedClients));
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