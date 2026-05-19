import { Client as MinioClient } from 'minio';
export declare const minioClient: MinioClient;
export declare const MINIO_PUBLIC_URL: string;
export declare const BUCKETS: {
    readonly HOTEL_IMAGES: "hotel-images";
    readonly HOTEL_VIDEOS: "hotel-videos";
    readonly ROOM_MEDIA: "room-media";
    readonly USER_AVATARS: "user-avatars";
    readonly VERIFICATION_DOCS: "verification-docs";
};
/**
 * Initialize all buckets on startup.
 */
export declare function initializeBuckets(): Promise<void>;
/**
 * Check if a bucket is public
 */
export declare function isPublicBucket(bucket: string): boolean;
/**
 * Generate public URL for a file
 */
export declare function getPublicUrl(bucket: string, objectKey: string): string;
/**
 * Generate presigned URL for private files
 */
export declare function getPresignedUrl(bucket: string, objectKey: string, expiresInSeconds?: number): Promise<string>;
//# sourceMappingURL=minio.d.ts.map