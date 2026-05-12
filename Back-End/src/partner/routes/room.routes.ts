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

router.get('/', asyncHandler((req, res) => roomController.listRoomTypes(req as any, res)));

router.post('/',
  validate(createRoomTypeSchema),
  asyncHandler((req, res) => roomController.createRoomType(req as any, res))
);

router.get('/:roomTypeId', asyncHandler((req, res) => roomController.getRoomType(req as any, res)));

router.put('/:roomTypeId',
  validate(updateRoomTypeSchema),
  asyncHandler((req, res) => roomController.updateRoomType(req as any, res))
);

router.delete('/:roomTypeId', asyncHandler((req, res) => roomController.deleteRoomType(req as any, res)));

// ============================================================
// ROOM UNITS — .../room-types/:roomTypeId/units
// ============================================================

router.get('/:roomTypeId/units', asyncHandler((req, res) => roomController.listRoomUnits(req as any, res)));

router.post('/:roomTypeId/units',
  validate(createRoomUnitSchema),
  asyncHandler((req, res) => roomController.createRoomUnit(req as any, res))
);

router.put('/:roomTypeId/units/:unitId',
  validate(updateRoomUnitSchema),
  asyncHandler((req, res) => roomController.updateRoomUnit(req as any, res))
);

router.delete('/:roomTypeId/units/:unitId', asyncHandler((req, res) => roomController.deleteRoomUnit(req as any, res)));

// ============================================================
// ROOM MEDIA — .../room-types/:roomTypeId/media (MinIO)
// ============================================================

router.post('/:roomTypeId/media',
  uploadMultipleImages,
  asyncHandler((req, res) => roomController.uploadMedia(req as any, res))
);

router.delete('/:roomTypeId/media/:mediaId',
  asyncHandler((req, res) => roomController.deleteMedia(req as any, res))
);

export const partnerRoomRoutes = router;
