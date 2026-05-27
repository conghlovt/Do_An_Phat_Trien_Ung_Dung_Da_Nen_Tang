import { Router } from 'express';
import {
  cancelBooking,
  createBooking,
  createReview,
  getBooking,
  listBookings,
} from '../controllers/booking.controller';
import { customerOnly } from '../middlewares/auth.middleware';

const router = Router();

router.use(...customerOnly);

router.post('/', createBooking);
router.get('/', listBookings);
router.patch('/:id/cancel', cancelBooking);
router.post('/:bookingId/reviews', createReview);
router.get('/:id', getBooking);

export default router;
