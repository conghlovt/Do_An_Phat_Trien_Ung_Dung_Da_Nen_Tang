import { Router } from 'express';
import * as locationController from '../controllers/location.controller';
const router = Router();
// GET /api/v1/customer/locations
router.get('/', locationController.getCustomerLocations);
export default router;
//# sourceMappingURL=location.routes.js.map