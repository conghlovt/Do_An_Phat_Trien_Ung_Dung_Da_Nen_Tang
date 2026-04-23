import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { sendResponse } from './utils/response.util';


import authRoutes from './routes/auth.routes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);


// Basic Health Check Route
app.get('/health', (req: Request, res: Response) => {
  sendResponse(res, 200, 'Server is healthy', { status: 'OK' });
});

// TODO: Add routes here

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const code = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const data = err.errors || null;
  
  sendResponse(res, code, message, data);
});

export default app;
