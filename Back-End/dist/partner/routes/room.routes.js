// ============================================================
// Room Routes — Partner only (nested under hotels)
// ============================================================
import { Router } from 'express';
import { roomController } from '../controllers/room.controller';
import { authenticate, authorize } from '../../login/middlewares/auth.middleware';
import { validate } from '../../login/middlewares/validate.middleware';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { uploadMultipleImages } from '../../login/middlewares/upload.middleware';
import { createRoomTypeSchema, updateRoomTypeSchema, createRoomUnitSchema, updateRoomUnitSchema } from '../middlewares/room.validator';
const router = Router({ mergeParams: true });
// All room routes require partner auth
router.use(authenticate, authorize(['partner']));
// ============================================================
// ROOM TYPES — /api/v1/partner/hotels/:hotelId/room-types
// ============================================================
router.get('/', asyncHandler((req, res) => roomController.listRoomTypes(req, res)));
router.post('/', validate(createRoomTypeSchema), asyncHandler((req, res) => roomController.createRoomType(req, res)));
router.get('/:roomTypeId', asyncHandler((req, res) => roomController.getRoomType(req, res)));
router.put('/:roomTypeId', validate(updateRoomTypeSchema), asyncHandler((req, res) => roomController.updateRoomType(req, res)));
router.delete('/:roomTypeId', asyncHandler((req, res) => roomController.deleteRoomType(req, res)));
// ============================================================
// ROOM UNITS — .../room-types/:roomTypeId/units
// ============================================================
router.get('/:roomTypeId/units', asyncHandler((req, res) => roomController.listRoomUnits(req, res)));
router.post('/:roomTypeId/units', validate(createRoomUnitSchema), asyncHandler((req, res) => roomController.createRoomUnit(req, res)));
router.put('/:roomTypeId/units/:unitId', validate(updateRoomUnitSchema), asyncHandler((req, res) => roomController.updateRoomUnit(req, res)));
router.delete('/:roomTypeId/units/:unitId', asyncHandler((req, res) => roomController.deleteRoomUnit(req, res)));
// ============================================================
// ROOM MEDIA — .../room-types/:roomTypeId/media (MinIO)
// ============================================================
router.post('/:roomTypeId/media', uploadMultipleImages, asyncHandler((req, res) => roomController.uploadMedia(req, res)));
router.delete('/:roomTypeId/media/:mediaId', asyncHandler((req, res) => roomController.deleteMedia(req, res)));
export const partnerRoomRoutes = router;
//# sourceMappingURL=room.routes.js.map