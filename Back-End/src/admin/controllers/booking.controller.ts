import { type Request, type Response } from 'express';
import { bookingService } from '../services/booking.service';
import { sendError, sendResponse } from '../../login/utils/response.util';

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    const bookings = await bookingService.getAllBookings({ q });
    return sendResponse(res, 200, 'Lấy danh sách đặt phòng thành công.', bookings);
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;
    const booking = await bookingService.updateBookingStatus(id, status);
    return sendResponse(res, 200, 'Cập nhật đặt phòng thành công.', booking);
  } catch (error) {
    return sendError(res, error);
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await bookingService.deleteBooking(id);
    return sendResponse(res, 200, 'Xóa đặt phòng thành công.');
  } catch (error) {
    return sendError(res, error);
  }
};
