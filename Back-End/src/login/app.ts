import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { isAppError, toAppError } from './utils/app-error.util';
import { sendError, sendResponse } from './utils/response.util';


import authRoutes from './login.routes';
import adminRoutes from '../admin/admin.routes';
import customerRoutes from '../customer/customer.routes';
import partnerRoutes from '../partner/partner.routes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/partner', partnerRoutes);


// Basic Health Check Route
app.get('/health', (req: Request, res: Response) => {
  sendResponse(res, 200, 'Máy chủ hoạt động bình thường.', { status: 'OK' });
});

// TODO: Add routes here

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const appError = toAppError(err);

  console.error('Request failed', {
    internalCode: appError.internalCode,
    rawMessage: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    details: appError.details,
    path: req.path,
    method: req.method,
    userId: (req as any).user?.id,
    status: appError.httpStatus,
  });

  if (!isAppError(err)) {
    return sendError(res, appError);
  }

  return sendError(res, err);
});

export default app;
