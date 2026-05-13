import { Router } from 'express';
import hotelRoutes from './routes/hotel.routes';
import homeRoutes from './routes/home.routes';

const router = Router();

router.use('/hotels', hotelRoutes);
router.use('/home', homeRoutes);

export default router;