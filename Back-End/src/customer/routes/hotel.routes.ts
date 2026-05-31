import { Router } from 'express';
import * as hotelController from '../controllers/hotel.controller';
import * as hotelCardController from '../controllers/hotelCard.controller';
import {
  hotelAvailabilityQuerySchema,
  hotelCardCityParamsSchema,
  hotelIdParamsSchema,
  hotelListQuerySchema,
} from '../middlewares/customer.validator';
import { validate } from '../middlewares/validate.middleware';
import { customerOnly } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/customer/hotels
router.get('/', validate(hotelListQuerySchema, 'query'), hotelController.getHotels);

// GET /api/customer/hotels/office/info  ← phải trước /:id để tránh conflict
router.get('/office/info', hotelController.getOfficeInfo);

// GET /api/customer/hotels/locations  ← phải trước /:id để tránh conflict
router.get('/locations', hotelController.getHotelLocations);

// GET /api/customer/hotels/city/:city  ← phải trước /:id để tránh conflict
router.get('/city/:city', validate(hotelCardCityParamsSchema, 'params'), hotelCardController.getHotelCardsByCity);

// GET /api/customer/hotels/viewed
router.get('/viewed', ...customerOnly, hotelController.getViewedHotels);

// POST /api/customer/hotels/:id/view
router.post('/:id/view', ...customerOnly, validate(hotelIdParamsSchema, 'params'), hotelController.addViewedHotel);

// GET /api/customer/hotels/:id
router.get('/:id', validate(hotelIdParamsSchema, 'params'), hotelController.getHotelById);

// GET /api/customer/hotels/:id/rooms
router.get('/:id/rooms', validate(hotelIdParamsSchema, 'params'), hotelController.getHotelRooms);

// GET /api/customer/hotels/:id/availability
router.get(
  '/:id/availability',
  validate(hotelIdParamsSchema, 'params'),
  validate(hotelAvailabilityQuerySchema, 'query'),
  hotelController.getHotelAvailability,
);


export default router;
