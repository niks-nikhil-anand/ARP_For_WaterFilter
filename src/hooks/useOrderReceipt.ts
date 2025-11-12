'use client';

import { useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const useOrderReceipt = () => {
  const receiptRef = useRef<HTMLDivElement>(null);

  // Handle printing
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Order_Receipt`,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });

  // Handle PDF download
  const handleDownloadPDF = useCallback(async (orderId: number) => {
    if (!receiptRef.current) {
      alert('Receipt not found. Please try again.');
      return;
    }

    try {
      const element = receiptRef.current;

      // Wait a bit to ensure content is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      // Convert HTML to canvas with better options
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        ignoreElements: (element) => {
          // Ignore elements that might have problematic styles
          return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
        },
        onclone: (clonedDoc) => {
          // Clean up the cloned document to avoid lab() color issues
          const clonedElement = clonedDoc.querySelector('[data-receipt]');
          if (clonedElement) {
            // Force standard colors
            clonedElement.querySelectorAll('*').forEach((el) => {
              if (el instanceof HTMLElement) {
                const computed = window.getComputedStyle(el);
                // Replace any lab/oklch colors with standard colors
                if (computed.color && (computed.color.includes('lab') || computed.color.includes('oklch'))) {
                  el.style.color = '#000000';
                }
                if (computed.backgroundColor && (computed.backgroundColor.includes('lab') || computed.backgroundColor.includes('oklch'))) {
                  el.style.backgroundColor = '#ffffff';
                }
              }
            });
          }
        },
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      let heightLeft = imgHeight;
      let position = 0;

      // Convert canvas to image data
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      pdf.save(`Order_Receipt_${orderId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  return {
    receiptRef,
    handlePrint,
    handleDownloadPDF,
  };
};
