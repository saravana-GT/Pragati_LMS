import jsPDF from 'jspdf';
import { formatDate, formatMonth } from './dateHelpers';
import { CENTER_NAME, MONTHLY_FEE } from './constants';

export const generateReceiptPDF = (payment, student) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });

  const primaryColor = [37, 99, 235];   // blue
  const darkColor    = [15, 23, 42];
  const mutedColor   = [100, 116, 139];
  const greenColor   = [22, 163, 74];

  // Header background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 148, 35, 'F');

  // Center name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(CENTER_NAME, 74, 14, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Fee Receipt', 74, 22, { align: 'center' });

  // Receipt number badge
  doc.setFillColor(255, 255, 255, 0.2);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`Receipt: ${payment.receiptNumber}`, 74, 30, { align: 'center' });

  // Paid stamp
  doc.setFillColor(...greenColor);
  doc.roundedRect(108, 38, 34, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ PAID', 125, 46, { align: 'center' });

  // Student info section
  const fields = [
    ['Student Name',  student?.name        || payment.studentName],
    ['Phone',         student?.phone       || '—'],
    ['Seat Number',   `#${payment.seatNumber}`],
    ['Shift',         payment.shift?.toUpperCase()],
    ['Month',         formatMonth(payment.month)],
    ['Amount Paid',   `₹ ${payment.amount || MONTHLY_FEE}`],
    ['Payment Date',  formatDate(payment.paidDate)],
  ];

  let y = 55;
  fields.forEach(([label, value]) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedColor);
    doc.text(label, 10, y);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text(String(value || '—'), 60, y);

    // Divider line
    doc.setDrawColor(230, 230, 230);
    doc.line(10, y + 3, 138, y + 3);

    y += 12;
  });

  // Footer
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 172, 148, 18, 'F');
  doc.setFontSize(7);
  doc.setTextColor(...mutedColor);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer-generated receipt. No signature required.', 74, 179, { align: 'center' });
  doc.text(CENTER_NAME + ' © ' + new Date().getFullYear(), 74, 185, { align: 'center' });

  // Save
  const filename = `Receipt_${payment.receiptNumber}_${payment.studentName?.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};
