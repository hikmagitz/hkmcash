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

  // Use company name from settings, fallback to HKM Cash
  const companyName = enterpriseName && enterpriseName.trim() ? enterpriseName.trim() : 'HKM Cash';

  // Save the blank PDF with company name in filename
  const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '');
  const fileName = `${sanitizedCompanyName}-Receipt-${transaction.id.substring(0, 8)}.pdf`;
  doc.save(fileName);
};