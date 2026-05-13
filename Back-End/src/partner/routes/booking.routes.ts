import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';
import { authenticate, authorize } from '../../login/middlewares/auth.middleware';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const partnerRouter = Router();

// Tất cả các route booking của Partner đều yêu cầu xác thực và quyền 'partner'
partnerRouter.use(authenticate, authorize(['partner']));

/** GET /api/v1/partner/bookings — Lấy danh sách đặt phòng */
partnerRouter.get(
  '/',
  asyncHandler((req, res) => bookingController.listMyBookings(req as any, res))
);

/** PATCH /api/v1/partner/bookings/:id/status — Cập nhật trạng thái đặt phòng */
partnerRouter.patch(
  '/:id/status',
  asyncHandler((req, res) => bookingController.updateStatus(req as any, res))
);

export const partnerBookingRoutes = partnerRouter;
