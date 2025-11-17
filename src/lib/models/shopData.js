// Sample data models for the shop management system

export const products = [
  {
    id: 'PRD-001',
    name: 'Premium RO Water Purifier',
    category: 'RO Systems',
    brand: 'AquaPure',
    price: 15000,
    costPrice: 12000,
    stock: 25,
    minStock: 5,
    sku: 'AP-RO-001',
    description: '7-stage RO purification with UV protection',
    specifications: {
      capacity: '10L',
      warranty: '2 years',
      power: '50W'
    },
    status: 'In Stock',
    lastRestocked: '2025-11-10',
    supplier: 'AquaPure Industries',
    image: '/products/ro-purifier.jpg'
  },
  {
    id: 'PRD-002',
    name: 'Carbon Filter Set (Pack of 4)',
    category: 'Spare Parts',
    brand: 'FilterMax',
    price: 800,
    costPrice: 600,
    stock: 150,
    minStock: 30,
    sku: 'FM-CF-004',
    description: 'Activated carbon filters for water purifiers',
    specifications: {
      filterLife: '6 months',
      compatibility: 'Universal',
      material: 'Activated Carbon'
    },
    status: 'In Stock',
    lastRestocked: '2025-11-15',
    supplier: 'FilterMax Distributors',
    image: '/products/carbon-filter.jpg'
  },
  {
    id: 'PRD-003',
    name: 'RO Membrane 75 GPD',
    category: 'Spare Parts',
    brand: 'PureFlow',
    price: 1200,
    costPrice: 900,
    stock: 8,
    minStock: 10,
    sku: 'PF-RO-75',
    description: 'High-quality RO membrane for water filtration',
    specifications: {
      capacity: '75 GPD',
      lifespan: '2 years',
      rejectionRate: '95%'
    },
    status: 'Low Stock',
    lastRestocked: '2025-10-20',
    supplier: 'PureFlow Supplies',
    image: '/products/ro-membrane.jpg'
  },
  {
    id: 'PRD-004',
    name: 'UV Water Purifier 8L',
    category: 'UV Systems',
    brand: 'CleanWater',
    price: 8500,
    costPrice: 7000,
    stock: 15,
    minStock: 5,
    sku: 'CW-UV-008',
    description: 'UV purification with 8L storage capacity',
    specifications: {
      capacity: '8L',
      uvPower: '11W',
      warranty: '1 year'
    },
    status: 'In Stock',
    lastRestocked: '2025-11-12',
    supplier: 'CleanWater Technologies',
    image: '/products/uv-purifier.jpg'
  },
  {
    id: 'PRD-005',
    name: 'Sediment Filter 10 inch',
    category: 'Spare Parts',
    brand: 'FilterMax',
    price: 150,
    costPrice: 100,
    stock: 200,
    minStock: 50,
    sku: 'FM-SF-010',
    description: 'Pre-filter for removing sediments and particles',
    specifications: {
      size: '10 inch',
      micronRating: '5 microns',
      filterLife: '3 months'
    },
    status: 'In Stock',
    lastRestocked: '2025-11-16',
    supplier: 'FilterMax Distributors',
    image: '/products/sediment-filter.jpg'
  }
]

export const orders = [
  {
    id: 'ORD-001',
    orderNumber: 'SO-2025-001',
    customerName: 'Rajesh Verma',
    customerPhone: '+91 98765 43210',
    customerEmail: 'rajesh.verma@example.com',
    customerAddress: '123, MG Road, Bangalore, Karnataka - 560001',
    items: [
      { productId: 'PRD-001', productName: 'Premium RO Water Purifier', quantity: 1, price: 15000 },
      { productId: 'PRD-002', productName: 'Carbon Filter Set', quantity: 2, price: 800 }
    ],
    subtotal: 16600,
    tax: 2988,
    discount: 500,
    total: 19088,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    orderDate: '2025-11-10',
    deliveryDate: '2025-11-12',
    notes: 'Requested installation service'
  },
  {
    id: 'ORD-002',
    orderNumber: 'SO-2025-002',
    customerName: 'Priya Sharma',
    customerPhone: '+91 87654 32109',
    customerEmail: 'priya.sharma@example.com',
    customerAddress: '456, Residency Road, Mumbai, Maharashtra - 400001',
    items: [
      { productId: 'PRD-004', productName: 'UV Water Purifier 8L', quantity: 1, price: 8500 },
      { productId: 'PRD-005', productName: 'Sediment Filter 10 inch', quantity: 4, price: 150 }
    ],
    subtotal: 9100,
    tax: 1638,
    discount: 0,
    total: 10738,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    orderStatus: 'Processing',
    orderDate: '2025-11-15',
    deliveryDate: null,
    notes: ''
  },
  {
    id: 'ORD-003',
    orderNumber: 'SO-2025-003',
    customerName: 'Amit Patel',
    customerPhone: '+91 99887 76655',
    customerEmail: 'amit.patel@example.com',
    customerAddress: '789, Ring Road, Ahmedabad, Gujarat - 380015',
    items: [
      { productId: 'PRD-003', productName: 'RO Membrane 75 GPD', quantity: 2, price: 1200 },
      { productId: 'PRD-002', productName: 'Carbon Filter Set', quantity: 1, price: 800 }
    ],
    subtotal: 3200,
    tax: 576,
    discount: 100,
    total: 3676,
    paymentMethod: 'Cash',
    paymentStatus: 'Pending',
    orderStatus: 'Pending',
    orderDate: '2025-11-17',
    deliveryDate: null,
    notes: 'Call before delivery'
  },
  {
    id: 'ORD-004',
    orderNumber: 'SO-2025-004',
    customerName: 'Sneha Reddy',
    customerPhone: '+91 76543 21098',
    customerEmail: 'sneha.reddy@example.com',
    customerAddress: '321, Jubilee Hills, Hyderabad, Telangana - 500033',
    items: [
      { productId: 'PRD-001', productName: 'Premium RO Water Purifier', quantity: 1, price: 15000 }
    ],
    subtotal: 15000,
    tax: 2700,
    discount: 1000,
    total: 16700,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    orderDate: '2025-11-16',
    deliveryDate: null,
    notes: 'Installation required'
  }
]

export const customers = [
  {
    id: 'CUST-001',
    name: 'Rajesh Verma',
    phone: '+91 98765 43210',
    email: 'rajesh.verma@example.com',
    address: '123, MG Road, Bangalore, Karnataka - 560001',
    totalOrders: 5,
    totalSpent: 45000,
    lastOrderDate: '2025-11-10',
    joinedDate: '2024-05-15',
    status: 'Active',
    customerType: 'Regular'
  },
  {
    id: 'CUST-002',
    name: 'Priya Sharma',
    phone: '+91 87654 32109',
    email: 'priya.sharma@example.com',
    address: '456, Residency Road, Mumbai, Maharashtra - 400001',
    totalOrders: 2,
    totalSpent: 18000,
    lastOrderDate: '2025-11-15',
    joinedDate: '2024-08-20',
    status: 'Active',
    customerType: 'New'
  },
  {
    id: 'CUST-003',
    name: 'Amit Patel',
    phone: '+91 99887 76655',
    email: 'amit.patel@example.com',
    address: '789, Ring Road, Ahmedabad, Gujarat - 380015',
    totalOrders: 8,
    totalSpent: 75000,
    lastOrderDate: '2025-11-17',
    joinedDate: '2023-12-10',
    status: 'Active',
    customerType: 'VIP'
  }
]

export const dashboardStats = {
  todaySales: 28500,
  todayOrders: 8,
  monthSales: 425000,
  monthOrders: 156,
  totalCustomers: 234,
  activeOrders: 12,
  lowStockItems: 3,
  revenue: {
    today: 28500,
    yesterday: 32000,
    thisWeek: 187500,
    lastWeek: 156000,
    thisMonth: 425000,
    lastMonth: 380000
  },
  topProducts: [
    { id: 'PRD-001', name: 'Premium RO Water Purifier', unitsSold: 45, revenue: 675000 },
    { id: 'PRD-002', name: 'Carbon Filter Set', unitsSold: 120, revenue: 96000 },
    { id: 'PRD-004', name: 'UV Water Purifier 8L', unitsSold: 32, revenue: 272000 }
  ],
  recentActivities: [
    { type: 'order', message: 'New order #SO-2025-004 placed', time: '10 minutes ago', icon: 'ShoppingCart' },
    { type: 'payment', message: 'Payment received for order #SO-2025-003', time: '25 minutes ago', icon: 'IndianRupee' },
    { type: 'product', message: '50 units of Carbon Filter Set restocked', time: '1 hour ago', icon: 'Package' },
    { type: 'customer', message: 'New customer registered: Sneha Reddy', time: '2 hours ago', icon: 'UserPlus' }
  ]
}
