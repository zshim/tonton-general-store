import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import transactionRoutes from './routes/transactionRoutes';
import notificationRoutes from './routes/notificationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { errorHandler } from './middleware/errorMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security Headers
app.use(helmet());

// 2. Data Sanitization (Prevent NoSQL Injection)
app.use(mongoSanitize());

// 3. Rate Limiting (Prevent Brute Force/DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// 4. CORS Config for Production
const corsOptions = {
  origin: process.env.CLIENT_URL || '*', // In production, replace '*' with specific domain
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json()); // Parse JSON bodies

// Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || '');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    (process as any).exit(1);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('SmartGrocer AI API is running...');
});

// Error Handling (Must be last middleware)
app.use(errorHandler);

// Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});

export default app;