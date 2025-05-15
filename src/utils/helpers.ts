import { Transaction, TransactionSummary } from '../types';

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Calculate transaction summary
export const calculateSummary = (transactions: Transaction[]): TransactionSummary => {
  const summary = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === 'income') {
        acc.totalIncome += transaction.amount;
      } else {
        acc.totalExpense += transaction.amount;
      }
      return acc;
    },
    { totalIncome: 0, totalExpense: 0, balance: 0 }
  );
  
  summary.balance = summary.totalIncome - summary.totalExpense;
  return summary;
};

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Get sample transactions for initial state
export const getSampleTransactions = (): Transaction[] => {
  return [
    {
      id: generateId(),
      amount: 2500,
      description: 'Monthly Salary',
      category: 'Salary',
      type: 'income',
      date: '2025-04-01',
    },
    {
      id: generateId(),
      amount: 800,
      description: 'Rent Payment',
      category: 'Housing',
      type: 'expense',
      date: '2025-04-03',
    },
    {
      id: generateId(),
      amount: 120,
      description: 'Grocery Shopping',
      category: 'Food',
      type: 'expense',
      date: '2025-04-05',
    },
    {
      id: generateId(),
      amount: 200,
      description: 'Freelance Work',
      category: 'Freelance',
      type: 'income',
      date: '2025-04-10',
    },
    {
      id: generateId(),
      amount: 50,
      description: 'Book Purchase',
      category: 'Entertainment',
      type: 'expense',
      date: '2025-04-15',
    },
  ];
};

// Get default categories
export const getDefaultCategories = () => {
  return [
    { id: generateId(), name: 'Salary', type: 'income', color: '#10B981' },
    { id: generateId(), name: 'Freelance', type: 'income', color: '#3B82F6' },
    { id: generateId(), name: 'Investments', type: 'income', color: '#8B5CF6' },
    { id: generateId(), name: 'Other Income', type: 'income', color: '#EC4899' },
    { id: generateId(), name: 'Food', type: 'expense', color: '#F59E0B' },
    { id: generateId(), name: 'Housing', type: 'expense', color: '#EF4444' },
    { id: generateId(), name: 'Transport', type: 'expense', color: '#6366F1' },
    { id: generateId(), name: 'Entertainment', type: 'expense', color: '#8B5CF6' },
    { id: generateId(), name: 'Utilities', type: 'expense', color: '#14B8A6' },
    { id: generateId(), name: 'Healthcare', type: 'expense', color: '#F97316' },
    { id: generateId(), name: 'Other Expense', type: 'expense', color: '#6B7280' },
  ];
};

// Filter transactions by date range
export const filterTransactionsByDate = (
  transactions: Transaction[],
  startDate: string,
  endDate: string
): Transaction[] => {
  return transactions.filter((transaction) => {
    return transaction.date >= startDate && transaction.date <= endDate;
  });
};

// Calculate category totals for charts
export const calculateCategoryTotals = (transactions: Transaction[]) => {
  const categoryTotals: Record<string, number> = {};
  
  transactions.forEach((transaction) => {
    if (transaction.category in categoryTotals) {
      categoryTotals[transaction.category] += transaction.amount;
    } else {
      categoryTotals[transaction.category] = transaction.amount;
    }
  });
  
  return Object.entries(categoryTotals).map(([category, total]) => ({
    category,
    total,
  })).sort((a, b) => b.total - a.total);
};