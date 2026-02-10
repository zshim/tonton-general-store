
export enum UserRole {
  MANAGER = 'MANAGER',
  CUSTOMER = 'CUSTOMER',
}

export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  FAILED = 'FAILED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  ONLINE = 'ONLINE',
  NA = 'N/A'
}

export enum TransactionType {
  CREDIT = 'CREDIT', // Payment made by user
  DEBIT = 'DEBIT',   // New purchase/charge
}

export enum NotificationType {
  REMINDER = 'REMINDER',
  PROMOTION = 'PROMOTION',
  SYSTEM = 'SYSTEM'
}

export interface User {
  id: string;
  name: string;
  phone: string; // Primary identifier
  email?: string; // Optional now
  role: UserRole;
  address?: string;
  pendingDues: number;
  fcmToken?: string; // For push notifications
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  date: string;
}

export interface Transaction {
  id: string;
  userId: string;
  orderId?: string; // Optional if it's a general payment
  amount: number;
  type: TransactionType;
  description: string;
  paymentMethod?: PaymentMethod;
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  date: string;
}

export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  topSellingProduct: string;
  pendingDuesTotal: number;
}