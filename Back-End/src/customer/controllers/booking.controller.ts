import type { Response, NextFunction } from 'express';
import type { CustomerAuthRequest } from '../middlewares/auth.middleware';
import { sendResponse } from '../../shared/utils/response.util';
import {
  cancelCustomerBooking,
  createCustomerBooking,
  createNewPaymentQr,
  getCustomerBookingById,
  getMyBookings,
  getPaymentStatus,
} from '../services/booking.service';

const getRouteId = (req: CustomerAuthRequest) => String(req.params.id || '');

export const createBooking = async (
  req: CustomerAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await createCustomerBooking({
      userId: req.user!.id,
      hotelId: req.body.hotelId,
      roomId: req.body.roomId,
      paymentMethod: req.body.paymentMethod,
      bookingType: req.body.bookingType,
      checkIn: req.body.checkIn,
      checkOut: req.body.checkOut,
      guests: req.body.guests,
      amount: req.body.amount,
      durationValue: req.body.durationValue,
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
      voucherCode: req.body.voucherCode,
    });

    return sendResponse(res, 201, 'Tạo booking thành công.', result);
  } catch (error) {
    next(error);
  }
};

export const getBookings = async (
  req: CustomerAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const bookings = await getMyBookings(req.user!.id);
    return sendResponse(res, 200, 'Lấy danh sách đặt phòng thành công.', bookings);
  } catch (error) {
    next(error);
  }
};

export const getBookingDetail = async (
  req: CustomerAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const booking = await getCustomerBookingById(req.user!.id, getRouteId(req));
    return sendResponse(res, 200, 'Lấy chi tiết đặt phòng thành công.', booking);
  } catch (error) {
    next(error);
  }
};

export const getBookingPaymentStatus = async (
  req: CustomerAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const status = await getPaymentStatus(req.user!.id, getRouteId(req));
    return sendResponse(res, 200, 'Lấy trạng thái thanh toán thành công.', status);
  } catch (error) {
    next(error);
  }
};

export const createNewBookingQr = async (
  req: CustomerAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await createNewPaymentQr(req.user!.id, getRouteId(req));
    return sendResponse(res, 201, 'Tạo QR thanh toán mới thành công.', result);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (
  req: CustomerAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const booking = await cancelCustomerBooking(req.user!.id, getRouteId(req));
    return sendResponse(res, 200, 'Hủy đặt phòng thành công.', booking);
  } catch (error) {
    next(error);
  }
};
