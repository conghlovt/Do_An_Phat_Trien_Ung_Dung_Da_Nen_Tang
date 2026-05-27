import type { Response, NextFunction } from 'express';
import type { CustomerAuthRequest } from '../middlewares/auth.middleware';
import { customerBookingService } from '../services/booking.service';

export const createBooking = async (req: CustomerAuthRequest, res: Response, next: NextFunction) => {
  try {
    const booking = await customerBookingService.create(req.user!.id, req.body);
    res.status(201).json({ data: { booking } });
  } catch (error) {
    next(error);
  }
};

export const listBookings = async (req: CustomerAuthRequest, res: Response, next: NextFunction) => {
  try {
    const bookings = await customerBookingService.listByCustomer(req.user!.id);
    res.json({ data: { bookings } });
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req: CustomerAuthRequest, res: Response, next: NextFunction) => {
  try {
    const booking = await customerBookingService.getById(req.user!.id, req.params.id as string);
    res.json({ data: { booking } });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: CustomerAuthRequest, res: Response, next: NextFunction) => {
  try {
    const booking = await customerBookingService.cancel(req.user!.id, req.params.id as string);
    res.json({ data: { booking } });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req: CustomerAuthRequest, res: Response, next: NextFunction) => {
  try {
    const review = await customerBookingService.createReview(
      req.user!.id,
      req.params.bookingId as string,
      req.body,
    );
    res.status(201).json({ data: { review } });
  } catch (error) {
    next(error);
  }
};
