// ============================================================
// Hotel Routes — Public + Partner
// ============================================================

import { Router } from 'express';
import { hotelController } from '../controllers/hotel.controller';
import { authenticate, authorize } from '../../login/middlewares/auth.middleware';
import { validate } from '../../login/middlewares/validate.middleware';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { uploadMultipleImages, uploadSingleVideo } from '../../login/middlewares/upload.middleware';
import { createHotelSchema, updateHotelSchema, hotelQuerySchema } from '../middlewares/hotel.validator';

// ============================================================
// PUBLIC ROUTES — /api/v1/hotels
// ============================================================

const publicRouter = Router();

/** GET /api/v1/hotels — Search & list hotels (public) */
publicRouter.get('/',
  asyncHandler((req, res) => hotelController.listPublic(req, res))
);

/** GET /api/v1/hotels/:slug — Hotel detail by slug (public) */
publicRouter.get('/:slug',
  asyncHandler((req, res) => hotelController.getPublic(req, res))
);

export const publicHotelRoutes = publicRouter;

// ============================================================
// PARTNER ROUTES — /api/v1/partner/hotels
// ============================================================

const partnerRouter = Router();

// All partner routes require authentication + partner role
partnerRouter.use(authenticate, authorize(['partner']));

/** GET /api/v1/partner/hotels — List my hotels */
partnerRouter.get('/',
  validate(hotelQuerySchema, 'query'),
  asyncHandler((req, res) => hotelController.listMyHotels(req as any, res))
);

/** POST /api/v1/partner/hotels — Create hotel */
partnerRouter.post('/',
  validate(createHotelSchema),
  asyncHandler((req, res) => hotelController.create(req as any, res))
);

/** GET /api/v1/partner/hotels/:id — Get my hotel detail */
partnerRouter.get('/:id',
  asyncHandler((req, res) => hotelController.getMyHotel(req as any, res))
);

/** PUT /api/v1/partner/hotels/:id — Update my hotel */
partnerRouter.put('/:id',
  validate(updateHotelSchema),
  asyncHandler((req, res) => hotelController.update(req as any, res))
);

/** POST /api/v1/partner/hotels/:id/submit — Submit for review */
partnerRouter.post('/:id/submit',
  asyncHandler((req, res) => hotelController.submitForReview(req as any, res))
);

/** DELETE /api/v1/partner/hotels/:id — Delete hotel */
partnerRouter.delete('/:id',
  asyncHandler((req, res) => hotelController.delete(req as any, res))
);

// ---- Image Upload ----

/** POST /api/v1/partner/hotels/:id/images — Upload hotel images (max 10) */
partnerRouter.post('/:id/images',
  uploadMultipleImages,
  asyncHandler((req, res) => hotelController.uploadImages(req as any, res))
);

/** DELETE /api/v1/partner/hotels/:id/images/:imageId — Delete hotel image */
partnerRouter.delete('/:id/images/:imageId',
  asyncHandler((req, res) => hotelController.deleteImage(req as any, res))
);

// ---- Video Upload ----

/** POST /api/v1/partner/hotels/:id/videos — Upload hotel video */
partnerRouter.post('/:id/videos',
  uploadSingleVideo,
  asyncHandler((req, res) => hotelController.uploadVideo(req as any, res))
);

/** DELETE /api/v1/partner/hotels/:id/videos/:videoId — Delete hotel video */
partnerRouter.delete('/:id/videos/:videoId',
  asyncHandler((req, res) => hotelController.deleteVideo(req as any, res))
);

export const partnerHotelRoutes = partnerRouter;
