/**
 * Generate a unique product ID
 * Format: PROD-YYYYMMDD-HHMMSS-RANDOM
 * Example: PROD-20231123-143025-A7B2
 */
export function generateProductId(): string {
  const now = new Date()
  
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  
  // Generate random alphanumeric string
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  
  return `PROD-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`
}

/**
 * Generate a unique shop ID
 * Format: SHOP-YYYYMMDD-RANDOM
 */
export function generateShopId(): string {
  const now = new Date()
  
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  return `SHOP-${year}${month}${day}-${random}`
}

/**
 * Generate a unique order ID
 * Format: ORD-YYYYMMDD-RANDOM
 */
export function generateOrderId(): string {
  const now = new Date()
  
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  return `ORD-${year}${month}${day}-${random}`
}

/**
 * Generate a unique invoice number
 * Format: INV-YYYYMMDD-SEQUENTIAL
 */
export function generateInvoiceNumber(sequential?: number): string {
  const now = new Date()
  
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  const seq = sequential ? String(sequential).padStart(4, '0') : Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  
  return `INV-${year}${month}${day}-${seq}`
}
