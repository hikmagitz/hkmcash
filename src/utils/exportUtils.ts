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
    'Transaction ID': transaction.id
  }));

  // Prepare categories data for Excel
  const categoriesData = categories.map(category => ({
    'Name': category.name,
    'Type': category.type === 'income' ? 'Income' : 'Expense',
    'Color': category.color
  }));

  // Prepare clients data for Excel
  const clientsData = clients.map(client => ({
    'Name': client.name,
    'Created Date': formatDate(client.createdAt)
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
  // Prepare the data object
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      enterpriseName: enterpriseName || 'HKM Cash',
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
    clients
  };

  // Convert to JSON string with formatting
  const jsonString = JSON.stringify(exportData, null, 2);

  // Create blob and download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const link = document.createElement('a');
  link.href = url;
  
  // Generate filename with enterprise name and date
  const date = new Date().toISOString().split('T')[0];
  link.download = `${enterpriseName || 'HKM-Cash'}-Export-${date}.json`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};