// ============================================================
// Upload Service — MinIO operations + DB metadata
// Core service for all file uploads across the app
// ============================================================

import prisma from '../../login/lib/prisma';
import { minioClient, MINIO_PUBLIC_URL, isPublicBucket, getPresignedUrl } from '../../shared/config/minio';
import { NotFoundError } from '../../shared/errors/AppError';
import crypto from 'crypto';
import path from 'path';

// ---- Helper: Generate object key ----
function generateObjectKey(entityType: string, entityId: string, originalName: string): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 50);
  return `${entityType}/${entityId}/${timestamp}_${random}_${baseName}${ext}`;
}

// ---- Helper: Get file extension ----
function getExtension(filename: string): string {
  return path.extname(filename).replace('.', '').toLowerCase();
}

export class UploadService {

  /**
   * Upload a single file to MinIO + save metadata to DB
   */
  async uploadFile(
    file: Express.Multer.File,
    bucket: string,
    entityType: string,
    entityId: string,
    uploadedBy: string
  ) {
    const objectKey = generateObjectKey(entityType, entityId, file.originalname);

    // Upload to MinIO
    await minioClient.putObject(bucket, objectKey, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    // Save metadata to DB
    const fileRecord = await prisma.fileObject.create({
      data: {
        bucketName: bucket,
        objectKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: BigInt(file.size),
        extension: getExtension(file.originalname),
        isPublic: isPublicBucket(bucket),
        uploadedBy,
        entityType,
        entityId,
      },
    });

    return {
      id: fileRecord.id,
      url: this.getFileUrl(bucket, objectKey, fileRecord.isPublic),
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      bucketName: bucket,
      objectKey,
    };
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    files: Express.Multer.File[],
    bucket: string,
    entityType: string,
    entityId: string,
    uploadedBy: string
  ) {
    const results = [];
    for (const file of files) {
      const result = await this.uploadFile(file, bucket, entityType, entityId, uploadedBy);
      results.push(result);
    }
    return results;
  }

  /**
   * Soft-delete a file
   */
  async deleteFile(fileId: string, userId: string) {
    const file = await prisma.fileObject.findUnique({ where: { id: fileId } });
    if (!file) throw new NotFoundError('Không tìm thấy file', 'FILE_NOT_FOUND');
    // Only owner or admin can delete (admin check can be added later)
    if (file.uploadedBy !== userId) {
      throw new NotFoundError('Không tìm thấy file', 'FILE_NOT_FOUND');
    }

    await prisma.fileObject.update({
      where: { id: fileId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return true;
  }

  /**
   * Hard-delete a file (remove from MinIO + DB)
   */
  async hardDeleteFile(fileId: string) {
    const file = await prisma.fileObject.findUnique({ where: { id: fileId } });
    if (!file) return;

    // Remove from MinIO
    try {
      await minioClient.removeObject(file.bucketName, file.objectKey);
    } catch (err) {
      console.error('MinIO delete error:', err);
    }

    // Remove from DB
    await prisma.fileObject.delete({ where: { id: fileId } });
  }

  /**
   * Get file info
   */
  async getFile(fileId: string) {
    const file = await prisma.fileObject.findUnique({
      where: { id: fileId, isDeleted: false },
    });
    if (!file) throw new NotFoundError('Không tìm thấy file', 'FILE_NOT_FOUND');

    return {
      ...file,
      sizeBytes: Number(file.sizeBytes),
      url: await this.getFileUrlAsync(file.bucketName, file.objectKey, file.isPublic),
    };
  }

  /**
   * Get file URL — sync version for public, returns placeholder for private
   */
  getFileUrl(bucket: string, objectKey: string, isPublic: boolean): string {
    if (isPublic) {
      return `${MINIO_PUBLIC_URL}/${bucket}/${objectKey}`;
    }
    // For private files, caller should use getFileUrlAsync
    return `[presigned-url-required]`;
  }

  /**
   * Get file URL — async version, generates presigned for private
   */
  async getFileUrlAsync(bucket: string, objectKey: string, isPublic: boolean): Promise<string> {
    if (isPublic) {
      return `${MINIO_PUBLIC_URL}/${bucket}/${objectKey}`;
    }
    return getPresignedUrl(bucket, objectKey, 3600);
  }
}

export const uploadService = new UploadService();
