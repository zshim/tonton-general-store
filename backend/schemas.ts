
/**
 * Backend Mongoose Schemas
 * Note: These require 'mongoose' to be installed in the backend environment.
 * npm install mongoose
 */

import mongoose, { Schema } from 'mongoose';

// --- 1. User Schema ---
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // Optional now, sparse allows null/duplicates if null
  phone: { type: String, required: true, unique: true }, // Required and Unique
  role: { 
    type: String, 
    enum: ['MANAGER', 'CUSTOMER'], 
    default: 'CUSTOMER' 
  },
  address: { type: String },
  // Tracks total amount owed by customer
  pendingDues: { type: Number, default: 0 },
  // Firebase Cloud Messaging Token for Push Notifications
  fcmToken: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// --- 2. Product Schema ---
const ProductSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true }, // e.g., 'kg', 'pc'
  description: { type: String },
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true }
});

// --- 3. Order Schema ---
const OrderSchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: String, // Snapshot of name at time of purchase
    price: Number, // Snapshot of price at time of purchase
    quantity: Number,
    total: Number
  }],
  pricing: {
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  payment: {
    amountPaid: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['PAID', 'PENDING', 'PARTIAL', 'FAILED'],
      default: 'PENDING'
    },
    method: { type: String } // 'CASH', 'CARD', 'ONLINE'
  },
  createdAt: { type: Date, default: Date.now }
});

// --- 4. Transaction Schema (Ledger) ---
// Tracks every financial movement (Purchases increase dues, Payments decrease dues)
const TransactionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: Schema.Types.ObjectId, ref: 'Order' }, // Optional
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['CREDIT', 'DEBIT'], 
    required: true 
  },
  // DEBIT = Adding debt (Purchase)
  // CREDIT = Paying debt (Payment)
  description: { type: String },
  date: { type: Date, default: Date.now }
});

// --- 5. Notification Schema ---
const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['REMINDER', 'PROMOTION', 'SYSTEM'],
    default: 'SYSTEM'
  },
  isRead: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now }
});

// --- 6. Analytics/StoreStats Schema ---
// Aggregated daily for performance dashboards
const StoreStatsSchema = new Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  totalRevenue: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  activeCustomers: { type: Number, default: 0 },
  generatedAt: { type: Date, default: Date.now }
});

// Export Models
export const User = mongoose.model('User', UserSchema);
export const Product = mongoose.model('Product', ProductSchema);
export const Order = mongoose.model('Order', OrderSchema);
export const Transaction = mongoose.model('Transaction', TransactionSchema);
export const Notification = mongoose.model('Notification', NotificationSchema);
export const StoreStats = mongoose.model('StoreStats', StoreStatsSchema);
