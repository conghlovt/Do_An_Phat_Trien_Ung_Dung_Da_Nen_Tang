import { Router } from 'express';
import * as hotelCardController from '../controllers/hotelCard.controller';
import { hotelCardCityParamsSchema } from '../middlewares/customer.validator';
import { validate } from '../middlewares/validate.middleware';
const router = Router();
// GET /api/v1/hotel-cards
router.get('/', hotelCardController.getHotelCards);
// GET /api/v1/hotel-cards/city/:city
router.get('/city/:city', validate(hotelCardCityParamsSchema, 'params'), hotelCardController.getHotelCardsByCity);
export default router;
//# sourceMappingURL=hotelCard.routes.js.map