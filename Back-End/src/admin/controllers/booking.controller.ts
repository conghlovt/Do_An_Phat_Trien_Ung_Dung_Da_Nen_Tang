import { type Request, type Response } from 'express';
import { bookingService } from '../services/booking.service';
import { sendError, sendResponse } from '../../shared/utils/response.util';
import {
  getSearchQuery,
  getStringQuery,
  normalizeSortOrder,
  parseDateRangeFromQuery,
  parsePagination,
} from '../utils/admin-query.util';

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const { page, limit } = parsePagination(req);
    const bookings = await bookingService.getAllBookings({
      search: getSearchQuery(req),
      status: getStringQuery(req, 'status'),
      paymentId: getStringQuery(req, 'paymentId'),
      page,
      limit,
      sortBy: getStringQuery(req, 'sortBy'),
      sortOrder: normalizeSortOrder(req.query.sortOrder),
      dateRange: parseDateRangeFromQuery(req.query),
    });
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
