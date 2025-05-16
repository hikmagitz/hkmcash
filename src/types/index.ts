export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  client?: string; // Optional client field
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface UserSettings {
  enterpriseName: string;
}