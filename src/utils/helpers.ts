import { Transaction, TransactionSummary } from '../types';

// Format currency based on user's locale and preferred currency
export const formatCurrency = (amount: number): string => {
  const currency = localStorage.getItem('preferredCurrency') || 'EUR';
  const locale = navigator.language || 'en-US';
  
  // Special handling for currencies with different decimal places
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
  };

  // JPY and KRW don't use decimal places
  if (currency === 'JPY' || currency === 'KRW') {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  }

  return new Intl.NumberFormat(locale, options).format(amount);
};

// Format date based on user's locale
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString(navigator.language || 'en-US', {
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
      client: 'ABC Corp',
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
      client: 'XYZ Ltd',
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

export const SUPPORTED_CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
] as const;