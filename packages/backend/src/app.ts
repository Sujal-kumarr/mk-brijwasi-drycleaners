import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { authRouter } from './modules/auth/auth.router';
import { usersRouter } from './modules/users/users.router';
import { catalogRouter } from './modules/catalog/catalog.router';
import { addressesRouter } from './modules/addresses/addresses.router';
import { ordersRouter } from './modules/orders/orders.router';
import { adminRouter } from './modules/admin/admin.router';
import { partnersRouter } from './modules/partners/partners.router';
import { paymentsRouter } from './modules/payments/payments.router';
import { reportsRouter } from './modules/reports/reports.router';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: [env.FRONTEND_URL, 'http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Request Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // Body Parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Rate Limiter for Authentication endpoints (5 requests per 15 minutes)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === 'test' ? 1000 : 5,
    message: {
      success: false,
      error: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Health check route
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount API v1 Routes
  const apiRouter = express.Router();
  apiRouter.use('/auth', authLimiter, authRouter);
  apiRouter.use('/users', usersRouter);
  apiRouter.use('/catalog', catalogRouter);
  apiRouter.use('/addresses', addressesRouter);
  apiRouter.use('/orders', ordersRouter);
  apiRouter.use('/admin', adminRouter);
  apiRouter.use('/partners', partnersRouter);
  apiRouter.use('/payments', paymentsRouter);
  apiRouter.use('/reports', reportsRouter);

  app.use('/api/v1', apiRouter);

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `Not Found - ${req.method} ${req.originalUrl}`,
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
