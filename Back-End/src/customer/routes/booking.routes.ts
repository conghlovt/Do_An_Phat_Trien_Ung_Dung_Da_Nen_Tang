import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { customerOnly } from '../middlewares/auth.middleware';
import {
  bookingIdParamsSchema,
  createBookingSchema,
} from '../middlewares/customer.validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(...customerOnly);

router.get('/', bookingController.getBookings);
router.post('/', validate(createBookingSchema), bookingController.createBooking);
router.get(
  '/:id/payment-status',
  validate(bookingIdParamsSchema, 'params'),
  bookingController.getBookingPaymentStatus,
);
router.post(
  '/:id/payment/new-qr',
  validate(bookingIdParamsSchema, 'params'),
  bookingController.createNewBookingQr,
);
router.patch(
  '/:id/cancel',
  validate(bookingIdParamsSchema, 'params'),
  bookingController.cancelBooking,
);
router.get(
  '/:id',
  validate(bookingIdParamsSchema, 'params'),
  bookingController.getBookingDetail,
);

export default router;
