import * as XLSX from 'xlsx';
import { Transaction, Category, Client } from '../types';
import { formatCurrency, formatDate } from './helpers';

export const exportToExcel = (
  transactions: Transaction[],
  categories: Category[],
  clients: Client[],
  enterpriseName: string
) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Prepare transactions data for Excel
  const transactionsData = transactions.map(transaction => ({
    'Date': formatDate(transaction.date),
    'Type': transaction.type === 'income' ? 'Income' : 'Expense',
    'Amount': transaction.amount,
    'Description': transaction.description,
    'Category': transaction.category,
    'Client': transaction.client || 'N/A',
    'ID': transaction.id
  }));

  // Prepare categories data for Excel
  const categoriesData = categories.map(category => ({
    'Name': category.name,
    'Type': category.type === 'income' ? 'Income' : 'Expense',
    'Color': category.color,
    'ID': category.id
  }));

  // Prepare clients data for Excel
  const clientsData = clients.map(client => ({
    'Name': client.name,
    'Created Date': formatDate(client.created_at || new Date().toISOString()),
    'ID': client.id
  }));

  // Create worksheets
  const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
  const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
  const clientsSheet = XLSX.utils.json_to_sheet(clientsData);

  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');
  XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Categories');
  XLSX.utils.book_append_sheet(workbook, clientsSheet, 'Clients');

  // Generate filename with enterprise name and date
  const date = new Date().toISOString().split('T')[0];
  const filename = `${enterpriseName || 'HKM-Cash'}-Export-${date}.xlsx`;

  // Write and download the file
  XLSX.writeFile(workbook, filename);
};

export const exportToJSON = (
  transactions: Transaction[],
  categories: Category[],
  clients: Client[],
  enterpriseName: string
) => {
  // Prepare data for JSON export
  const exportData = {
    exportInfo: {
      enterpriseName: enterpriseName || 'HKM Cash',
      exportDate: new Date().toISOString(),
      version: '1.0',
      totalTransactions: transactions.length,
      totalCategories: categories.length,
      totalClients: clients.length
    },
    transactions: transactions.map(transaction => ({
      ...transaction,
      formattedAmount: formatCurrency(transaction.amount),
      formattedDate: formatDate(transaction.date)
    })),
    categories,
    clients: clients.map(client => ({
      ...client,
      formattedCreatedAt: formatDate(client.created_at || new Date().toISOString())
    }))
  };

  // Create blob and download
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
    type: 'application/json' 
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const date = new Date().toISOString().split('T')[0];
  link.download = `${enterpriseName || 'HKM-Cash'}-Export-${date}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};