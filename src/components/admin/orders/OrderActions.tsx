'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Eye, FileText, Receipt } from 'lucide-react'
import Link from 'next/link'
import jsPDF from 'jspdf'
import { toast } from 'sonner'

interface OrderActionsProps {
  order: any
}

export function OrderActions({ order }: OrderActionsProps) {
  const generatePDF = (type: 'INVOICE' | 'RECEIPT') => {
    try {
      const doc = new jsPDF()
      const title = type === 'INVOICE' ? 'TAX INVOICE' : 'PAYMENT RECEIPT'
      const themeColor = type === 'INVOICE' ? [41, 128, 185] : [39, 174, 96] // Blue for Invoice, Green for Receipt

      // --- Header Section ---
      // Colored Top Bar
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2])
      doc.rect(0, 0, 210, 40, 'F')

      // Title
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.text(title, 190, 25, { align: 'right' })

      // Company Name & Subtitle
      doc.setFontSize(18)
      doc.text('Samarth Enterprise', 20, 20)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('WaterFilter Management System', 20, 28)

      // --- Company Details (Below Header) ---
      doc.setTextColor(60, 60, 60)
      doc.setFontSize(10)
      doc.text('123, Enterprise Hub, Business District', 20, 55)
      doc.text('Mumbai, Maharashtra - 400001', 20, 60)
      doc.text('Phone: +91 98765 43210', 20, 65)
      doc.text('Email: contact@samarth-enterprise.com', 20, 70)

      // --- Document Details (Right Side) ---
      doc.setFont('helvetica', 'bold')
      doc.text(`${type === 'INVOICE' ? 'Invoice' : 'Receipt'} No:`, 140, 55)
      doc.text('Date:', 140, 60)
      if (type === 'RECEIPT' && order.transactionId) {
        doc.text('Transaction ID:', 140, 65)
      }

      doc.setFont('helvetica', 'normal')
      doc.text(`#${type.substring(0, 3)}-${order.id.toString().padStart(6, '0')}`, 170, 55)
      doc.text(new Date(order.createdAt).toLocaleDateString('en-IN'), 170, 60)
      if (type === 'RECEIPT' && order.transactionId) {
        doc.text(order.transactionId, 170, 65)
      }

      // --- Divider ---
      doc.setDrawColor(200, 200, 200)
      doc.line(20, 80, 190, 80)

      // --- Bill To Section ---
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(themeColor[0], themeColor[1], themeColor[2])
      doc.text('Bill To:', 20, 95)

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(order.customerName, 20, 105)
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(60, 60, 60)
      let yOffset = 112
      if (order.customerEmail) {
        doc.text(order.customerEmail, 20, yOffset)
        yOffset += 6
      }
      if (order.customerPhone) {
        doc.text(order.customerPhone, 20, yOffset)
      }

      // --- Item Table ---
      let yPos = 135
      
      // Table Header
      doc.setFillColor(245, 245, 245)
      doc.rect(20, yPos - 8, 170, 12, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Description', 25, yPos)
      doc.text('Amount', 180, yPos, { align: 'right' })

      // Table Content
      yPos += 15
      doc.setFont('helvetica', 'bold')
      const productName = order.product?.productName || order.product?.name || 'Product'
      doc.text(productName, 25, yPos)
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      const productDesc = `${order.product?.company || ''} ${order.product?.type || ''}`
      doc.text(productDesc, 25, yPos + 6)

      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      const amount = order.amountPaid || 0
      doc.text(`₹${amount.toLocaleString('en-IN')}`, 180, yPos, { align: 'right' })

      // --- Totals Section ---
      yPos += 25
      doc.setDrawColor(220, 220, 220)
      doc.line(20, yPos, 190, yPos)
      
      yPos += 10
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Total Amount', 140, yPos)
      doc.setTextColor(themeColor[0], themeColor[1], themeColor[2])
      doc.text(`₹${amount.toLocaleString('en-IN')}`, 180, yPos, { align: 'right' })

      // --- Footer ---
      const pageHeight = doc.internal.pageSize.height
      
      // Terms & Conditions (Example)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.setFont('helvetica', 'normal')
      doc.text('Terms & Conditions:', 20, pageHeight - 40)
      doc.text('1. This is a computer-generated invoice/receipt and does not require a signature.', 20, pageHeight - 35)
      doc.text('2. Goods once sold will not be taken back.', 20, pageHeight - 31)

      // Thank You Note
      doc.setFontSize(10)
      doc.setTextColor(themeColor[0], themeColor[1], themeColor[2])
      doc.setFont('helvetica', 'bolditalic')
      doc.text('Thank you for choosing Samarth Enterprise!', 105, pageHeight - 15, { align: 'center' })

      // Save
      const fileName = `${type === 'INVOICE' ? 'Invoice' : 'Receipt'}_${order.id}_${new Date().getTime()}.pdf`
      doc.save(fileName)
      toast.success(`${type === 'INVOICE' ? 'Invoice' : 'Receipt'} downloaded successfully`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF')
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => generatePDF('INVOICE')}
        title="Download Invoice"
      >
        <FileText className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => generatePDF('RECEIPT')}
        title="Download Receipt"
      >
        <Receipt className="h-4 w-4" />
      </Button>
      <Link href={`/admin/order_details/${order.id}`}>
        <Button variant="ghost" size="icon" title="View Details">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}
