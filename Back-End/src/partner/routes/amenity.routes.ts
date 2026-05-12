import { Router } from 'express';
import { amenityController } from '../controllers/amenity.controller';

const router = Router();

// GET /api/v1/amenities — List all amenities (public)
router.get('/', (req, res, next) => amenityController.listAll(req, res, next));

export const amenityRoutes = router;
