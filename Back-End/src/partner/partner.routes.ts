import { Router } from 'express';
import { authenticate, authorize } from '../login/middlewares/auth.middleware';
import { validate } from '../login/middlewares/validate.middleware';
import { asyncHandler } from '../shared/utils/asyncHandler';
import { uploadGenericFile, uploadMultipleFiles, uploadMultipleImages, uploadSingleVideo } from '../login/middlewares/upload.middleware';

// Controllers
import { authController } from './controllers/auth.controller';
import { hotelController } from './controllers/hotel.controller';
import { amenityController } from './controllers/amenity.controller';
import { roomController } from './controllers/room.controller';
import { pricingController } from './controllers/pricing.controller';
import { inventoryController } from './controllers/inventory.controller';
import { bookingController } from './controllers/booking.controller';
import { uploadController } from './controllers/upload.controller';
import { voucherController } from './controllers/voucher.controller';

// Validators
import { registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema } from './middlewares/auth.validator';
import { createHotelSchema, updateHotelSchema, hotelQuerySchema } from './middlewares/hotel.validator';
import { createRoomTypeSchema, updateRoomTypeSchema, createRoomUnitSchema, updateRoomUnitSchema } from './middlewares/room.validator';
import { createPricingSchema, updatePricingSchema, createSpecialPriceSchema } from './middlewares/pricing.validator';

// ============================================================
// PUBLIC ROUTES (/api/v1)
// ============================================================
const publicRouter = Router();

// Auth
publicRouter.post('/auth/register', validate(registerSchema), asyncHandler((req, res) => authController.register(req, res)));
publicRouter.post('/auth/login', validate(loginSchema), asyncHandler((req, res) => authController.login(req, res)));
publicRouter.post('/auth/refresh-token', validate(refreshTokenSchema), asyncHandler((req, res) => authController.refreshToken(req, res)));
publicRouter.post('/auth/logout', asyncHandler((req, res) => authController.logout(req, res)));
publicRouter.post('/auth/forgot-password', validate(forgotPasswordSchema), asyncHandler((req, res) => authController.forgotPassword(req, res)));
publicRouter.post('/auth/reset-password', validate(resetPasswordSchema), asyncHandler((req, res) => authController.resetPassword(req, res)));

// Amenities
publicRouter.get('/amenities', (req, res, next) => amenityController.listAll(req, res, next));

// Public Hotels
publicRouter.get('/hotels', asyncHandler((req, res) => hotelController.listPublic(req, res)));
publicRouter.get('/hotels/:slug', asyncHandler((req, res) => hotelController.getPublic(req, res)));


// ============================================================
// FILE ROUTES (/api/v1/files) - requires authentication
// ============================================================
const fileRouter = Router();
fileRouter.use(authenticate);

fileRouter.post('/upload', uploadGenericFile, asyncHandler((req, res) => uploadController.uploadSingle(req as any, res)));
fileRouter.post('/upload-multiple', uploadMultipleFiles, asyncHandler((req, res) => uploadController.uploadMultiple(req as any, res)));
fileRouter.get('/:id', asyncHandler((req, res) => uploadController.getFile(req as any, res)));
fileRouter.delete('/:id', asyncHandler((req, res) => uploadController.deleteFile(req as any, res)));


// ============================================================
// PARTNER ROUTES (/api/v1/partner) - requires partner role
// ============================================================
const partnerRouter = Router();
partnerRouter.use(authenticate, authorize(['partner']));

// --- Hotels ---
partnerRouter.get('/hotels', validate(hotelQuerySchema, 'query'), asyncHandler((req, res) => hotelController.listMyHotels(req as any, res)));
partnerRouter.post('/hotels', validate(createHotelSchema), asyncHandler((req, res) => hotelController.create(req as any, res)));
partnerRouter.get('/hotels/:id', asyncHandler((req, res) => hotelController.getMyHotel(req as any, res)));
partnerRouter.put('/hotels/:id', validate(updateHotelSchema), asyncHandler((req, res) => hotelController.update(req as any, res)));
partnerRouter.post('/hotels/:id/submit', asyncHandler((req, res) => hotelController.submitForReview(req as any, res)));
partnerRouter.delete('/hotels/:id', asyncHandler((req, res) => hotelController.delete(req as any, res)));

partnerRouter.post('/hotels/:id/images', uploadMultipleImages, asyncHandler((req, res) => hotelController.uploadImages(req as any, res)));
partnerRouter.delete('/hotels/:id/images/:imageId', asyncHandler((req, res) => hotelController.deleteImage(req as any, res)));
partnerRouter.post('/hotels/:id/videos', uploadSingleVideo, asyncHandler((req, res) => hotelController.uploadVideo(req as any, res)));
partnerRouter.delete('/hotels/:id/videos/:videoId', asyncHandler((req, res) => hotelController.deleteVideo(req as any, res)));

// --- Room Types ---
partnerRouter.get('/hotels/:hotelId/room-types', asyncHandler((req, res) => roomController.listRoomTypes(req as any, res)));
partnerRouter.post('/hotels/:hotelId/room-types', validate(createRoomTypeSchema), asyncHandler((req, res) => roomController.createRoomType(req as any, res)));
partnerRouter.get('/hotels/:hotelId/room-types/:roomTypeId', asyncHandler((req, res) => roomController.getRoomType(req as any, res)));
partnerRouter.put('/hotels/:hotelId/room-types/:roomTypeId', validate(updateRoomTypeSchema), asyncHandler((req, res) => roomController.updateRoomType(req as any, res)));
partnerRouter.delete('/hotels/:hotelId/room-types/:roomTypeId', asyncHandler((req, res) => roomController.deleteRoomType(req as any, res)));

partnerRouter.post('/hotels/:hotelId/room-types/:roomTypeId/media', uploadMultipleImages, asyncHandler((req, res) => roomController.uploadMedia(req as any, res)));
partnerRouter.delete('/hotels/:hotelId/room-types/:roomTypeId/media/:mediaId', asyncHandler((req, res) => roomController.deleteMedia(req as any, res)));

// --- Room Units ---
partnerRouter.get('/hotels/:hotelId/room-types/:roomTypeId/units', asyncHandler((req, res) => roomController.listRoomUnits(req as any, res)));
partnerRouter.post('/hotels/:hotelId/room-types/:roomTypeId/units', validate(createRoomUnitSchema), asyncHandler((req, res) => roomController.createRoomUnit(req as any, res)));
partnerRouter.put('/hotels/:hotelId/room-types/:roomTypeId/units/:unitId', validate(updateRoomUnitSchema), asyncHandler((req, res) => roomController.updateRoomUnit(req as any, res)));
partnerRouter.delete('/hotels/:hotelId/room-types/:roomTypeId/units/:unitId', asyncHandler((req, res) => roomController.deleteRoomUnit(req as any, res)));

// --- Pricing ---
partnerRouter.get('/hotels/:hotelId/room-types/:roomTypeId/pricing', asyncHandler((req, res) => pricingController.listPricing(req as any, res)));
partnerRouter.post('/hotels/:hotelId/room-types/:roomTypeId/pricing', validate(createPricingSchema), asyncHandler((req, res) => pricingController.createPricing(req as any, res)));
partnerRouter.put('/hotels/:hotelId/room-types/:roomTypeId/pricing/:pricingId', validate(updatePricingSchema), asyncHandler((req, res) => pricingController.updatePricing(req as any, res)));
partnerRouter.delete('/hotels/:hotelId/room-types/:roomTypeId/pricing/:pricingId', asyncHandler((req, res) => pricingController.deletePricing(req as any, res)));

partnerRouter.get('/hotels/:hotelId/room-types/:roomTypeId/pricing/:pricingId/special-prices', asyncHandler((req, res) => pricingController.listSpecialPrices(req as any, res)));
partnerRouter.post('/hotels/:hotelId/room-types/:roomTypeId/pricing/:pricingId/special-prices', validate(createSpecialPriceSchema), asyncHandler((req, res) => pricingController.createSpecialPrice(req as any, res)));
partnerRouter.delete('/hotels/:hotelId/room-types/:roomTypeId/pricing/:pricingId/special-prices/:specialPriceId', asyncHandler((req, res) => pricingController.deleteSpecialPrice(req as any, res)));


// --- Inventory ---
partnerRouter.get('/hotels/:hotelId/inventory', (req, res, next) => inventoryController.getCalendar(req, res, next));
partnerRouter.put('/hotels/:hotelId/inventory/:roomTypeId', (req, res, next) => inventoryController.updateInventory(req, res, next));

// --- Vouchers ---
partnerRouter.get(
  '/hotels/:hotelId/vouchers',
  asyncHandler((req, res) => voucherController.list(req as any, res))
);

partnerRouter.post(
  '/hotels/:hotelId/vouchers',
  asyncHandler((req, res) => voucherController.create(req as any, res))
);

partnerRouter.post(
  '/hotels/:hotelId/vouchers/apply',
  asyncHandler((req, res) => voucherController.apply(req as any, res))
);

partnerRouter.get(
  '/hotels/:hotelId/vouchers/:voucherId',
  asyncHandler((req, res) => voucherController.get(req as any, res))
);

partnerRouter.put(
  '/hotels/:hotelId/vouchers/:voucherId',
  asyncHandler((req, res) => voucherController.update(req as any, res))
);

partnerRouter.delete(
  '/hotels/:hotelId/vouchers/:voucherId',
  asyncHandler((req, res) => voucherController.remove(req as any, res))
);
// --- Bookings ---
partnerRouter.get('/bookings', asyncHandler((req, res) => bookingController.listMyBookings(req as any, res)));
partnerRouter.patch('/bookings/:id/status', asyncHandler((req, res) => bookingController.updateStatus(req as any, res)));


// Export all routers
export default {
  publicRouter,
  fileRouter,
  partnerRouter,
};
