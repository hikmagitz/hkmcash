import * as XLSX from 'xlsx';
import { Transaction, Category, Client } from '../types';
import { formatCurrency, formatDate } from './helpers';

export const exportToExcel = (transactions: Transaction[], enterpriseName: string) => {
  // Prepare data for Excel
  const excelData = transactions.map(transaction => ({
    Date: formatDate(transaction.date),
    Type: transaction.type === 'income' ? 'Income' : 'Expense',
    Amount: transaction.amount,
    'Amount (Formatted)': formatCurrency(transaction.amount),
    Description: transaction.description,
    Category: transaction.category,
    Client: transaction.client || 'N/A',
    'Transaction ID': transaction.id,
  }));

  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Add transactions sheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths
  const colWidths = [
    { wch: 12 }, // Date
    { wch: 10 }, // Type
    { wch: 12 }, // Amount
    { wch: 15 }, // Amount (Formatted)
    { wch: 30 }, // Description
    { wch: 15 }, // Category
    { wch: 20 }, // Client
    { wch: 25 }, // Transaction ID
  ];
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
  
  // Generate filename
  const filename = `${enterpriseName || 'HKM-Cash'}-Transactions-${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Save file
  XLSX.writeFile(wb, filename);
};

export const exportToJSON = (
  transactions: Transaction[], 
  categories: Category[], 
  clients: Client[], 
  enterpriseName: string
) => {
  const data = {
    exportInfo: {
      exportDate: new Date().toISOString(),
      enterpriseName: enterpriseName || 'HKM Cash',
      version: '1.0',
      totalTransactions: transactions.length,
      totalCategories: categories.length,
      totalClients: clients.length,
    },
    transactions,
    categories,
    clients,
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${enterpriseName || 'HKM-Cash'}-Complete-Export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};