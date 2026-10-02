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
    const rows = await db
      .select()
      .from(mediaBlobs)
      .where(eq(mediaBlobs.id, id))
      .limit(1);

    if (rows.length === 0) return null;

    const row = rows[0];
    const buffer = Buffer.from(row.dataBase64, 'base64');
    return {
      buffer,
      mimeType: row.mimeType,
      fileName: row.fileName,
    };
  }

  async deleteMedia(id: string): Promise<boolean> {
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
      .orderBy(desc(mediaBlobs.createdAt));

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
