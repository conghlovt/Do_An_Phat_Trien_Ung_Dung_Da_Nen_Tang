import { Router } from 'express';
import * as hotelCardController from '../controllers/hotelCard.controller';

const router = Router();

// GET /api/v1/hotel-cards
router.get('/', hotelCardController.getHotelCards);

// GET /api/v1/hotel-cards/city/:city
router.get('/city/:city', hotelCardController.getHotelCardsByCity);

export default router;
