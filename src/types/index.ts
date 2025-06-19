export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  client?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface Client {
  id: string;
  name: string;
  createdAt: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface UserSettings {
  enterpriseName: string;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  color: string;
}

export interface InventorySummary {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  categories: number;
}