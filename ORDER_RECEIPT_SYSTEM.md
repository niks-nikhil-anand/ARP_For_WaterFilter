# Order Receipt System Documentation

## Overview

The order receipt system provides a professional, print-ready receipt generation feature with PDF download capabilities. Administrators can view, print, and download order receipts directly from the order management page.

## Features

### ✅ Implemented Features

1. **Professional Receipt Component**
   - Company branding with logo placeholder
   - GST number and business details
   - Order information (ID, date, status)
   - Shop and customer details with icons
   - Product details table with pricing
   - Tax calculation (18% GST)
   - Terms & conditions
   - Footer with support information
   - Auto-generated timestamp

2. **Receipt Actions**
   - 📄 **View Receipt**: Opens receipt in a modal dialog
   - 🖨️ **Print**: Direct print to printer with optimized formatting
   - 📥 **Download PDF**: Generate and download receipt as PDF

3. **Receipt Button in Order Table**
   - Green receipt icon button in the actions column
   - Positioned between View and Edit buttons
   - Tooltip shows "View receipt" on hover

4. **Print Optimization**
   - A4 page size formatting
   - Proper margins for printing
   - Color-accurate printing
   - Clean, professional layout

5. **PDF Generation**
   - High-quality PDF output (2x scale)
   - Proper A4 dimensions
   - Multi-page support for long receipts
   - Named file: `Order_Receipt_{orderId}.pdf`

## File Structure

```
src/
├── components/
│   └── admin/
│       └── orders/
│           └── OrderReceipt.tsx           # Receipt component
├── hooks/
│   └── useOrderReceipt.ts                 # Receipt printing & PDF hook
└── app/
    └── (admin)/
        └── admin/
            └── order_details/
                └── page.tsx               # Updated with receipt feature
```

## Technologies Used

- **react-to-print**: For browser printing functionality
- **jspdf**: For PDF document generation
- **html2canvas**: For converting HTML to images for PDF

## Component Details

### OrderReceipt Component

Located at: [src/components/admin/orders/OrderReceipt.tsx](src/components/admin/orders/OrderReceipt.tsx)

**Props:**
```typescript
interface OrderReceiptProps {
  order: {
    id: number;
    productId: number;
    productName: string;
    shopId: number;
    shopName: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    orderStatus: string;
    createdAt: Date;
    updatedAt: Date;
  };
  productDetails?: {
    company?: string;
    type?: string;
    price?: number;
    warrantyPeriod?: string;
  };
  shopDetails?: {
    address?: string;
    phone?: string;
    email?: string;
  };
}
```

**Features:**
- Forward ref support for printing
- Professional header with company branding
- Organized sections: From/To, Product Details, Pricing
- GST calculation (18%)
- Terms and conditions
- Order timeline
- Auto-generated timestamp

### useOrderReceipt Hook

Located at: [src/hooks/useOrderReceipt.ts](src/hooks/useOrderReceipt.ts)

**Returns:**
```typescript
{
  receiptRef: RefObject<HTMLDivElement>;  // Ref for receipt element
  handlePrint: () => void;                 // Print function
  handleDownloadPDF: (orderId: number) => Promise<void>;  // PDF download
}
```

**Features:**
- Print optimization with custom page styles
- PDF generation with proper dimensions
- Error handling
- Multi-page PDF support

## Usage

### In Order Management Page

```typescript
import OrderReceipt from '@/components/admin/orders/OrderReceipt';
import { useOrderReceipt } from '@/hooks/useOrderReceipt';

const OrderManagementPage = () => {
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { receiptRef, handlePrint, handleDownloadPDF } = useOrderReceipt();

  const handleViewReceipt = (order) => {
    setSelectedOrder(order);
    setReceiptDialogOpen(true);
  };

  return (
    <>
      {/* Receipt button in table */}
      <Button onClick={() => handleViewReceipt(order)}>
        <FileText className="h-4 w-4" />
      </Button>

      {/* Receipt dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent>
          <OrderReceipt
            ref={receiptRef}
            order={selectedOrder}
            productDetails={{...}}
            shopDetails={{...}}
          />
          <DialogFooter>
            <Button onClick={handlePrint}>Print</Button>
            <Button onClick={() => handleDownloadPDF(selectedOrder.id)}>
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
```

## Receipt Layout

### Header Section
- **Left**: Company name, GST number, business type
- **Right**: "ORDER RECEIPT" title, Order ID, Date

### Information Section
- **From (Shop)**: Shop name, address, phone, email
- **To (Customer)**: Customer name, email, phone
- **Status Badge**: Current order status

### Product Details Table
| # | Product Details | Qty | Unit Price | Amount |
|---|----------------|-----|------------|--------|
| Product info with brand, type, warranty | Quantity | Price | Total |

### Pricing Summary
```
Subtotal:        ₹15,999
GST (18%):       ₹2,879
----------------------------
Total Amount:    ₹18,878
```

### Additional Information
- Order timeline (placed, updated)
- Terms & conditions
- Support contact information
- Generation timestamp

## Customization

### Updating Company Details

Edit the header section in [OrderReceipt.tsx](src/components/admin/orders/OrderReceipt.tsx:16-30):

```typescript
<h1 className="text-3xl font-bold text-gray-900 mb-2">
  🏢 Samarth Enterprise
</h1>
<p className="text-sm text-gray-600">WaterFilter Management System</p>
<p className="text-sm text-gray-600 mt-1">
  GST No: 29AABCU9603R1ZX
</p>
```

### Updating Tax Rate

Modify the tax calculation in [OrderReceipt.tsx](src/components/admin/orders/OrderReceipt.tsx:41):

```typescript
const taxRate = 0.18; // Change to your tax rate (e.g., 0.12 for 12%)
```

### Adding Company Logo

Replace the emoji in the header with an image:

```typescript
<img src="/logo.png" alt="Company Logo" className="h-10 w-10" />
```

### Customizing Terms & Conditions

Edit the terms section in [OrderReceipt.tsx](src/components/admin/orders/OrderReceipt.tsx:229-238):

```typescript
<ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
  <li>Your custom term 1</li>
  <li>Your custom term 2</li>
  <li>Your custom term 3</li>
</ul>
```

## Integration with Backend

### Fetching Product Details

When integrating with your backend, fetch product details from the database:

```typescript
const handleViewReceipt = async (order) => {
  // Fetch product details
  const product = await fetch(`/api/products/${order.productId}`).then(r => r.json());

  // Fetch shop details
  const shop = await fetch(`/api/shops/${order.shopId}`).then(r => r.json());

  setSelectedOrder({
    ...order,
    productDetails: {
      company: product.company,
      type: product.type,
      price: product.price,
      warrantyPeriod: product.warrantyPeriod,
    },
    shopDetails: {
      address: shop.address,
      phone: shop.phone,
      email: shop.email,
    },
  });

  setReceiptDialogOpen(true);
};
```

### Storing Receipt Generation

Optionally track receipt generation in the database:

```typescript
const handleDownloadPDF = async (orderId) => {
  await receiptHook.handleDownloadPDF(orderId);

  // Log receipt generation
  await fetch('/api/receipts', {
    method: 'POST',
    body: JSON.stringify({
      orderId,
      action: 'download',
      timestamp: new Date(),
    }),
  });
};
```

## Print Styles

The print function includes custom page styles:

```css
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
```

This ensures:
- A4 paper size
- 10mm margins
- Accurate color printing
- Proper formatting

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Print | ✅ | ✅ | ✅ | ✅ |
| PDF Download | ✅ | ✅ | ✅ | ✅ |
| Color Printing | ✅ | ✅ | ⚠️ | ✅ |

⚠️ Safari may require user to enable background colors in print settings

## Troubleshooting

### PDF Not Downloading

**Issue**: PDF download fails or produces blank PDF

**Solution**:
1. Check if the receipt ref is properly attached
2. Ensure the receipt is visible in the DOM
3. Check browser console for errors
4. Try increasing the timeout in html2canvas options

### Print Quality Issues

**Issue**: Receipt doesn't print correctly

**Solution**:
1. Enable "Background graphics" in print settings
2. Set paper size to A4
3. Check print preview before printing
4. Use "System dialog" for more options

### Missing Product/Shop Details

**Issue**: Receipt shows default/missing information

**Solution**:
1. Pass proper `productDetails` and `shopDetails` props
2. Ensure data is fetched before opening dialog
3. Check for null/undefined values

## Future Enhancements

1. **Email Receipt**
   - Send receipt via email to customer
   - Email template generation
   - Attachment as PDF

2. **Receipt Templates**
   - Multiple receipt designs
   - Customizable branding
   - Template selection in settings

3. **Barcode/QR Code**
   - Add order barcode
   - QR code for order tracking
   - Digital receipt link

4. **Multi-currency Support**
   - Support different currencies
   - Dynamic currency formatting
   - Exchange rate display

5. **Receipt Analytics**
   - Track receipt views/downloads
   - Popular products from receipts
   - Customer receipt preferences

6. **Batch Export**
   - Export multiple receipts at once
   - Bulk PDF generation
   - CSV export of order data

## Testing Checklist

- [x] Receipt button appears in order table
- [x] Clicking receipt button opens dialog
- [x] Receipt displays all order information
- [x] Print button works correctly
- [x] PDF downloads with correct filename
- [x] PDF contains all receipt content
- [x] Receipt is responsive in dialog
- [x] Close button closes dialog
- [x] Multiple receipts can be viewed in succession
- [x] Receipt prints with proper formatting

## Support

For issues or questions about the receipt system:
- Check this documentation
- Review component code and comments
- Test in different browsers
- Contact development team

## License

This receipt system is part of the WaterFilter Management System and follows the same license terms.
