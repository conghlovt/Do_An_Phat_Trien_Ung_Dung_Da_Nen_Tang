// ============================================================
// Upload Controller — File upload endpoints
// ============================================================

import type { Response } from 'express';
import type { AuthRequest } from '../../login/middlewares/auth.middleware';
import { uploadService } from '../services/upload.service';
import { sendSuccess } from '../../shared/utils/response.util';
import { BadRequestError } from '../../shared/errors/AppError';

export class UploadController {

  /**
   * POST /api/v1/files/upload — Single file upload
   */
  async uploadSingle(req: AuthRequest, res: Response) {
    if (!req.file) {
      throw new BadRequestError('Không có file nào được gửi', 'FILE_REQUIRED');
    }

    const bucket = (req.body.bucket as string) || 'user-avatars';
    const entityType = (req.body.entityType as string) || 'general';
    const entityId = (req.body.entityId as string) || req.user!.id;

    const file = await uploadService.uploadFile(
      req.file, bucket, entityType, entityId, req.user!.id
    );

    sendSuccess(res, 201, 'FILE_UPLOADED', 'Upload file thành công', { file });
  }

  /**
   * POST /api/v1/files/upload-multiple — Multiple file upload
   */
  async uploadMultiple(req: AuthRequest, res: Response) {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new BadRequestError('Không có file nào được gửi', 'FILE_REQUIRED');
    }

    const bucket = (req.body.bucket as string) || 'user-avatars';
    const entityType = (req.body.entityType as string) || 'general';
    const entityId = (req.body.entityId as string) || req.user!.id;

    const uploadedFiles = await uploadService.uploadMultiple(
      files, bucket, entityType, entityId, req.user!.id
    );

    sendSuccess(res, 201, 'FILES_UPLOADED', `Upload ${uploadedFiles.length} file thành công`, { files: uploadedFiles });
  }

  /**
   * GET /api/v1/files/:id — Get file info
   */
  async getFile(req: AuthRequest, res: Response) {
    const file = await uploadService.getFile(req.params.id as string);
    sendSuccess(res, 200, 'FILE_FETCHED', 'Lấy thông tin file thành công', { file });
  }

  /**
   * DELETE /api/v1/files/:id — Soft delete file
   */
  async deleteFile(req: AuthRequest, res: Response) {
    await uploadService.deleteFile(req.params.id as string, req.user!.id);
    sendSuccess(res, 200, 'FILE_DELETED', 'Xóa file thành công');
  }
}

export const uploadController = new UploadController();
