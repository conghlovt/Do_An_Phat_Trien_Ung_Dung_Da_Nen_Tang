import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';

const router = Router({ mergeParams: true });

// GET /api/v1/partner/hotels/:hotelId/inventory?startDate=...&endDate=...
router.get('/', (req, res, next) => inventoryController.getCalendar(req, res, next));

// PUT /api/v1/partner/hotels/:hotelId/inventory/:roomTypeId
router.put('/:roomTypeId', (req, res, next) => inventoryController.updateInventory(req, res, next));

export const inventoryRoutes = router;
