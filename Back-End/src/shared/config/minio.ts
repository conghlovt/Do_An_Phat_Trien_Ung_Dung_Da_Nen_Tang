// ============================================================
// MinIO Client Configuration + Bucket Initialization
// S3-compatible object storage for files, images, videos
// ============================================================

import { Client as MinioClient } from 'minio';

// ---- MinIO Client Singleton ----
export const minioClient = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

export const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || 'http://localhost:9000';

// ---- Bucket Definitions ----
export const BUCKETS = {
  HOTEL_IMAGES: 'hotel-images',
  HOTEL_VIDEOS: 'hotel-videos',
  ROOM_MEDIA: 'room-media',
  USER_AVATARS: 'user-avatars',
  VERIFICATION_DOCS: 'verification-docs',
} as const;

// Public buckets cho phép anonymous read
const PUBLIC_BUCKETS: string[] = [
  BUCKETS.HOTEL_IMAGES,
  BUCKETS.HOTEL_VIDEOS,
  BUCKETS.ROOM_MEDIA,
  BUCKETS.USER_AVATARS,
];

/**
 * Initialize all buckets on startup.
 */
export async function initializeBuckets(): Promise<void> {
  const allBuckets = Object.values(BUCKETS);

  for (const bucket of allBuckets) {
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
      await minioClient.makeBucket(bucket);
      console.log(`✅ Created bucket: ${bucket}`);
    }

    // Set public read policy cho public buckets
    if (PUBLIC_BUCKETS.includes(bucket)) {
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucket}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
    }
  }

  console.log('✅ MinIO buckets initialized');
}

/**
 * Check if a bucket is public
 */
export function isPublicBucket(bucket: string): boolean {
  return PUBLIC_BUCKETS.includes(bucket);
}

/**
 * Generate public URL for a file
 */
export function getPublicUrl(bucket: string, objectKey: string): string {
  return `${MINIO_PUBLIC_URL}/${bucket}/${objectKey}`;
}

/**
 * Generate presigned URL for private files
 */
export async function getPresignedUrl(
  bucket: string,
  objectKey: string,
  expiresInSeconds = 3600
): Promise<string> {
  return minioClient.presignedGetObject(bucket, objectKey, expiresInSeconds);
}
