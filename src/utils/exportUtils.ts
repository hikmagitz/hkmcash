import * as XLSX from 'xlsx';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from './helpers';

export const exportToExcel = (transactions: Transaction[], enterpriseName: string) => {
  // Prepare data for Excel export
  const excelData = transactions.map(transaction => ({
    Date: formatDate(transaction.date),
    Type: transaction.type === 'income' ? 'Income' : 'Expense',
    Category: transaction.category,
    Description: transaction.description,
    Client: transaction.client || 'N/A',
    Amount: transaction.amount,
    'Formatted Amount': formatCurrency(transaction.amount),
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const columnWidths = [
    { wch: 12 }, // Date
    { wch: 10 }, // Type
    { wch: 15 }, // Category
    { wch: 30 }, // Description
    { wch: 20 }, // Client
    { wch: 12 }, // Amount
    { wch: 15 }, // Formatted Amount
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${enterpriseName || 'HKM-Cash'}-Transactions-${timestamp}.xlsx`;

  // Save file
  XLSX.writeFile(workbook, filename);
};

export const exportToJSON = (transactions: Transaction[], enterpriseName: string) => {
  // Prepare data for JSON export
  const exportData = {
    exportInfo: {
      enterpriseName: enterpriseName || 'HKM Cash',
      exportDate: new Date().toISOString(),
      totalTransactions: transactions.length,
      version: '1.0',
    },
    transactions: transactions.map(transaction => ({
      id: transaction.id,
      date: transaction.date,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description,
      client: transaction.client || null,
      amount: transaction.amount,
      formattedAmount: formatCurrency(transaction.amount),
      createdAt: new Date().toISOString(), // Assuming current time as created date
    })),
    summary: {
      totalIncome: transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      balance: transactions.reduce((balance, t) => {
        return t.type === 'income' ? balance + t.amount : balance - t.amount;
      }, 0),
    },
  };

  // Create and download JSON file
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${enterpriseName || 'HKM-Cash'}-Transactions-${timestamp}.json`;
  
  // Create download link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up URL
  URL.revokeObjectURL(url);
};