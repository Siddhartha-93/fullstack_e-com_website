import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cookieParser from "cookie-parser"; // Import cookie-parser middleware

const app = express();

dotenv.config();

// app.use(cors())

app.use( cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }));   // Cross-origin requests

  app.use(express.json());

app.use(cookieParser()); // Use cookie-parser middleware

app.use(helmet());          // Security headers          
app.use(compression());     // Gzip responses
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));                        // Prevent brute force attacks

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: ' Fresh Bite Online API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);

app.use(errorHandler);

export default app;
