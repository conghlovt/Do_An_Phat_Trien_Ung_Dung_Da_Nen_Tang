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

router.get('/', asyncHandler((req, res) => pricingController.listPricing(req as any, res)));

router.post('/',
  validate(createPricingSchema),
  asyncHandler((req, res) => pricingController.createPricing(req as any, res))
);

router.put('/:pricingId',
  validate(updatePricingSchema),
  asyncHandler((req, res) => pricingController.updatePricing(req as any, res))
);

router.delete('/:pricingId', asyncHandler((req, res) => pricingController.deletePricing(req as any, res)));

// ============================================================
// SPECIAL PRICES
// ============================================================

router.get('/:pricingId/special-prices', asyncHandler((req, res) => pricingController.listSpecialPrices(req as any, res)));

router.post('/:pricingId/special-prices',
  validate(createSpecialPriceSchema),
  asyncHandler((req, res) => pricingController.createSpecialPrice(req as any, res))
);

router.delete('/:pricingId/special-prices/:specialPriceId',
  asyncHandler((req, res) => pricingController.deleteSpecialPrice(req as any, res))
);

export const partnerPricingRoutes = router;
