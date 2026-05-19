import { Router } from 'express';
import * as hotelController from '../controllers/hotel.controller';
import * as hotelCardController from '../controllers/hotelCard.controller';
import { hotelAvailabilityQuerySchema, hotelCardCityParamsSchema, hotelIdParamsSchema, hotelListQuerySchema, } from '../middlewares/customer.validator';
import { validate } from '../middlewares/validate.middleware';
const router = Router();
// GET /api/v1/customer/hotels
router.get('/', validate(hotelListQuerySchema, 'query'), hotelController.getHotels);
// GET /api/v1/customer/hotels/office/info  ← phải trước /:id để tránh conflict
router.get('/office/info', hotelController.getOfficeInfo);
// GET /api/v1/customer/hotels/locations  ← phải trước /:id để tránh conflict
router.get('/locations', hotelController.getHotelLocations);
// GET /api/v1/customer/hotels/city/:city  ← phải trước /:id để tránh conflict
router.get('/city/:city', validate(hotelCardCityParamsSchema, 'params'), hotelCardController.getHotelCardsByCity);
// GET /api/v1/customer/hotels/:id
router.get('/:id', validate(hotelIdParamsSchema, 'params'), hotelController.getHotelById);
// GET /api/v1/customer/hotels/:id/rooms
router.get('/:id/rooms', validate(hotelIdParamsSchema, 'params'), hotelController.getHotelRooms);
// GET /api/v1/customer/hotels/:id/availability
router.get('/:id/availability', validate(hotelIdParamsSchema, 'params'), validate(hotelAvailabilityQuerySchema, 'query'), hotelController.getHotelAvailability);
export default router;
//# sourceMappingURL=hotel.routes.js.map