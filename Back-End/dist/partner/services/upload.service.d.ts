export declare class UploadService {
    /**
     * Upload a single file to MinIO + save metadata to DB
     */
    uploadFile(file: Express.Multer.File, bucket: string, entityType: string, entityId: string, uploadedBy: string): Promise<{
        id: string;
        url: string;
        originalName: string;
        mimeType: string;
        size: number;
        bucketName: string;
        objectKey: string;
    }>;
    /**
     * Upload multiple files
     */
    uploadMultiple(files: Express.Multer.File[], bucket: string, entityType: string, entityId: string, uploadedBy: string): Promise<{
        id: string;
        url: string;
        originalName: string;
        mimeType: string;
        size: number;
        bucketName: string;
        objectKey: string;
    }[]>;
    /**
     * Soft-delete a file
     */
    deleteFile(fileId: string, userId: string): Promise<boolean>;
    /**
     * Hard-delete a file (remove from MinIO + DB)
     */
    hardDeleteFile(fileId: string): Promise<void>;
    /**
     * Get file info
     */
    getFile(fileId: string): Promise<{
        sizeBytes: number;
        url: string;
        id: string;
        createdAt: Date;
        uploadedBy: string;
        bucketName: string;
        objectKey: string;
        originalName: string;
        mimeType: string;
        extension: string;
        checksumMd5: string | null;
        isPublic: boolean;
        entityType: string | null;
        entityId: string | null;
        isDeleted: boolean;
        deletedAt: Date | null;
    }>;
    /**
     * Get file URL — sync version for public, returns placeholder for private
     */
    getFileUrl(bucket: string, objectKey: string, isPublic: boolean): string;
    /**
     * Get file URL — async version, generates presigned for private
     */
    getFileUrlAsync(bucket: string, objectKey: string, isPublic: boolean): Promise<string>;
}
export declare const uploadService: UploadService;
//# sourceMappingURL=upload.service.d.ts.map