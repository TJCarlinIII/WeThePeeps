// src/lib/foia/formatters.ts
import { jsPDF } from 'jspdf';

export interface PDFOptions {
  agencyName: string;
  userName: string;
}

export function generatePDF(content: string, options: PDFOptions): void {
  const doc = new jsPDF();
  
  // Professional legal formatting
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  
  // Wrap text to fit margins
  const splitText = doc.splitTextToSize(content, 170);
  doc.text(splitText, 20, 25);
  
  // Add header + page numbers to every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Header: Agency + generation date
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`FOIA Request: ${options.agencyName}`, 20, 15);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 180, 15, { align: 'right' });
    
    // Footer: Page number + source
    doc.text(`Page ${i} of ${pageCount}`, 180, 290, { align: 'right' });
    if (i === pageCount) {
      doc.text('Generated via WeThePeeps.net', 20, 290);
    }
  }
  
  // Save with organized filename
  const safeAgency = options.agencyName.replace(/\s+/g, '_');
  const dateSuffix = new Date().toISOString().split('T')[0];
  doc.save(`FOIA_Request_${safeAgency}_${dateSuffix}.pdf`);
}

export function generateDOCX(content: string, agencyName: string): void {
  const element = document.createElement("a");
  const file = new Blob([content], { type: 'application/msword' });
  element.href = URL.createObjectURL(file);
  
  const safeAgency = agencyName.replace(/\s+/g, '_');
  element.download = `FOIA_Request_${safeAgency}.doc`;
  
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
}