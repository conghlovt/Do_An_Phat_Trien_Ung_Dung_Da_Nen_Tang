import { Router } from 'express';
import * as homeController from '../controllers/home.controller';

const router = Router();

// GET /api/v1/home/hotel-sections
router.get('/hotel-sections', homeController.getHotelSections);

export default router;
