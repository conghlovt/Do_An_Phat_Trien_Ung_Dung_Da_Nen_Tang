import { Router } from 'express';
import { partnerHotelRoutes } from './routes/hotel.routes';
import { partnerRoomRoutes } from './routes/room.routes';
import { partnerPricingRoutes } from './routes/pricing.routes';
import { inventoryRoutes } from './routes/inventory.routes';
import { uploadRoutes } from './routes/upload.routes';
import { authenticate, authorize } from '../login/middlewares/auth.middleware'; // Optional if they use the shared one

const router = Router();

// Apply partner auth middleware if needed
router.use(authenticate, authorize(['partner']));

// Mount all partner-specific routes
router.use('/hotels', partnerHotelRoutes);
router.use('/hotels/:hotelId/room-types', partnerRoomRoutes);
router.use('/hotels/:hotelId/room-types/:roomTypeId/pricing', partnerPricingRoutes);
router.use('/hotels/:hotelId/inventory', inventoryRoutes);
router.use('/files', uploadRoutes);

export default router;
