
import { Product, User, UserRole, Order, PaymentStatus, PaymentMethod } from './types';

export const TAX_RATE = 0.08; // 8%

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin Manager',
    email: 'admin@store.com',
    phone: '9999999999',
    role: UserRole.MANAGER,
    pendingDues: 0
  },
  {
    id: 'u2',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    role: UserRole.CUSTOMER,
    pendingDues: 3500.00
  },
  {
    id: 'u3',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '9876543210',
    role: UserRole.CUSTOMER,
    pendingDues: 0
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Organic Bananas',
    category: 'Fruits',
    price: 60.00,
    stock: 150,
    unit: 'kg',
    description: 'Fresh, organic bananas sourced directly from local farmers.',
    imageUrl: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: 'p2',
    name: 'Whole Milk',
    category: 'Dairy',
    price: 75.00,
    stock: 40,
    unit: 'liter',
    description: 'Creamy and nutritious whole milk, rich in calcium.',
    imageUrl: 'https://picsum.photos/200/200?random=2'
  },
  {
    id: 'p3',
    name: 'Sourdough Bread',
    category: 'Bakery',
    price: 120.00,
    stock: 25,
    unit: 'loaf',
    description: 'Artisanal sourdough bread with a perfect crust.',
    imageUrl: 'https://picsum.photos/200/200?random=3'
  },
  {
    id: 'p4',
    name: 'Basmati Rice',
    category: 'Grains',
    price: 850.00,
    stock: 50,
    unit: 'bag',
    description: 'Premium aged Basmati rice, perfect for biryanis.',
    imageUrl: 'https://picsum.photos/200/200?random=4'
  },
  {
    id: 'p5',
    name: 'Cheddar Cheese',
    category: 'Dairy',
    price: 450.00,
    stock: 30,
    unit: 'block',
    description: 'Sharp cheddar cheese aged for 12 months.',
    imageUrl: 'https://picsum.photos/200/200?random=5'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    customerId: 'u2',
    customerName: 'John Doe',
    items: [
      { ...MOCK_PRODUCTS[0], quantity: 2 },
      { ...MOCK_PRODUCTS[2], quantity: 1 }
    ],
    subtotal: 240.00,
    tax: 19.20,
    discount: 0,
    total: 259.20,
    amountPaid: 259.20,
    status: PaymentStatus.PAID,
    paymentMethod: PaymentMethod.CASH,
    date: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
  },
  {
    id: 'o2',
    customerId: 'u2',
    customerName: 'John Doe',
    items: [
      { ...MOCK_PRODUCTS[3], quantity: 1 }
    ],
    subtotal: 850.00,
    tax: 68.00,
    discount: 0,
    total: 918.00,
    amountPaid: 0,
    status: PaymentStatus.PENDING,
    paymentMethod: PaymentMethod.NA,
    date: new Date(Date.now() - 86400000 * 5).toISOString() // 5 days ago
  }
];
