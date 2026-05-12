import { Router } from 'express';
import * as hotelController from '../controllers/hotel.controller';

const router = Router();

// GET /api/v1/hotels
router.get('/', hotelController.getHotels);

// GET /api/v1/hotels/office/info  ← phải trước /:id để tránh conflict
router.get('/office/info', hotelController.getOfficeInfo);

// GET /api/v1/hotels/:id
router.get('/:id', hotelController.getHotelById);

// GET /api/v1/hotels/:id/rooms
router.get('/:id/rooms', hotelController.getHotelRooms);

// GET /api/v1/hotels/:id/availability
router.get('/:id/availability', hotelController.getHotelAvailability);

export default router;
