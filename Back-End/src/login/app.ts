import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

// --- Utilities ---
import { isAppError, toAppError } from '../shared/utils/app-error.util';
import { sendError, sendResponse } from '../shared/utils/response.util';

// --- Admin ---
import authRoutes from './login.routes';
import adminRoutes from '../admin/admin.routes';

// --- Customer Routes ---
import customerRoutes from '../customer/customer.routes';

// --- Partner Routes ---
import { authRoutes as partnerAuthRoutes } from '../partner/routes/auth.routes';
import { publicHotelRoutes, partnerHotelRoutes } from '../partner/routes/hotel.routes';
import { partnerRoomRoutes } from '../partner/routes/room.routes';
import { partnerPricingRoutes } from '../partner/routes/pricing.routes';
import { uploadRoutes } from '../partner/routes/upload.routes';
import { amenityRoutes } from '../partner/routes/amenity.routes';
import { inventoryRoutes } from '../partner/routes/inventory.routes';
import hotelCardRoutes from '../customer/routes/hotelCard.routes';

const app: Application = express();

// ============================================================
// GLOBAL MIDDLEWARE (Tối ưu nhất từ 2 bên)
// ============================================================
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ============================================================
// ADMIN
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// ============================================================
// CUSTOMER API
// ============================================================
app.use('/api/v1/customer', customerRoutes);
app.use('/api/v1/hotel-cards', hotelCardRoutes);

// ============================================================
// PARTNER API (Giữ nguyên prefix /v1 để không xung đột)
// ============================================================
app.use('/api/v1/auth', partnerAuthRoutes);
app.use('/api/v1/hotels', publicHotelRoutes);
app.use('/api/v1/amenities', amenityRoutes);
app.use('/api/v1/partner/hotels', partnerHotelRoutes);
app.use('/api/v1/partner/hotels/:hotelId/room-types', partnerRoomRoutes);
app.use('/api/v1/partner/hotels/:hotelId/room-types/:roomTypeId/pricing', partnerPricingRoutes);
app.use('/api/v1/partner/hotels/:hotelId/inventory', inventoryRoutes);
app.use('/api/v1/files', uploadRoutes);

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/health', (req: Request, res: Response) => {
  sendResponse(res, 200, 'Máy chủ hoạt động bình thường.', {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// GLOBAL ERROR HANDLER (Dùng chuẩn của Admin)
// ============================================================
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