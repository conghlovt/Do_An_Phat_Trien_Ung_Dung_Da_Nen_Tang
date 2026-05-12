// ============================================================
// Upload Routes — /api/v1/files
// ============================================================

import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { authenticate } from '../../login/middlewares/auth.middleware';
import { uploadGenericFile, uploadMultipleFiles } from '../../login/middlewares/upload.middleware';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

/** POST /api/v1/files/upload — Single file */
router.post('/upload',
  uploadGenericFile,
  asyncHandler((req, res) => uploadController.uploadSingle(req as any, res))
);

/** POST /api/v1/files/upload-multiple — Multiple files (max 10) */
router.post('/upload-multiple',
  uploadMultipleFiles,
  asyncHandler((req, res) => uploadController.uploadMultiple(req as any, res))
);

/** GET /api/v1/files/:id — Get file info */
router.get('/:id',
  asyncHandler((req, res) => uploadController.getFile(req as any, res))
);

/** DELETE /api/v1/files/:id — Soft delete file */
router.delete('/:id',
  asyncHandler((req, res) => uploadController.deleteFile(req as any, res))
);

export const uploadRoutes = router;
