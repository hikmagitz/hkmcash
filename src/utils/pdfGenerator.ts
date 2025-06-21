import { jsPDF } from 'jspdf';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from './helpers';

export const generateTransactionReceipt = (transaction: Transaction, enterpriseName: string) => {
  // Create new document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set fonts
  doc.setFont('helvetica');

  // Simple color palette
  const darkText = [51, 51, 51];        // Dark gray for text
  const lightText = [107, 114, 128];    // Light gray for secondary text
  const accentColor = transaction.type === 'income' ? [34, 197, 94] : [239, 68, 68]; // Green/Red
  const borderColor = [229, 231, 235];  // Light border

  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Use company name from settings, fallback to HKM Cash
  const companyName = enterpriseName && enterpriseName.trim() ? enterpriseName.trim() : 'HKM Cash';

  // Header - Company Name
  doc.setTextColor(...darkText);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, margin, 30);

  // Receipt title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Transaction Receipt', margin, 45);

  // Horizontal line under header
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(margin, 50, pageWidth - margin, 50);

  // Receipt details section
  let yPos = 70;
  const lineHeight = 12;

  // Receipt number and date
  doc.setTextColor(...lightText);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt #${transaction.id.substring(0, 8).toUpperCase()}`, margin, yPos);
  doc.text(`Date: ${formatDate(transaction.date)}`, pageWidth - margin, yPos, { align: 'right' });

  yPos += 20;

  // Transaction type
  doc.setTextColor(...darkText);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Type:', margin, yPos);
  
  doc.setTextColor(...accentColor);
  doc.setFont('helvetica', 'normal');
  const typeText = transaction.type === 'income' ? 'Income' : 'Expense';
  doc.text(typeText, margin + 25, yPos);

  yPos += lineHeight;

  // Amount - prominently displayed
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount:', margin, yPos);

  // Format amount without unwanted characters
  const formatAmountClean = (amount: number): string => {
    const currency = localStorage.getItem('preferredCurrency') || 'EUR';
    const locale = navigator.language || 'en-US';
    
    const numberFormatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    // Get currency symbol
    const currencyFormatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    });
    const currencySymbol = currencyFormatter.format(0).replace(/[\d\s.,]/g, '');
    
    return `${currencySymbol}${numberFormatter.format(amount)}`;
  };

  doc.setTextColor(...accentColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(formatAmountClean(transaction.amount), margin + 25, yPos);

  yPos += 20;

  // Description
  doc.setTextColor(...darkText);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Description:', margin, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.text(transaction.description, margin + 30, yPos);

  yPos += lineHeight;

  // Category
  doc.setFont('helvetica', 'bold');
  doc.text('Category:', margin, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.text(transaction.category, margin + 30, yPos);

  yPos += lineHeight;

  // Client (if exists)
  if (transaction.client) {
    doc.setFont('helvetica', 'bold');
    doc.text('Client:', margin, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.text(transaction.client, margin + 30, yPos);
    
    yPos += lineHeight;
  }

  yPos += 10;

  // Horizontal line before footer
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 20;

  // Transaction ID
  doc.setTextColor(...lightText);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Transaction ID: ${transaction.id}`, margin, yPos);

  yPos += 10;

  // Generated timestamp
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPos);

  // Footer with company name
  const footerY = doc.internal.pageSize.height - 30;
  
  doc.setTextColor(...lightText);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`© ${new Date().getFullYear()} ${companyName}`, margin, footerY);
  doc.text('This is an electronically generated receipt', pageWidth - margin, footerY, { align: 'right' });

  // Save the PDF with company name in filename
  const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '');
  const fileName = `${sanitizedCompanyName}-Receipt-${transaction.id.substring(0, 8)}.pdf`;
  doc.save(fileName);
};