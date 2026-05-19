import { Router } from 'express';
import * as locationController from '../controllers/location.controller';

const router = Router();

// GET /api/customer/locations
router.get('/', locationController.getCustomerLocations);

export default router;
