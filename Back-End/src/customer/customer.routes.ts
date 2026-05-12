import { Router } from 'express';
import hotelRoutes from './routes/hotel.routes';

const router = Router();

router.use('/hotels', hotelRoutes);

export default router;
