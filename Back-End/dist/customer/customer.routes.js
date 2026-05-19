import { Router } from 'express';
import authRoutes from './routes/auth.routes';
import hotelRoutes from './routes/hotel.routes';
import homeRoutes from './routes/home.routes';
import locationRoutes from './routes/location.routes';
import messageRoutes from './routes/message.routes';
const router = Router();
router.use('/auth', authRoutes);
router.use('/hotels', hotelRoutes);
router.use('/home', homeRoutes);
router.use('/locations', locationRoutes);
router.use('/', messageRoutes);
export default router;
//# sourceMappingURL=customer.routes.js.map