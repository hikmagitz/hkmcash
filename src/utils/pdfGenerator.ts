import { jsPDF } from 'jspdf';
import { Transaction } from '../types';
import { formatDate } from './helpers';

// Format amount without currency symbol and with proper number formatting
const formatAmountForReceipt = (amount: number): string => {
  // If the amount is a whole number, don't show decimals
  if (amount % 1 === 0) {
    return amount.toString();
  }
  // Otherwise, show up to 2 decimal places but remove trailing zeros
  return amount.toFixed(2).replace(/\.?0+$/, '');
};

export const generateTransactionReceipt = (transaction: Transaction, enterpriseName: string) => {
  // Create new document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Use the dynamic enterprise name from the user input as the main title
  // This will always reflect the current value the user has entered
  const receiptTitle = enterpriseName?.trim() || 'HKM Cash';
  const companyName = receiptTitle; // Use the same value for consistency

  // Set fonts
  doc.setFont('helvetica');

  // Colors
  const primaryColor = [41, 128, 185];     // Professional blue
  const textColor = [44, 62, 80];          // Dark blue-gray
  const secondaryColor = [149, 165, 166];  // Light gray
  const accentColor = transaction.type === 'income' ? [39, 174, 96] : [231, 76, 60]; // Green or Red
  const lightBg = [236, 240, 241];         // Very light gray

  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Header with dynamic enterprise name branding
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Main title using the dynamic enterprise name in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(receiptTitle, margin, 30);
  
  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Transaction Receipt', margin, 40);

  // Receipt number and date in header
  doc.setFontSize(10);
  doc.text(`Receipt #: ${transaction.id.substring(0, 8).toUpperCase()}`, pageWidth - margin, 25, { align: 'right' });
  doc.text(`Date: ${formatDate(transaction.date)}`, pageWidth - margin, 35, { align: 'right' });

  // Main content area
  let yPos = 70;

  // Transaction type badge
  const badgeText = transaction.type === 'income' ? 'INCOME' : 'EXPENSE';
  const badgeWidth = doc.getTextWidth(badgeText) + 12;
  doc.setFillColor(...accentColor);
  doc.roundedRect(margin, yPos, badgeWidth, 10, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(badgeText, margin + 6, yPos + 7);

  yPos += 25;

  // Amount section - prominently displayed
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, yPos, contentWidth, 25, 5, 5, 'F');
  
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('AMOUNT', margin + 10, yPos + 10);
  
  // Format amount as requested (like "15000")
  const formattedAmount = formatAmountForReceipt(transaction.amount);
  doc.setFontSize(24);
  doc.setTextColor(...accentColor);
  doc.setFont('helvetica', 'bold');
  doc.text(formattedAmount, margin + 10, yPos + 20);

  yPos += 40;

  // Transaction details in a clean table format (category removed as requested)
  const details = [
    { label: 'Description', value: transaction.description },
    { label: 'Client', value: transaction.client || 'N/A' },
    { label: 'Transaction Date', value: formatDate(transaction.date) },
    { label: 'Transaction ID', value: transaction.id },
  ];

  // Table header
  doc.setFillColor(...primaryColor);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TRANSACTION DETAILS', margin + 5, yPos + 8);

  yPos += 12;

  // Table rows
  details.forEach((detail, index) => {
    const rowHeight = 12;
    
    // Alternating row colors
    if (index % 2 === 0) {
      doc.setFillColor(...lightBg);
      doc.rect(margin, yPos, contentWidth, rowHeight, 'F');
    }

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.text(detail.label + ':', margin + 5, yPos + 8);

    // Value
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    
    // Handle long text by wrapping
    const maxWidth = contentWidth - 70;
    const splitText = doc.splitTextToSize(detail.value, maxWidth);
    doc.text(splitText, margin + 60, yPos + 8);

    yPos += rowHeight;
  });

  // Company information section
  yPos += 20;
  doc.setDrawColor(...secondaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('ISSUED BY', margin, yPos);
  
  yPos += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(receiptTitle, margin, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text('Professional Financial Management', margin, yPos);

  // QR Code placeholder (for future verification)
  const qrSize = 25;
  const qrX = pageWidth - margin - qrSize;
  const qrY = yPos - 20;
  
  doc.setDrawColor(...secondaryColor);
  doc.setLineWidth(1);
  doc.rect(qrX, qrY, qrSize, qrSize);
  
  // QR code content
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text('QR', qrX + qrSize/2, qrY + qrSize/2, { align: 'center' });
  doc.text('Verification', qrX + qrSize/2, qrY + qrSize + 5, { align: 'center' });

  // Footer
  const footerY = pageHeight - 30;
  doc.setDrawColor(...secondaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'normal');
  
  // Footer text with dynamic enterprise name branding
  const footerText = `Generated by ${receiptTitle} on ${new Date().toLocaleString()}`;
  const footerText2 = 'This is an electronically generated receipt. No signature required.';
  const footerText3 = 'For questions regarding this transaction, please contact our support team.';
  
  doc.text(footerText, margin, footerY);
  doc.text(footerText2, margin, footerY + 8);
  doc.text(footerText3, margin, footerY + 16);

  // Watermark with dynamic enterprise name
  doc.setGState(new doc.GState({ opacity: 0.03 }));
  doc.setTextColor(...primaryColor);
  doc.setFontSize(80);
  doc.setFont('helvetica', 'bold');
  doc.text(receiptTitle, pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: 45,
  });
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Save the PDF with dynamic enterprise name in filename
  const fileName = `${receiptTitle}-Receipt-${transaction.id.substring(0, 8)}.pdf`;
  doc.save(fileName);
};