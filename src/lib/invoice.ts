// Invoice number generation utilities

/**
 * Generate invoice number based on order details
 * Format: SE-YYYYMM-XXXX
 * Example: SE-202410-0001
 *
 * SE = Samarth Enterprise
 * YYYYMM = Year and Month
 * XXXX = Sequential number (4 digits)
 */
export const generateInvoiceNumber = (orderId: number, createdAt: Date): string => {
  const year = createdAt.getFullYear();
  const month = String(createdAt.getMonth() + 1).padStart(2, '0');
  const sequenceNumber = String(orderId).padStart(4, '0');

  return `SE-${year}${month}-${sequenceNumber}`;
};

/**
 * Generate invoice number with custom prefix
 */
export const generateInvoiceNumberWithPrefix = (
  orderId: number,
  createdAt: Date,
  prefix: string = 'SE'
): string => {
  const year = createdAt.getFullYear();
  const month = String(createdAt.getMonth() + 1).padStart(2, '0');
  const sequenceNumber = String(orderId).padStart(4, '0');

  return `${prefix}-${year}${month}-${sequenceNumber}`;
};

/**
 * Parse invoice number to get order ID
 */
export const parseInvoiceNumber = (invoiceNumber: string): {
  prefix: string;
  year: number;
  month: number;
  orderId: number;
} | null => {
  const parts = invoiceNumber.split('-');

  if (parts.length !== 3) {
    return null;
  }

  const [prefix, dateStr, orderIdStr] = parts;
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10);
  const orderId = parseInt(orderIdStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(orderId)) {
    return null;
  }

  return { prefix, year, month, orderId };
};

/**
 * Validate invoice number format
 */
export const isValidInvoiceNumber = (invoiceNumber: string): boolean => {
  const regex = /^[A-Z]+-\d{6}-\d{4}$/;
  return regex.test(invoiceNumber);
};

/**
 * Format invoice number for display
 */
export const formatInvoiceNumber = (invoiceNumber: string): string => {
  return invoiceNumber.toUpperCase();
};
