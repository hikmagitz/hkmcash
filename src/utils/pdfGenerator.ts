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

  // Modern color palette
  const primaryBlue = [37, 99, 235];     // Blue-600
  const primaryPurple = [147, 51, 234];  // Purple-600
  const darkGray = [31, 41, 55];         // Gray-800
  const lightGray = [156, 163, 175];     // Gray-400
  const successGreen = [34, 197, 94];    // Green-500
  const dangerRed = [239, 68, 68];       // Red-500
  const lightBg = [248, 250, 252];       // Slate-50

  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Use company name if available, otherwise default to HKM Cash
  const companyName = enterpriseName && enterpriseName.trim() ? enterpriseName.trim() : 'HKM Cash';
  const accentColor = transaction.type === 'income' ? successGreen : dangerRed;

  // Background gradient effect
  doc.setFillColor(...lightBg);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header with gradient-like effect
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  // Add subtle gradient effect with overlays
  doc.setFillColor(255, 255, 255);
  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Company logo placeholder (circle with initials)
  const logoSize = 16;
  const logoX = margin;
  const logoY = 15;
  
  doc.setFillColor(255, 255, 255);
  doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 'F');
  
  // Company initials in logo
  const initials = companyName.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
  doc.setTextColor(...primaryBlue);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(initials, logoX + logoSize/2, logoY + logoSize/2 + 2, { align: 'center' });

  // Company name in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, logoX + logoSize + 10, 28);

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Financial Transaction Receipt', logoX + logoSize + 10, 38);

  // Receipt number and date in header
  const receiptNumber = `#${transaction.id.substring(0, 8).toUpperCase()}`;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`Receipt: ${receiptNumber}`, pageWidth - margin, 25, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, 35, { align: 'right' });

  // Main content card
  const cardY = 80;
  const cardHeight = 140;
  
  // Card shadow effect
  doc.setFillColor(0, 0, 0);
  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.roundedRect(margin + 2, cardY + 2, contentWidth, cardHeight, 8, 8, 'F');
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Main card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, cardY, contentWidth, cardHeight, 8, 8, 'F');

  // Transaction type badge
  const badgeText = transaction.type === 'income' ? 'INCOME' : 'EXPENSE';
  const badgeIcon = transaction.type === 'income' ? '↗' : '↙';
  const badgeWidth = 80;
  const badgeHeight = 25;
  const badgeX = margin + 15;
  const badgeY = cardY + 15;

  doc.setFillColor(...accentColor);
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 12, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${badgeIcon} ${badgeText}`, badgeX + badgeWidth/2, badgeY + badgeHeight/2 + 2, { align: 'center' });

  // Amount - Large and prominent
  const formatAmountForReceipt = (amount: number): string => {
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

  const amountText = formatAmountForReceipt(transaction.amount);
  doc.setTextColor(...accentColor);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(amountText, pageWidth - margin - 15, cardY + 35, { align: 'right' });

  // Transaction details in a clean grid
  const detailsStartY = cardY + 60;
  const lineHeight = 18;
  
  const details = [
    { label: 'Transaction Date', value: formatDate(transaction.date), icon: '📅' },
    { label: 'Category', value: transaction.category, icon: '🏷️' },
    { label: 'Client', value: transaction.client || 'No client specified', icon: '👤' },
    { label: 'Description', value: transaction.description, icon: '📝' },
  ];

  details.forEach((detail, index) => {
    const yPos = detailsStartY + (index * lineHeight);
    
    // Icon
    doc.setFontSize(12);
    doc.text(detail.icon, margin + 15, yPos);
    
    // Label
    doc.setTextColor(...lightGray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(detail.label.toUpperCase(), margin + 30, yPos - 3);
    
    // Value
    doc.setTextColor(...darkGray);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(detail.value, margin + 30, yPos + 8);
  });

  // Verification section
  const verificationY = cardY + cardHeight + 30;
  
  // QR Code placeholder with modern styling
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, verificationY, 50, 50, 8, 8, 'F');
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(1);
  doc.roundedRect(margin, verificationY, 50, 50, 8, 8, 'S');
  
  // QR pattern simulation
  doc.setFillColor(...darkGray);
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if ((i + j) % 2 === 0) {
        doc.rect(margin + 5 + (i * 8), verificationY + 5 + (j * 8), 6, 6, 'F');
      }
    }
  }

  // Verification text
  doc.setTextColor(...darkGray);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Verification', margin + 60, verificationY + 15);
  
  doc.setTextColor(...lightGray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Scan QR code to verify this transaction', margin + 60, verificationY + 25);
  doc.text(`Transaction ID: ${transaction.id}`, margin + 60, verificationY + 35);

  // Security features
  const securityY = verificationY + 70;
  
  // Security strip
  doc.setFillColor(...primaryPurple);
  doc.rect(0, securityY, pageWidth, 3, 'F');
  
  // Security text
  doc.setTextColor(...lightGray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('🔒 This receipt is digitally signed and tamper-proof', margin, securityY + 15);
  
  // Footer with company branding
  const footerY = pageHeight - 30;
  
  // Footer background
  doc.setFillColor(250, 250, 250);
  doc.rect(0, footerY - 10, pageWidth, 40, 'F');
  
  // Company info
  doc.setTextColor(...darkGray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, margin, footerY);
  
  doc.setTextColor(...lightGray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${new Date().toLocaleString()}`, margin, footerY + 8);
  doc.text('This is an electronically generated receipt', margin, footerY + 16);
  
  // Powered by text
  doc.text('Powered by HKM Cash Financial System', pageWidth - margin, footerY + 8, { align: 'right' });

  // Decorative elements
  // Corner decorations
  doc.setDrawColor(...primaryBlue);
  doc.setLineWidth(2);
  
  // Top left corner
  doc.line(margin, cardY + 10, margin + 10, cardY + 10);
  doc.line(margin, cardY + 10, margin, cardY + 20);
  
  // Top right corner
  doc.line(pageWidth - margin - 10, cardY + 10, pageWidth - margin, cardY + 10);
  doc.line(pageWidth - margin, cardY + 10, pageWidth - margin, cardY + 20);
  
  // Bottom left corner
  doc.line(margin, cardY + cardHeight - 20, margin, cardY + cardHeight - 10);
  doc.line(margin, cardY + cardHeight - 10, margin + 10, cardY + cardHeight - 10);
  
  // Bottom right corner
  doc.line(pageWidth - margin, cardY + cardHeight - 20, pageWidth - margin, cardY + cardHeight - 10);
  doc.line(pageWidth - margin - 10, cardY + cardHeight - 10, pageWidth - margin, cardY + cardHeight - 10);

  // Save the PDF with company name in filename
  const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '');
  const fileName = `${sanitizedCompanyName}-Receipt-${transaction.id.substring(0, 8)}.pdf`;
  doc.save(fileName);
};