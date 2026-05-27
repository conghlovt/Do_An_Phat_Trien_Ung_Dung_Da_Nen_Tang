import { Router } from 'express';
import authRoutes from './routes/auth.routes';
import hotelRoutes from './routes/hotel.routes';
import homeRoutes from './routes/home.routes';
import locationRoutes from './routes/location.routes';
import messageRoutes from './routes/message.routes';
import bookingRoutes from './routes/booking.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/hotels', hotelRoutes);
router.use('/home', homeRoutes);
router.use('/locations', locationRoutes);
router.use('/bookings', bookingRoutes);
router.use('/', messageRoutes);

export default router;
