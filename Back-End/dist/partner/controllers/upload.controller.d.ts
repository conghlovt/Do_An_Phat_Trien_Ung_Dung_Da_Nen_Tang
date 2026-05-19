import type { Response } from 'express';
import type { AuthRequest } from '../../login/middlewares/auth.middleware';
export declare class UploadController {
    /**
     * POST /api/v1/files/upload — Single file upload
     */
    uploadSingle(req: AuthRequest, res: Response): Promise<void>;
    /**
     * POST /api/v1/files/upload-multiple — Multiple file upload
     */
    uploadMultiple(req: AuthRequest, res: Response): Promise<void>;
    /**
     * GET /api/v1/files/:id — Get file info
     */
    getFile(req: AuthRequest, res: Response): Promise<void>;
    /**
     * DELETE /api/v1/files/:id — Soft delete file
     */
    deleteFile(req: AuthRequest, res: Response): Promise<void>;
}
export declare const uploadController: UploadController;
//# sourceMappingURL=upload.controller.d.ts.map