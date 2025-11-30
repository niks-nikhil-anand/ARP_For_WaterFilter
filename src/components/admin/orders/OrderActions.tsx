'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Eye, FileText, Receipt, Check } from 'lucide-react'
import Link from 'next/link'
import jsPDF from 'jspdf'
import { toast } from 'sonner'
import { ConfirmOrderModal } from './ConfirmOrderModal'

interface OrderActionsProps {
  order: any
}

export function OrderActions({ order }: OrderActionsProps) {
  const generateInvoice = () => {
    try {
      const doc = new jsPDF()
      const themeColor = [41, 128, 185] // Blue for Invoice
      const secondaryColor = [100, 100, 100]

      // Helper to format currency
      const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString('en-IN')}`

      // --- Background Watermark ---
      doc.setTextColor(245, 245, 245)
      doc.setFontSize(60)
      doc.setFont('helvetica', 'bold')
      doc.text('SAMARTH', 105, 150, { align: 'center', angle: 45 })

      // --- Header Section ---
      // Top Bar
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2])
      doc.rect(0, 0, 210, 6, 'F')

      // Logo Placeholder (Left)
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2])
      doc.roundedRect(15, 15, 20, 20, 2, 2, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('SE', 25, 28, { align: 'center' })

      // Company Name (Left)
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Samarth Enterprise', 40, 22)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
      doc.text('WaterFilter Management System', 40, 28)
      doc.text('GSTIN: 27ABCDE1234F1Z5', 40, 33) // Mock GSTIN

      // Invoice Title (Right)
      doc.setTextColor(themeColor[0], themeColor[1], themeColor[2])
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('INVOICE', 195, 25, { align: 'right' })

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      doc.text(`# INV-${order.id.toString().padStart(6, '0')}`, 195, 33, { align: 'right' })

      // --- Info Grid ---
      const gridY = 45

      // Left Column: Company Address
      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text('From:', 15, gridY)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60, 60, 60)
      doc.text('123, Enterprise Hub, Business District', 15, gridY + 5)
      doc.text('Mumbai, Maharashtra - 400001', 15, gridY + 10)
      doc.text('Phone: +91 98765 43210', 15, gridY + 15)
      doc.text('Email: contact@samarth-enterprise.com', 15, gridY + 20)

      // Right Column: Bill To
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text('Bill To:', 110, gridY)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60, 60, 60)
      doc.text(order.customerName, 110, gridY + 5)
      if (order.customerEmail) doc.text(order.customerEmail, 110, gridY + 10)
      if (order.customerPhone) doc.text(order.customerPhone, 110, gridY + 15)
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 110, gridY + 25)

      // --- Payment Details Bar ---
      const payY = 80
      doc.setFillColor(245, 245, 245)
      doc.roundedRect(15, payY, 180, 15, 2, 2, 'F')

      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)

      // Status
      doc.setFont('helvetica', 'bold')
      doc.text('Status:', 25, payY + 9)
      doc.setFont('helvetica', 'normal')
      const statusColor = order.paymentStatus === 'COMPLETED' ? [39, 174, 96] : [192, 57, 43]
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2])
      doc.text(order.paymentStatus, 40, payY + 9)

      // Method
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text('Payment Method:', 80, payY + 9)
      doc.setFont('helvetica', 'normal')
      doc.text(order.paymentMethod, 110, payY + 9)

      // Transaction ID
      if (order.transactionId) {
        doc.setFont('helvetica', 'bold')
        doc.text('Transaction ID:', 140, payY + 9)
        doc.setFont('helvetica', 'normal')
        doc.text(order.transactionId, 165, payY + 9)
      }

      // --- Item Table ---
      let yPos = 110

      // Headers
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2])
      doc.rect(15, yPos, 180, 10, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text('#', 20, yPos + 6)
      doc.text('Item Description', 35, yPos + 6)
      doc.text('Qty', 130, yPos + 6, { align: 'center' })
      doc.text('Price', 155, yPos + 6, { align: 'right' })
      doc.text('Total', 190, yPos + 6, { align: 'right' })

      // Row 1
      yPos += 10
      doc.setFillColor(250, 250, 250) // Zebra stripe
      doc.rect(15, yPos, 180, 15, 'F') // Taller row for description

      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      doc.text('1', 20, yPos + 6)

      // Product Name & Desc
      const productName = order.product?.productName || order.product?.name || 'Product'
      const productDesc = `${order.product?.company || ''} ${order.product?.type || ''} - ${order.product?.color || ''}`

      doc.setFont('helvetica', 'bold')
      doc.text(productName, 35, yPos + 6)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(80, 80, 80)
      doc.text(productDesc, 35, yPos + 11)

      // Numbers
      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)
      const amount = order.amountPaid || 0
      doc.text('1', 130, yPos + 8, { align: 'center' })
      doc.text(formatCurrency(amount), 155, yPos + 8, { align: 'right' })
      doc.text(formatCurrency(amount), 190, yPos + 8, { align: 'right' })

      // Bottom Line
      yPos += 15
      doc.setDrawColor(220, 220, 220)
      doc.line(15, yPos, 195, yPos)

      // --- Totals ---
      yPos += 5
      const totalX = 140
      const valX = 190

      doc.setFontSize(9)
      doc.text('Subtotal:', totalX, yPos + 5)
      doc.text(formatCurrency(amount), valX, yPos + 5, { align: 'right' })

      doc.text('Tax (0%):', totalX, yPos + 10)
      doc.text(formatCurrency(0), valX, yPos + 10, { align: 'right' })

      yPos += 15
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2])
      doc.rect(totalX - 5, yPos, 60, 10, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('Grand Total:', totalX, yPos + 6)
      doc.text(formatCurrency(amount), valX, yPos + 6, { align: 'right' })

      // --- Footer Section ---
      const pageHeight = doc.internal.pageSize.height

      // Terms
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('Terms & Conditions:', 15, pageHeight - 50)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      doc.text('1. Goods once sold will not be taken back.', 15, pageHeight - 45)
      doc.text('2. Subject to Mumbai Jurisdiction.', 15, pageHeight - 41)
      doc.text('3. This is a computer generated invoice.', 15, pageHeight - 37)

      // Authorized Signatory
      doc.setTextColor(0, 0, 0)
      doc.text('For Samarth Enterprise', 150, pageHeight - 50)
      doc.setDrawColor(0, 0, 0)
      doc.line(150, pageHeight - 35, 190, pageHeight - 35)
      doc.text('Authorized Signatory', 150, pageHeight - 30)

      // Bottom Bar
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2])
      doc.rect(0, pageHeight - 10, 210, 10, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.text('Thank you for your business!', 105, pageHeight - 4, { align: 'center' })

      // Save
      const fileName = `Invoice_${order.id}_${new Date().getTime()}.pdf`
      doc.save(fileName)
      toast.success('Invoice downloaded successfully')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF')
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {order.paymentStatus === 'PENDING' && (
        <ConfirmOrderModal
          order={order}
          trigger={
            <Button
              variant="outline"
              size="sm"
              title="Confirm Order"
              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
            >
              <Check className="h-4 w-4 mr-2" />
              Confirm
            </Button>
          }
        />
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={generateInvoice}
        title="Download Invoice"
      >
        <FileText className="h-4 w-4" />
      </Button>
      <Link href={`/admin/order_details/${order.id}`}>
        <Button variant="ghost" size="icon" title="View Details">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}
