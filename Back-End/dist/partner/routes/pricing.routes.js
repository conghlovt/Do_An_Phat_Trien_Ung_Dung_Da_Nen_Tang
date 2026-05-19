// ============================================================
// Pricing Routes — Partner only (nested under room-types)
// ============================================================
import { Router } from 'express';
import { pricingController } from '../controllers/pricing.controller';
import { authenticate, authorize } from '../../login/middlewares/auth.middleware';
import { validate } from '../../login/middlewares/validate.middleware';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { createPricingSchema, updatePricingSchema, createSpecialPriceSchema } from '../middlewares/pricing.validator';
const router = Router({ mergeParams: true });
router.use(authenticate, authorize(['partner']));
// ============================================================
// PRICING POLICIES
// ============================================================
router.get('/', asyncHandler((req, res) => pricingController.listPricing(req, res)));
router.post('/', validate(createPricingSchema), asyncHandler((req, res) => pricingController.createPricing(req, res)));
router.put('/:pricingId', validate(updatePricingSchema), asyncHandler((req, res) => pricingController.updatePricing(req, res)));
router.delete('/:pricingId', asyncHandler((req, res) => pricingController.deletePricing(req, res)));
// ============================================================
// SPECIAL PRICES
// ============================================================
router.get('/:pricingId/special-prices', asyncHandler((req, res) => pricingController.listSpecialPrices(req, res)));
router.post('/:pricingId/special-prices', validate(createSpecialPriceSchema), asyncHandler((req, res) => pricingController.createSpecialPrice(req, res)));
router.delete('/:pricingId/special-prices/:specialPriceId', asyncHandler((req, res) => pricingController.deleteSpecialPrice(req, res)));
export const partnerPricingRoutes = router;
//# sourceMappingURL=pricing.routes.js.map