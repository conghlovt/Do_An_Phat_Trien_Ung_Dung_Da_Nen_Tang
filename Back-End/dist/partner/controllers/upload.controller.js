// ============================================================
// Upload Controller — File upload endpoints
// ============================================================
import { uploadService } from '../services/upload.service';
import { sendSuccess } from '../../shared/utils/response.util';
import { BadRequestError } from '../../shared/errors/AppError';
export class UploadController {
    /**
     * POST /api/v1/files/upload — Single file upload
     */
    async uploadSingle(req, res) {
        if (!req.file) {
            throw new BadRequestError('Không có file nào được gửi', 'FILE_REQUIRED');
        }
        const bucket = req.body.bucket || 'user-avatars';
        const entityType = req.body.entityType || 'general';
        const entityId = req.body.entityId || req.user.id;
        const file = await uploadService.uploadFile(req.file, bucket, entityType, entityId, req.user.id);
        sendSuccess(res, 201, 'FILE_UPLOADED', 'Upload file thành công', { file });
    }
    /**
     * POST /api/v1/files/upload-multiple — Multiple file upload
     */
    async uploadMultiple(req, res) {
        const files = req.files;
        if (!files || files.length === 0) {
            throw new BadRequestError('Không có file nào được gửi', 'FILE_REQUIRED');
        }
        const bucket = req.body.bucket || 'user-avatars';
        const entityType = req.body.entityType || 'general';
        const entityId = req.body.entityId || req.user.id;
        const uploadedFiles = await uploadService.uploadMultiple(files, bucket, entityType, entityId, req.user.id);
        sendSuccess(res, 201, 'FILES_UPLOADED', `Upload ${uploadedFiles.length} file thành công`, { files: uploadedFiles });
    }
    /**
     * GET /api/v1/files/:id — Get file info
     */
    async getFile(req, res) {
        const file = await uploadService.getFile(req.params.id);
        sendSuccess(res, 200, 'FILE_FETCHED', 'Lấy thông tin file thành công', { file });
    }
    /**
     * DELETE /api/v1/files/:id — Soft delete file
     */
    async deleteFile(req, res) {
        await uploadService.deleteFile(req.params.id, req.user.id);
        sendSuccess(res, 200, 'FILE_DELETED', 'Xóa file thành công');
    }
}
export const uploadController = new UploadController();
//# sourceMappingURL=upload.controller.js.map