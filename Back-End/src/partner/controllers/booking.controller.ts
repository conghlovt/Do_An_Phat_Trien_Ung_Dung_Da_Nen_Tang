import type { Response } from 'express';
import { bookingService } from '../services/booking.service';
import { sendSuccess } from '../../shared/utils/response.util';
import type { AuthRequest } from '../../login/middlewares/auth.middleware';
import type { BookingStatus } from '@prisma/client';

export class BookingController {
  /** GET /api/v1/partner/bookings — Lấy danh sách đặt phòng */
  async listMyBookings(req: AuthRequest, res: Response) {
    const status = (req.query.status as string) || 'ALL';
    const bookings = await bookingService.listByPartner(req.user!.id, status);
    sendSuccess(res, 200, 'BOOKING_LIST_FETCHED', 'Lấy danh sách đặt phòng thành công', { bookings });
  }

  /** PATCH /api/v1/partner/bookings/:id/status — Cập nhật trạng thái đặt phòng */
  async updateStatus(req: AuthRequest, res: Response) {
    const bookingId = req.params.id as string;
    const status = req.body.status as BookingStatus;
    const booking = await bookingService.updateStatus(bookingId, req.user!.id, status);
    sendSuccess(res, 200, 'BOOKING_STATUS_UPDATED', 'Cập nhật trạng thái đặt phòng thành công', { booking });
  }
}

export const bookingController = new BookingController();
