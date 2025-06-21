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

  // Use company name from settings, fallback to default
  const companyName = enterpriseName && enterpriseName.trim() ? enterpriseName.trim() : 'Nom d\'entreprise';

  // Set fonts and colors
  doc.setFont('helvetica');
  const primaryColor = [0, 128, 128];  // Teal
  const textColor = [51, 51, 51];      // Dark gray

  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Header with company name
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, margin, 25);

  // Receipt title
  doc.setTextColor(...textColor);
  doc.setFontSize(28);
  doc.text('Reçu de Transaction', margin, 60);

  // Amount section - prominently displayed
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Montant:', margin, 90);

  // Format amount without "/" - just the number with currency
  const amountText = `${transaction.amount.toFixed(2)} €`;
  doc.setFontSize(32);
  doc.setTextColor(0, 128, 0); // Green color for amount
  doc.text(amountText, margin, 110);

  // Transaction details
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const details = [
    { label: 'Date', value: formatDate(transaction.date) },
    { label: 'Catégorie', value: transaction.category },
    { label: 'Client', value: transaction.client || 'N/A' },
    { label: 'Description', value: transaction.description },
    { label: 'Type', value: transaction.type === 'income' ? 'Revenus' : 'Dépenses' },
    { label: 'ID Transaction', value: transaction.id.substring(0, 8) },
  ];

  let yPos = 140;
  details.forEach(({ label, value }, index) => {
    // Draw alternating background
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 12, 'F');
    }

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text(label + ':', margin, yPos);

    // Value
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 50, yPos);

    yPos += 15;
  });

  // Footer
  const footerY = 280;
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  
  const footerText = `Généré par ${companyName} le ${new Date().toLocaleString('fr-FR')}`;
  doc.text(footerText, margin, footerY);

  // Save the PDF with company name in filename
  const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '');
  const fileName = `${sanitizedCompanyName}-Recu-${transaction.id.substring(0, 8)}.pdf`;
  doc.save(fileName);
};