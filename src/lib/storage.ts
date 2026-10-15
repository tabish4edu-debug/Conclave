import { db } from '../db/index.ts';
import { mediaBlobs, mediaUploads } from '../db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

export interface StorageProvider {
  upload(file: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    size: number;
    altText?: string;
  }): Promise<{ url: string; fileName: string; sizeBytes: number; id: string }>;
  
  getMedia(id: string): Promise<{
    buffer: Buffer;
    mimeType: string;
    fileName: string;
  } | null>;

  deleteMedia(id: string): Promise<boolean>;

  listMedia(): Promise<{
    id: string;
    url: string;
    fileName: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    altText?: string | null;
    createdAt: Date;
  }[]>;
}

/**
 * PostgreSQL Database Blob Storage Provider
 * 
 * Stores image binary data as base64 in the PostgreSQL database.
 * This guarantees 100% persistent storage on Cloud Run containers without loss
 * across container recycles, scale-to-zero events, or redeployments, with zero
 * dependency on ephemeral container filesystems.
 */
interface CachedMedia {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  sizeBytes: number;
  expiresAt: number;
}

const mediaCache = new Map<string, CachedMedia>();
let currentCacheBytes = 0;
const MAX_CACHE_BYTES = 50 * 1024 * 1024; // 50MB bounded cache
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes TTL for active streaming/viewing

function pruneMediaCache(neededBytes: number) {
  const now = Date.now();
  // First pass: purge expired
  for (const [key, item] of mediaCache.entries()) {
    if (now > item.expiresAt) {
      currentCacheBytes -= item.sizeBytes;
      mediaCache.delete(key);
    }
  }
  // Second pass: if still too large, purge oldest entries
  for (const [key, item] of mediaCache.entries()) {
    if (currentCacheBytes + neededBytes <= MAX_CACHE_BYTES) break;
    currentCacheBytes -= item.sizeBytes;
    mediaCache.delete(key);
  }
}

class DatabaseStorageProvider implements StorageProvider {
  async upload(file: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    size: number;
    altText?: string;
  }): Promise<{ url: string; fileName: string; sizeBytes: number; id: string }> {
    const sanitizedOriginal = file.originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const id = crypto.randomUUID();
    const fileName = `${id}-${sanitizedOriginal}`;
    const base64Data = file.buffer.toString('base64');
    const url = `/api/media/${id}`;

    // Store in persistent media_blobs
    await db.insert(mediaBlobs).values({
      id,
      fileName,
      originalName: file.originalName,
      mimeType: file.mimeType,
      sizeBytes: file.size,
      dataBase64: base64Data,
      altText: file.altText || null,
      createdAt: new Date(),
    });

    // Also log in media_uploads audit table
    await db.insert(mediaUploads).values({
      originalName: file.originalName,
      fileName,
      url,
      mimeType: file.mimeType,
      sizeBytes: file.size,
      createdAt: new Date(),
    });

    // Warm cache for immediate preview/playback
    if (file.size <= 25 * 1024 * 1024) {
      pruneMediaCache(file.size);
      if (currentCacheBytes + file.size <= MAX_CACHE_BYTES) {
        mediaCache.set(id, {
          buffer: file.buffer,
          mimeType: file.mimeType,
          fileName,
          sizeBytes: file.size,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });
        currentCacheBytes += file.size;
      }
    }

    return {
      id,
      url,
      fileName,
      sizeBytes: file.size,
    };
  }

  async getMedia(id: string): Promise<{
    buffer: Buffer;
    mimeType: string;
    fileName: string;
  } | null> {
    // 1. Strict ID format validation: prevents malformed IDs from hitting DB
    if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
      return null;
    }

    // 2. Check active in-memory cache (eliminates repeated DB queries on video seeking)
    const cached = mediaCache.get(id);
    if (cached && Date.now() <= cached.expiresAt) {
      return {
        buffer: cached.buffer,
        mimeType: cached.mimeType,
        fileName: cached.fileName,
      };
    }

    // 3. Fallback to PostgreSQL
    const rows = await db
      .select()
      .from(mediaBlobs)
      .where(eq(mediaBlobs.id, id))
      .limit(1);

    if (rows.length === 0) return null;

    const row = rows[0];
    const buffer = Buffer.from(row.dataBase64, 'base64');

    // 4. Cache in memory for subsequent chunks/seeks if under size threshold
    if (buffer.length <= 25 * 1024 * 1024) {
      pruneMediaCache(buffer.length);
      if (currentCacheBytes + buffer.length <= MAX_CACHE_BYTES) {
        const existing = mediaCache.get(id);
        if (existing) {
          currentCacheBytes -= existing.sizeBytes;
        }
        mediaCache.set(id, {
          buffer,
          mimeType: row.mimeType,
          fileName: row.fileName,
          sizeBytes: buffer.length,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });
        currentCacheBytes += buffer.length;
      }
    }

    return {
      buffer,
      mimeType: row.mimeType,
      fileName: row.fileName,
    };
  }

  async deleteMedia(id: string): Promise<boolean> {
    if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
      return false;
    }

    // Evict from active cache
    const cached = mediaCache.get(id);
    if (cached) {
      currentCacheBytes -= cached.sizeBytes;
      mediaCache.delete(id);
    }

    const deleted = await db
      .delete(mediaBlobs)
      .where(eq(mediaBlobs.id, id))
      .returning({ id: mediaBlobs.id });
    
    // Also remove from media_uploads if URL matches
    await db.delete(mediaUploads).where(eq(mediaUploads.url, `/api/media/${id}`));
    return deleted.length > 0;
  }

  async listMedia() {
    const rows = await db
      .select({
        id: mediaBlobs.id,
        fileName: mediaBlobs.fileName,
        originalName: mediaBlobs.originalName,
        mimeType: mediaBlobs.mimeType,
        sizeBytes: mediaBlobs.sizeBytes,
        altText: mediaBlobs.altText,
        createdAt: mediaBlobs.createdAt,
      })
      .from(mediaBlobs)
      .orderBy(desc(mediaBlobs.createdAt))
      .limit(200);

    return rows.map((r) => ({
      id: r.id,
      url: `/api/media/${r.id}`,
      fileName: r.fileName,
      originalName: r.originalName,
      mimeType: r.mimeType,
      sizeBytes: r.sizeBytes,
      altText: r.altText,
      createdAt: r.createdAt,
    }));
  }
}

// Active storage provider instance (can be swapped with S3 / GCS without changing consumers)
export const storageService: StorageProvider = new DatabaseStorageProvider();
