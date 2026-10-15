import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import {
  requireAuth,
  requireSuperAdmin,
  AuthRequest,
  isLocalhostRequest,
  isAuthenticatedAdmin,
  extractSessionToken,
  isTrustedOrigin,
  isCookieAuthenticated,
  extractCsrfCookie,
  extractCsrfHeader,
  safeCompareTokens,
  isTrustedHost,
} from './src/middleware/auth.ts';
import { storageService } from './src/lib/storage.ts';
import { sanitizeHtml, sanitizeText } from './src/lib/sanitize.ts';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  duplicateProject,
  deleteProject,
  publishProject,
  getAllHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  publishHeroSlide,
  getAllStripItems,
  createStripItem,
  updateStripItem,
  deleteStripItem,
  getAllServices,
  createService,
  updateService,
  deleteService,
  publishService,
  getTestimonials,
  submitTestimonial,
  moderateTestimonial,
  deleteTestimonial,
  getAllEnquiries,
  createEnquiry,
  updateEnquiryStatus,
  deleteEnquiry,
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  publishFaq,
  getSiteSettings,
  updateSiteSettings,
  getAboutStudio,
  updateAboutStudio,
  getUnpublishedChangesSummary,
  publishBatch,
  getPublicationHistory,
  getOrCreateUser,
  seedInitialDatabaseIfEmpty,
  initAdminAccount,
  findUserByEmail,
  findUserById,
  createSession,
  verifySessionToken,
  deleteSession,
  deleteUserSessions,
  updateUserPassword,
  cleanExpiredSessions,
} from './src/db/service.ts';
import { closePool } from './src/db/index.ts';

// In-memory sliding window IP rate limiter for public submission endpoints
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) {
  const store = new Map<string, RateLimitRecord>();

  // Periodically clean up expired entries
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp =
      (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : undefined) ||
      req.ip ||
      req.socket.remoteAddress ||
      'unknown-client';

    const now = Date.now();
    const record = store.get(clientIp);

    if (!record || now > record.resetTime) {
      store.set(clientIp, {
        count: 1,
        resetTime: now + options.windowMs,
      });
      return next();
    }

    if (record.count >= options.maxRequests) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        error: options.message || 'Too many submissions. Please wait before submitting again.',
        retryAfterSeconds: retryAfterSec,
      });
    }

    record.count += 1;
    next();
  };
}

// Dedicated login brute-force limiter (tracks IP and email, max 5 failed attempts per 15 minutes)
interface LoginAttemptRecord {
  attempts: number;
  resetTime: number;
}

const loginIpAttempts = new Map<string, LoginAttemptRecord>();
const loginEmailAttempts = new Map<string, LoginAttemptRecord>();

setInterval(() => {
  const now = Date.now();
  for (const [ip, r] of loginIpAttempts.entries()) {
    if (now > r.resetTime) loginIpAttempts.delete(ip);
  }
  for (const [email, r] of loginEmailAttempts.entries()) {
    if (now > r.resetTime) loginEmailAttempts.delete(email);
  }
}, 5 * 60 * 1000).unref();

function checkLoginBruteForce(clientIp: string, normalizedEmail: string): { blocked: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const ipRec = loginIpAttempts.get(clientIp);
  if (ipRec && now <= ipRec.resetTime && ipRec.attempts >= 5) {
    return { blocked: true, retryAfterSeconds: Math.ceil((ipRec.resetTime - now) / 1000) };
  }
  const emailRec = loginEmailAttempts.get(normalizedEmail);
  if (emailRec && now <= emailRec.resetTime && emailRec.attempts >= 5) {
    return { blocked: true, retryAfterSeconds: Math.ceil((emailRec.resetTime - now) / 1000) };
  }
  return { blocked: false };
}

function recordFailedLogin(clientIp: string, normalizedEmail: string) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;

  const ipRec = loginIpAttempts.get(clientIp);
  if (!ipRec || now > ipRec.resetTime) {
    loginIpAttempts.set(clientIp, { attempts: 1, resetTime: now + windowMs });
  } else {
    ipRec.attempts += 1;
  }

  const emailRec = loginEmailAttempts.get(normalizedEmail);
  if (!emailRec || now > emailRec.resetTime) {
    loginEmailAttempts.set(normalizedEmail, { attempts: 1, resetTime: now + windowMs });
  } else {
    emailRec.attempts += 1;
  }
}

function resetFailedLogin(clientIp: string, normalizedEmail: string) {
  loginIpAttempts.delete(clientIp);
  loginEmailAttempts.delete(normalizedEmail);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Trust reverse proxy (e.g. Render / Cloud Run) for accurate client IP extraction
  app.set('trust proxy', 1);

  // Local fallback uploads directory for initial local files
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Rate limiter for public form submissions (5 submissions per 15 minutes per IP)
  const publicFormLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many submissions from this IP address. Please try again in 15 minutes.',
  });

  const MAX_PHOTO_BYTES = 15 * 1024 * 1024; // 15MB limit for high-res architectural photographs
  const MAX_VIDEO_BYTES = 40 * 1024 * 1024; // 40MB limit for project walkthrough videos

  // Configure Memory Storage for persistent cloud database storage (Images & Videos)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_VIDEO_BYTES },
    fileFilter: (_req, file, cb) => {
      const mime = file.mimetype.toLowerCase();
      // SVG files are active XML/script vectors and disallowed for project photos/videos
      if (mime.includes('svg')) {
        return cb(new Error('Vector XML/SVG files are not permitted for project media. Please upload photographic images (JPEG, PNG, WebP, AVIF) or video files (MP4, WebM, MOV, OGG).'));
      }
      if (mime.startsWith('image/') || mime.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only standard photographic image formats (JPEG, PNG, WebP, AVIF) and video formats (MP4, WebM, MOV, OGG) are permitted.'));
      }
    },
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const rawSessionSecret = process.env.SESSION_SECRET?.trim();

  let sessionSecret: string;
  if (isProduction) {
    if (!rawSessionSecret || rawSessionSecret.length < 32) {
      console.error(
        '[FATAL CONFIGURATION ERROR] In production, SESSION_SECRET must be supplied as an environment variable with a minimum length of 32 characters.'
      );
      process.exit(1);
    }
    const devPlaceholderSecrets = [
      'conclave_atelier_session_secret',
      'conclave_atelier_dev_session_secret_32chars_long!',
      'generate_a_random_32_character_hex_or_base64_secret_here',
      'changeme123456789012345678901234',
    ];
    if (devPlaceholderSecrets.includes(rawSessionSecret)) {
      console.error(
        '[FATAL CONFIGURATION ERROR] In production, SESSION_SECRET cannot use a development placeholder value. Supply a unique, high-entropy secret.'
      );
      process.exit(1);
    }
    sessionSecret = rawSessionSecret;
  } else {
    // In development, allow convenient fallback if not supplied
    sessionSecret = rawSessionSecret && rawSessionSecret.length >= 32
      ? rawSessionSecret
      : 'conclave_atelier_dev_session_secret_32chars_long!';
  }

  // Global HTTP Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // HSTS (HTTP Strict Transport Security): Only in production over HTTPS
    if (isProduction && (req.secure || req.headers['x-forwarded-proto'] === 'https')) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    // Content Security Policy tailored for high-end portfolio applet & AI Studio iframe embedding
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.unsplash.com",
      "media-src 'self' blob: data:",
      "connect-src 'self' ws: wss: https:",
      "frame-ancestors 'self' https://*.google.com https://*.run.app https://aistudio.google.com https://localhost.corp.google.com:26001",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');
    res.setHeader('Content-Security-Policy', csp);

    // Prevent caching on sensitive authentication and administration endpoints
    if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/admin')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    next();
  });

  app.use(cookieParser(sessionSecret || 'conclave_atelier_session_secret'));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Strict CORS / Origin policy for admin endpoints
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      process.env.APP_URL,
      process.env.RENDER_EXTERNAL_URL,
      process.env.RENDER_EXTERNAL_HOSTNAME ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : undefined,
    ].filter(Boolean) as string[];

    const isDevelopment = process.env.NODE_ENV !== 'production';

    let isAllowed = !origin;
    if (origin) {
      if (allowedOrigins.includes(origin)) {
        isAllowed = true;
      } else if (isDevelopment && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
        isAllowed = true;
      } else {
        try {
          const originHost = new URL(origin).hostname;
          isAllowed = isTrustedHost(originHost);
        } catch {
          isAllowed = false;
        }
      }
    }

    if (origin && isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Client, X-Session-Token, X-CSRF-Token'
      );
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    }
    if (req.method === 'OPTIONS') {
      return isAllowed ? res.sendStatus(200) : res.sendStatus(403);
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'CONCLAVE INTERIORS Atelier Admin API',
      database: 'PostgreSQL',
      mediaStorage: 'Persistent Online Storage (Database Blobs / Abstracted)',
      timestamp: new Date().toISOString(),
    });
  });

  // Seed DB if empty & Initialize Administrator Account
  initAdminAccount().catch((err) => {
    console.error('Administrator account initialization error:', err);
  });
  seedInitialDatabaseIfEmpty().catch((err) => {
    console.error('Initial DB seeding background error:', err);
  });

  // Periodic background cleanup of expired PostgreSQL session tokens
  setInterval(() => {
    cleanExpiredSessions().catch(() => {});
  }, 15 * 60 * 1000).unref();

  // -------------------------------------------------------------
  // PERSISTENT ONLINE MEDIA STREAMING & MANAGEMENT
  // -------------------------------------------------------------
  app.get('/api/media/:id', async (req, res) => {
    try {
      const mediaId = req.params.id;
      if (!mediaId || typeof mediaId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(mediaId)) {
        return res.status(400).json({ error: 'Invalid media identifier.' });
      }

      const media = await storageService.getMedia(mediaId);
      if (!media) {
        return res.status(404).json({ error: 'Media not found' });
      }

      res.setHeader('Content-Type', media.mimeType);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; media-src 'self'; style-src 'unsafe-inline'");

      const etag = `"${mediaId}-${media.buffer.length}"`;
      res.setHeader('ETag', etag);

      // Support HTTP 304 conditional requests when media has not changed
      if (!req.headers.range && req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }

      const safeFileName = media.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      res.setHeader('Content-Disposition', `inline; filename="${safeFileName}"`);

      // Video range streaming support (seeking, scrub bar, chunk buffering - RFC 7233)
      const range = req.headers.range;
      const ifRange = req.headers['if-range'];
      const isRangeAllowed = !ifRange || ifRange === etag;

      if (range && isRangeAllowed && range.startsWith('bytes=') && media.mimeType.startsWith('video/')) {
        const rangeVal = range.replace('bytes=', '').trim();
        const parts = rangeVal.split('-');
        let start = parseInt(parts[0], 10);
        let end = parts[1] ? parseInt(parts[1], 10) : media.buffer.length - 1;

        // Handle suffix byte ranges e.g. bytes=-500 (last 500 bytes)
        if (isNaN(start) && !isNaN(end)) {
          start = Math.max(0, media.buffer.length - end);
          end = media.buffer.length - 1;
        } else if (isNaN(start)) {
          start = 0;
        }

        if (isNaN(end) || end >= media.buffer.length) {
          end = media.buffer.length - 1;
        }

        // RFC 7233 Section 4.4: Range Not Satisfiable
        if (start >= media.buffer.length || start > end || start < 0) {
          res.status(416);
          res.setHeader('Content-Range', `bytes */${media.buffer.length}`);
          return res.end();
        }

        const chunkSize = end - start + 1;
        // Zero-copy subarray view prevents unnecessary heap allocations during playback seeking
        const fileChunk = media.buffer.subarray(start, end + 1);

        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${media.buffer.length}`);
        res.setHeader('Content-Length', chunkSize);
        return res.send(fileChunk);
      }

      res.setHeader('Content-Length', media.buffer.length);
      return res.send(media.buffer);
    } catch (error: any) {
      console.error(`Error serving media ${req.params.id}:`, error);
      return res.status(500).json({ error: 'Failed to retrieve media file' });
    }
  });

  // Fallback for static files on local filesystem (e.g. initial seed assets)
  app.use('/uploads', express.static(uploadsDir));

  // Strict Rate limiter for administrator authentication (10 attempts per 15 minutes per IP)
  const loginRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    message: 'Too many authentication attempts. Please wait 15 minutes before retrying.',
  });

  // Server-side binary signature validation to prevent executable / malicious uploads
  function validateFileBufferSignature(buffer: Buffer, mimetype: string): { isValid: boolean; detectedType?: string } {
    if (!buffer || buffer.length < 8) return { isValid: false };

    // Explicitly reject SVG active content (scripts, XML entities)
    if (mimetype.includes('svg') || buffer.toString('utf8', 0, Math.min(buffer.length, 512)).toLowerCase().includes('<svg')) {
      return { isValid: false, detectedType: 'unsupported/svg' };
    }

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { isValid: mimetype.startsWith('image/'), detectedType: 'image/jpeg' };
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return { isValid: mimetype.startsWith('image/'), detectedType: 'image/png' };
    }

    // WebP: RIFF ... WEBP
    if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
      return { isValid: mimetype.startsWith('image/'), detectedType: 'image/webp' };
    }

    // GIF: GIF8
    if (buffer.toString('ascii', 0, 4).startsWith('GIF8')) {
      return { isValid: mimetype.startsWith('image/'), detectedType: 'image/gif' };
    }

    // ISO Box (MP4, QuickTime MOV, AVIF)
    if (buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp') {
      const brand = buffer.toString('ascii', 8, 12).toLowerCase();
      // AVIF image format
      if (brand === 'avif' || brand === 'avis') {
        return { isValid: mimetype.startsWith('image/'), detectedType: 'image/avif' };
      }
      // QuickTime MOV
      if (brand === 'qt  ') {
        return { isValid: mimetype.startsWith('video/'), detectedType: 'video/quicktime' };
      }
      // MP4 video
      return { isValid: mimetype.startsWith('video/'), detectedType: 'video/mp4' };
    }

    // QuickTime MOV without ftyp (moov, wide, mdat, free)
    if (buffer.length >= 8 && ['moov', 'wide', 'mdat', 'free'].includes(buffer.toString('ascii', 4, 8))) {
      return { isValid: mimetype.startsWith('video/'), detectedType: 'video/quicktime' };
    }

    // WebM: 1A 45 DF A3
    if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
      return { isValid: mimetype.startsWith('video/'), detectedType: 'video/webm' };
    }

    // OGG: OggS
    if (buffer.toString('ascii', 0, 4) === 'OggS') {
      return { isValid: mimetype.startsWith('video/'), detectedType: 'video/ogg' };
    }

    return { isValid: false };
  }

  // Upload image or video to persistent online storage (Authenticated Administrator Only)
  app.post('/api/upload', requireAuth, (req, res, next) => {
    upload.any()(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Media upload rejected' });
      }
      next();
    });
  }, async (req: AuthRequest, res) => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      const file = (files && files.length > 0) ? files[0] : (req as any).file;
      if (!file) {
        return res.status(400).json({ error: 'No media file uploaded' });
      }

      const isVideo = file.mimetype.startsWith('video/');
      if (!isVideo && file.size > MAX_PHOTO_BYTES) {
        return res.status(400).json({
          error: `Photograph exceeds maximum permitted size of 15MB (received ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
        });
      }
      if (isVideo && file.size > MAX_VIDEO_BYTES) {
        return res.status(400).json({
          error: `Video exceeds maximum permitted size of 40MB (received ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
        });
      }

      // Strict server-side binary inspection (do not trust browser MIME type or file extension alone)
      const inspection = validateFileBufferSignature(file.buffer, file.mimetype);
      if (!inspection.isValid) {
        return res.status(400).json({
          error: inspection.detectedType === 'unsupported/svg'
            ? 'Vector XML/SVG files are not permitted. Please upload photographic images (JPEG, PNG, WebP, AVIF) or video files (MP4, WebM, MOV, OGG).'
            : 'Uploaded file binary content does not match allowed photograph or video signatures.',
        });
      }

      const altText = req.body.altText ? sanitizeText(req.body.altText) : undefined;

      const result = await storageService.upload({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        altText,
      });

      // Mirror to local disk if running in development for instant local preview fallback
      try {
        const localPath = path.join(uploadsDir, result.fileName);
        fs.writeFileSync(localPath, file.buffer);
      } catch (err) {
        // Disk write failure on read-only cloud environments is expected and benign
      }

      res.status(201).json({
        success: true,
        url: result.url,
        filename: result.fileName,
        size: result.sizeBytes,
        id: result.id,
        mimeType: file.mimetype,
        isVideo,
      });
    } catch (error: any) {
      console.error('Upload processing error:', error);
      res.status(500).json({ error: error.message || 'Upload processing failed' });
    }
  });

  // List all media files in the library (Authenticated Admin Only)
  app.get('/api/media', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const list = await storageService.listMedia();
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to list media' });
    }
  });

  // Delete media from library (Authenticated Admin Only, with reference integrity protection)
  app.delete('/api/media/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const mediaId = req.params.id;
      if (!mediaId || typeof mediaId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(mediaId)) {
        return res.status(400).json({ error: 'Invalid media identifier.' });
      }

      // Check whether this media is in active use across projects to prevent broken images/videos
      const mediaUrl = `/api/media/${mediaId}`;
      const allProjects = await getAllProjects(false).catch(() => []);
      const inUseProject = allProjects.find((p) => {
        if (p.coverImage === mediaUrl || p.videoUrl === mediaUrl) return true;
        return Array.isArray(p.galleryImages) && p.galleryImages.some((img) => img.url === mediaUrl);
      });

      if (inUseProject) {
        return res.status(409).json({
          error: `Cannot delete media: file is currently in active use by project "${inUseProject.title}". Please detach it from the project before deleting.`,
        });
      }

      const success = await storageService.deleteMedia(mediaId);
      if (!success) {
        return res.status(404).json({ error: 'Media record not found.' });
      }
      res.json({ success: true, deletedId: mediaId });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete media file' });
    }
  });

  // -------------------------------------------------------------
  // POSTGRESQL ADMIN SESSION AUTHENTICATION
  // -------------------------------------------------------------
  const isHttps = isProduction || Boolean(process.env.APP_URL?.startsWith('https'));
  const sessionCookieOptions: express.CookieOptions = {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
    signed: true,
  };
  const csrfCookieOptions: express.CookieOptions = {
    httpOnly: false,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };

  // Administrator Login Endpoint (Protected with Rate Limiter, Brute-Force Tracker & bcrypt Verification)
  app.post('/api/auth/login', loginRateLimiter, async (req, res) => {
    try {
      if (!isTrustedOrigin(req)) {
        return res.status(403).json({ error: 'Untrusted request origin.' });
      }

      const clientIp =
        (typeof req.headers['x-forwarded-for'] === 'string' ? req.headers['x-forwarded-for'].split(',')[0].trim() : undefined) ||
        req.ip ||
        req.socket.remoteAddress ||
        'unknown-client';

      const email = req.body.email ? String(req.body.email).trim().toLowerCase() : '';
      const password = req.body.password ? String(req.body.password) : '';

      // Check targeted IP and email brute-force protection
      const bruteCheck = checkLoginBruteForce(clientIp, email);
      if (bruteCheck.blocked) {
        res.setHeader('Retry-After', String(bruteCheck.retryAfterSeconds || 900));
        return res.status(429).json({
          error: 'Too many failed login attempts. Authentication temporarily suspended for 15 minutes.',
          retryAfterSeconds: bruteCheck.retryAfterSeconds,
        });
      }

      if (!email || !password) {
        recordFailedLogin(clientIp, email || 'empty');
        return res.status(400).json({ error: 'Administrator email and password are required.' });
      }

      const user = await findUserByEmail(email);
      if (!user || user.role !== 'admin' || !user.passwordHash) {
        recordFailedLogin(clientIp, email);
        return res.status(401).json({ error: 'Invalid administrator email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        recordFailedLogin(clientIp, email);
        return res.status(401).json({ error: 'Invalid administrator email or password.' });
      }

      // Reset brute force counter on successful authentication
      resetFailedLogin(clientIp, email);

      // Invalidate existing session for this client to prevent session fixation
      const existingToken = extractSessionToken(req);
      if (existingToken) {
        await deleteSession(existingToken).catch(() => {});
      }

      // Issue cryptographically random session token and insert into PostgreSQL sessions table
      const { rawToken } = await createSession(user.id, 7);
      const csrfToken = crypto.randomBytes(32).toString('hex');

      res.cookie('conclave_session', rawToken, sessionCookieOptions);
      res.cookie('conclave_csrf', csrfToken, csrfCookieOptions);

      return res.json({
        success: true,
        authenticated: true,
        user: {
          id: user.id,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Studio Principal',
          role: user.role,
        },
        csrfToken,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Failed to process administrator login.' });
    }
  });

  // Administrator Logout Endpoint (Protected against Cross-Site Forgery, Invalidates PostgreSQL Session)
  app.post('/api/auth/logout', async (req, res) => {
    try {
      if (isCookieAuthenticated(req)) {
        if (!isTrustedOrigin(req)) {
          return res.status(403).json({ error: 'Untrusted logout origin.' });
        }
        const cookieCsrf = extractCsrfCookie(req);
        const headerCsrf = extractCsrfHeader(req);
        if (cookieCsrf && headerCsrf && !safeCompareTokens(cookieCsrf, headerCsrf)) {
          return res.status(403).json({ error: 'CSRF token mismatch on logout.' });
        }
      }

      const token = extractSessionToken(req);
      if (token) {
        await deleteSession(token).catch(() => {});
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      res.clearCookie('conclave_session', { path: '/' });
      res.clearCookie('conclave_csrf', { path: '/' });
      return res.json({ success: true, message: 'Logged out successfully.' });
    }
  });

  // Current Session Endpoint (Strictly Validates Session against PostgreSQL sessions table)
  app.get('/api/auth/session', async (req, res) => {
    try {
      const token = extractSessionToken(req);
      if (!token) {
        return res.json({ authenticated: false, user: null });
      }

      const verified = await verifySessionToken(token);
      if (!verified || !verified.user || verified.user.role !== 'admin') {
        res.clearCookie('conclave_session', { path: '/' });
        return res.json({ authenticated: false, user: null });
      }

      let csrfToken = extractCsrfCookie(req);
      if (!csrfToken) {
        csrfToken = crypto.randomBytes(32).toString('hex');
        res.cookie('conclave_csrf', csrfToken, csrfCookieOptions);
      }

      return res.json({
        authenticated: true,
        user: {
          id: verified.user.id,
          uid: verified.user.uid,
          email: verified.user.email,
          displayName: verified.user.displayName || 'Studio Principal',
          role: verified.user.role,
        },
        csrfToken,
      });
    } catch (error: any) {
      console.error('Session retrieval error:', error);
      return res.json({ authenticated: false, user: null });
    }
  });

  // -------------------------------------------------------------
  // RESTRICTED ADMIN PANEL API: PHOTOS & VIDEOS SPECIFIC MANAGEMENT
  // -------------------------------------------------------------

  // 1. Add photograph to a project (as gallery image or cover image)
  app.post('/api/admin/projects/:id/photos', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
        return res.status(400).json({ error: 'Invalid project identifier.' });
      }

      const { url, alt, caption, setAsCover } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Photograph URL is required.' });
      }

      const proj = await getProjectById(id, true);
      if (!proj) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      const sanitizedUrl = url.trim();
      const sanitizedAlt = alt ? sanitizeText(alt) : proj.title;
      const sanitizedCaption = caption ? sanitizeText(caption) : undefined;

      const gallery = Array.isArray(proj.galleryImages) ? [...proj.galleryImages] : [];
      if (!gallery.some((img) => img.url === sanitizedUrl)) {
        gallery.push({ url: sanitizedUrl, alt: sanitizedAlt, caption: sanitizedCaption });
      }

      const updates: any = {
        galleryImages: gallery,
      };

      if (setAsCover) {
        updates.coverImage = sanitizedUrl;
      }

      const updated = await updateProject(id, updates);
      return res.json({ success: true, project: updated });
    } catch (error: any) {
      console.error('Error adding photo to project:', error);
      return res.status(500).json({ error: 'Failed to add photo to project.' });
    }
  });

  // 2. Set designated cover photograph for a project
  app.put('/api/admin/projects/:id/cover', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
        return res.status(400).json({ error: 'Invalid project identifier.' });
      }

      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Photograph URL is required.' });
      }

      const proj = await getProjectById(id, true);
      if (!proj) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      const updated = await updateProject(id, { coverImage: url.trim() });
      return res.json({ success: true, project: updated });
    } catch (error: any) {
      console.error('Error setting cover photo:', error);
      return res.status(500).json({ error: 'Failed to set cover photo.' });
    }
  });

  // 3. Delete photograph from a project
  app.delete('/api/admin/projects/:id/photos', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
        return res.status(400).json({ error: 'Invalid project identifier.' });
      }

      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Photograph URL is required.' });
      }

      const proj = await getProjectById(id, true);
      if (!proj) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      const targetUrl = url.trim();
      const currentGallery = Array.isArray(proj.galleryImages) ? proj.galleryImages : [];
      const updatedGallery = currentGallery.filter((img) => img.url !== targetUrl);

      const updates: any = {
        galleryImages: updatedGallery,
      };

      if (proj.coverImage === targetUrl) {
        updates.coverImage = updatedGallery.length > 0
          ? updatedGallery[0].url
          : '/images/projects/monolithic-travertine-pavilion.jpg';
      }

      const updated = await updateProject(id, updates);

      // Safe media deletion: check if referenced elsewhere before removing blob from storage
      if (targetUrl.startsWith('/api/media/')) {
        const mediaId = targetUrl.replace('/api/media/', '');
        const allProjects = await getAllProjects(true).catch(() => []);
        const isReferencedElsewhere = allProjects.some((p) => {
          if (p.id === id) return false;
          if (p.coverImage === targetUrl || p.videoUrl === targetUrl) return true;
          return Array.isArray(p.galleryImages) && p.galleryImages.some((img) => img.url === targetUrl);
        });
        if (!isReferencedElsewhere) {
          try {
            await storageService.deleteMedia(mediaId);
          } catch {
            // ignore
          }
        }
      }

      return res.json({ success: true, project: updated });
    } catch (error: any) {
      console.error('Error deleting photo from project:', error);
      return res.status(500).json({ error: 'Failed to delete photo.' });
    }
  });

  // 4. Attach/replace video on a project
  app.post('/api/admin/projects/:id/video', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
        return res.status(400).json({ error: 'Invalid project identifier.' });
      }

      const { videoUrl } = req.body;
      if (!videoUrl || typeof videoUrl !== 'string') {
        return res.status(400).json({ error: 'Video URL is required.' });
      }

      const proj = await getProjectById(id, true);
      if (!proj) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      const updated = await updateProject(id, { videoUrl: videoUrl.trim() });
      return res.json({ success: true, project: updated });
    } catch (error: any) {
      console.error('Error attaching video to project:', error);
      return res.status(500).json({ error: 'Failed to attach video.' });
    }
  });

  // 5. Delete video from a project
  app.delete('/api/admin/projects/:id/video', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
        return res.status(400).json({ error: 'Invalid project identifier.' });
      }

      const proj = await getProjectById(id, true);
      if (!proj) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      const oldVideoUrl = proj.videoUrl;
      const updated = await updateProject(id, { videoUrl: null });

      // Clean up storage if not referenced elsewhere
      if (oldVideoUrl && oldVideoUrl.startsWith('/api/media/')) {
        const mediaId = oldVideoUrl.replace('/api/media/', '');
        const allProjects = await getAllProjects(true).catch(() => []);
        const isReferenced = allProjects.some((p) => p.id !== id && p.videoUrl === oldVideoUrl);
        if (!isReferenced) {
          try {
            await storageService.deleteMedia(mediaId);
          } catch {
            // ignore
          }
        }
      }

      return res.json({ success: true, project: updated });
    } catch (error: any) {
      console.error('Error deleting video from project:', error);
      return res.status(500).json({ error: 'Failed to delete video.' });
    }
  });

  // Backward-compatible auth verification check
  app.post('/api/auth/verify', requireAuth, async (req: AuthRequest, res) => {
    return res.json({
      authenticated: true,
      user: req.user,
      isLocal: isLocalhostRequest(req),
    });
  });

  // Secure Password Change Endpoint
  app.post('/api/auth/change-password', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'Current password, new password, and confirmation are required.' });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New password and confirmation do not match.' });
      }
      if (typeof newPassword !== 'string' || newPassword.length < 12) {
        return res.status(400).json({ error: 'New password must be at least 12 characters long.' });
      }

      const user = await findUserById(req.user!.id);
      if (!user || !user.passwordHash) {
        return res.status(400).json({ error: 'Administrator account not found.' });
      }

      const currentMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!currentMatch) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }

      const newHash = await bcrypt.hash(newPassword, 12);
      await updateUserPassword(user.id, newHash);

      // Invalidate existing sessions and generate fresh session
      await deleteUserSessions(user.id);
      const { rawToken } = await createSession(user.id, 7);
      const csrfToken = crypto.randomBytes(32).toString('hex');

      res.cookie('conclave_session', rawToken, sessionCookieOptions);
      res.cookie('conclave_csrf', csrfToken, csrfCookieOptions);

      return res.json({
        success: true,
        message: 'Administrator password changed successfully.',
        csrfToken,
      });
    } catch (error: any) {
      console.error('Password change error:', error);
      return res.status(500).json({ error: 'Failed to change administrator password.' });
    }
  });

  // -------------------------------------------------------------
  // PUBLICATION WORKFLOW & AUDIT HISTORY
  // -------------------------------------------------------------
  app.get('/api/admin/publication-status', requireSuperAdmin, async (_req: AuthRequest, res) => {
    try {
      const status = await getUnpublishedChangesSummary();
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch publication status' });
    }
  });

  app.post('/api/admin/publish-batch', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const note = req.body.notes ? sanitizeText(req.body.notes) : undefined;
      const result = await publishBatch(
        user.displayName || 'Studio Administrator',
        user.email || process.env.ADMIN_EMAIL || 'conclaveinteriorexterior@gmail.com',
        note
      );
      res.json(result);
    } catch (error: any) {
      console.error('Batch publish error:', error);
      res.status(500).json({ error: error.message || 'Failed to publish changes live' });
    }
  });

  app.get('/api/admin/publication-history', requireSuperAdmin, async (_req: AuthRequest, res) => {
    try {
      const history = await getPublicationHistory();
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch publication history' });
    }
  });

  // -------------------------------------------------------------
  // PROJECTS CMS
  // -------------------------------------------------------------
  // Public GET returns ONLY published projects unless admin explicitly requests drafts
  app.get('/api/projects', async (req, res) => {
    try {
      const wantsDrafts = req.query.drafts === 'true';
      const includeDrafts = wantsDrafts && (await isAuthenticatedAdmin(req));
      const data = await getAllProjects(!includeDrafts);
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const wantsDrafts = req.query.drafts === 'true';
      const includeDrafts = wantsDrafts && (await isAuthenticatedAdmin(req));
      const data = await getProjectById(req.params.id, !includeDrafts);
      if (!data) return res.status(404).json({ error: 'Project not found' });
      res.json(data);
    } catch (error: any) {
      console.error(`Error fetching project ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  });

  app.post('/api/projects', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const generatedId = req.body.id || req.body.slug || `proj-${Date.now()}`;
      const payload: any = {
        ...req.body,
        id: generatedId,
        slug: req.body.slug || generatedId,
        category: req.body.category || 'Residential',
        location: sanitizeText(req.body.location || ''),
        year: req.body.year ? String(req.body.year) : new Date().getFullYear().toString(),
        areaSqFt: req.body.areaSqFt ?? req.body.area_sq_ft ?? null,
        description: sanitizeHtml(req.body.description || ''),
        architecturalBrief: sanitizeHtml(req.body.architecturalBrief || req.body.architectural_brief || ''),
        title: sanitizeText(req.body.title || 'Untitled Monograph'),
        coverImage: req.body.coverImage || req.body.cover_image || '/images/projects/monolithic-travertine-pavilion.jpg',
        galleryImages: req.body.galleryImages || req.body.gallery_images || [],
        videoUrl: req.body.videoUrl || req.body.video_url || null,
        materialsPalette: req.body.materialsPalette || req.body.materials_palette || [],
        isFeatured: req.body.isFeatured ?? req.body.is_featured ?? false,
        status: req.body.status || req.body.status || 'draft',
        sortOrder: req.body.sortOrder ?? req.body.sort_order ?? 0,
        seoTitle: sanitizeText(req.body.seoTitle || req.body.seo_title || ''),
        seoDescription: sanitizeText(req.body.seoDescription || req.body.seo_description || ''),
      };
      const newProj = await createProject(payload);
      res.status(201).json(newProj);
    } catch (error: any) {
      console.error('Error in POST /api/projects:', error);
      res.status(500).json({ error: error.message || 'Failed to create project' });
    }
  });

  app.post('/api/projects/:id/duplicate', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const duplicated = await duplicateProject(req.params.id);
      res.status(201).json(duplicated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to duplicate project' });
    }
  });

  app.put('/api/projects/:id', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const payload = { ...req.body };
      if (payload.description) payload.description = sanitizeHtml(payload.description);
      if (payload.architecturalBrief) payload.architecturalBrief = sanitizeHtml(payload.architecturalBrief);
      if (payload.title) payload.title = sanitizeText(payload.title);
      if (payload.location) payload.location = sanitizeText(payload.location);
      if (payload.seoTitle) payload.seoTitle = sanitizeText(payload.seoTitle);
      if (payload.seoDescription) payload.seoDescription = sanitizeText(payload.seoDescription);
      if (payload.videoUrl !== undefined || payload.video_url !== undefined) {
        payload.videoUrl = req.body.videoUrl || req.body.video_url || null;
      }

      const updated = await updateProject(req.params.id, payload);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update project' });
    }
  });

  app.delete('/api/projects/:id', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      await deleteProject(req.params.id);
      res.json({ success: true, deletedId: req.params.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete project' });
    }
  });

  app.put('/api/projects/:id/publish', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const isPublished = req.body.isPublished !== false;
      const updated = await publishProject(req.params.id, isPublished);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to publish project' });
    }
  });

  // -------------------------------------------------------------
  // HERO SLIDES CMS
  // -------------------------------------------------------------
  app.get('/api/hero-slides', async (req, res) => {
    try {
      const wantsDrafts = req.query.drafts === 'true';
      const includeDrafts = wantsDrafts && (await isAuthenticatedAdmin(req));
      const data = await getAllHeroSlides(!includeDrafts);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch hero slides' });
    }
  });

  app.post('/api/hero-slides', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const payload = {
        ...req.body,
        headline: sanitizeText(req.body.headline),
        supportingText: sanitizeText(req.body.supportingText),
      };
      const created = await createHeroSlide(payload);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create hero slide' });
    }
  });

  app.put('/api/hero-slides/:id', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const payload = { ...req.body };
      if (payload.headline) payload.headline = sanitizeText(payload.headline);
      if (payload.supportingText) payload.supportingText = sanitizeText(payload.supportingText);

      const updated = await updateHeroSlide(req.params.id, payload);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update hero slide' });
    }
  });

  app.delete('/api/hero-slides/:id', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      await deleteHeroSlide(req.params.id);
      res.json({ success: true, deletedId: req.params.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete hero slide' });
    }
  });

  app.put('/api/hero-slides/:id/publish', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const isPublished = req.body.isPublished !== false;
      const updated = await publishHeroSlide(req.params.id, isPublished);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to publish hero slide' });
    }
  });

  // -------------------------------------------------------------
  // CONTINUOUS STRIP CMS
  // -------------------------------------------------------------
  app.get('/api/strip-items', async (req, res) => {
    try {
      const wantsDrafts = req.query.drafts === 'true';
      const includeDrafts = wantsDrafts && (await isAuthenticatedAdmin(req));
      const data = await getAllStripItems(!includeDrafts);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch strip items' });
    }
  });

  app.post('/api/strip-items', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const payload = {
        ...req.body,
        title: sanitizeText(req.body.title),
        category: sanitizeText(req.body.category),
      };
      const created = await createStripItem(payload);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create strip item' });
    }
  });

  app.put('/api/strip-items/:id', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const payload = { ...req.body };
      if (payload.title) payload.title = sanitizeText(payload.title);
      if (payload.category) payload.category = sanitizeText(payload.category);

      const updated = await updateStripItem(req.params.id, payload);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update strip item' });
    }
  });

  app.delete('/api/strip-items/:id', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      await deleteStripItem(req.params.id);
      res.json({ success: true, deletedId: req.params.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete strip item' });
    }
  });

  // -------------------------------------------------------------
  // SERVICES CMS
  // -------------------------------------------------------------
  app.get('/api/services', async (req, res) => {
    try {
      const wantsDrafts = req.query.drafts === 'true';
      const includeDrafts = wantsDrafts && (await isAuthenticatedAdmin(req));
      const data = await getAllServices(!includeDrafts);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch services' });
    }
  });

  app.post('/api/services', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const payload = {
        ...req.body,
        title: sanitizeText(req.body.title),
        tagline: sanitizeText(req.body.tagline),
        description: sanitizeHtml(req.body.description),
      };
      const created = await createService(payload);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create service' });
    }
  });

  app.put('/api/services/:id', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const payload = { ...req.body };
      if (payload.title) payload.title = sanitizeText(payload.title);
      if (payload.tagline) payload.tagline = sanitizeText(payload.tagline);
      if (payload.description) payload.description = sanitizeHtml(payload.description);

      const updated = await updateService(req.params.id, payload);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update service' });
    }
  });

  app.delete('/api/services/:id', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      await deleteService(req.params.id);
      res.json({ success: true, deletedId: req.params.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete service' });
    }
  });

  app.put('/api/services/:id/publish', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const isPublished = req.body.isPublished !== false;
      const updated = await publishService(req.params.id, isPublished);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to publish service' });
    }
  });

  // -------------------------------------------------------------
  // TESTIMONIALS & FEEDBACK MODERATION
  // -------------------------------------------------------------
  app.get('/api/testimonials', async (req, res) => {
    try {
      const wantsAll = req.query.all === 'true';
      const showAll = wantsAll && (await isAuthenticatedAdmin(req));
      const data = await getTestimonials(!showAll);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch testimonials' });
    }
  });

  // Public submission of feedback (rate-limited, automatically placed in PENDING status)
  app.post('/api/testimonials', publicFormLimiter, async (req, res) => {
    try {
      const { clientName, clientRole, projectReference, rating, feedbackMessage } = req.body;
      if (!clientName || !feedbackMessage) {
        return res.status(400).json({ error: 'Client name and feedback message are required' });
      }

      // Strictly clamp rating between 1 and 5
      const rawRating = Number(rating);
      const sanitizedRating = Math.max(1, Math.min(5, Math.round(isNaN(rawRating) ? 5 : rawRating)));

      const created = await submitTestimonial({
        clientName: sanitizeText(clientName),
        clientRole: clientRole ? sanitizeText(clientRole) : undefined,
        projectReference: projectReference ? sanitizeText(projectReference) : undefined,
        rating: sanitizedRating,
        feedbackMessage: sanitizeText(feedbackMessage),
      });
      res.status(201).json({
        success: true,
        message: 'Feedback submitted for review and will appear once approved by the studio.',
        item: created,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to submit feedback' });
    }
  });

  // Admin moderation action: APPROVE or REJECT (Protected with ID validation)
  app.put('/api/testimonials/:id/moderate', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
        return res.status(400).json({ error: 'Invalid feedback identifier.' });
      }

      const { status, isFeatured } = req.body;
      if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
        return res.status(400).json({ error: 'Invalid moderation status. Must be APPROVED, REJECTED, or PENDING.' });
      }

      const updated = await moderateTestimonial(id, status, isFeatured);
      if (!updated) {
        return res.status(404).json({ error: 'Feedback record not found.' });
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to moderate testimonial' });
    }
  });

  app.delete('/api/testimonials/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
        return res.status(400).json({ error: 'Invalid feedback identifier.' });
      }
      await deleteTestimonial(id);
      res.json({ success: true, deletedId: id });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete testimonial' });
    }
  });

  // -------------------------------------------------------------
  // CLIENT INQUIRIES & COMMISSIONS (STRICTLY PRIVATE - SUPER ADMIN ONLY)
  // -------------------------------------------------------------
  app.get('/api/enquiries', requireSuperAdmin, async (_req: AuthRequest, res) => {
    try {
      const data = await getAllEnquiries();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch enquiries' });
    }
  });

  // Helper to construct the branded HTML & plain-text email content
  function buildEnquiryEmailContent(enquiry: {
    name: string;
    email: string;
    phone?: string | null;
    projectType?: string | null;
    location?: string | null;
    budget?: string | null;
    preferredContact: string;
    message: string;
  }) {
    const subject = `[New Inquiry] ${enquiry.projectType || 'Commission Brief'} — ${enquiry.name}`;
    const text = `NEW COMMISSION ENQUIRY\n\nName: ${enquiry.name}\nEmail: ${enquiry.email}\nPhone: ${enquiry.phone || 'N/A'}\nProject Scope: ${enquiry.projectType || 'N/A'}\nLocation: ${enquiry.location || 'N/A'}\nBudget: ${enquiry.budget || 'N/A'}\nPreferred Contact: ${enquiry.preferredContact}\n\nMessage:\n${enquiry.message}\n`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #D6CBBE; background-color: #FDFBF7; color: #202124;">
        <div style="border-bottom: 2px solid #B08D57; padding-bottom: 12px; margin-bottom: 20px;">
          <span style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #B08D57; font-weight: 600;">CONCLAVE INTERIORS · ATELIER NOTIFICATION</span>
          <h2 style="font-size: 22px; font-weight: 600; margin: 6px 0 0 0; color: #202124;">New Commission Enquiry Received</h2>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="border-bottom: 1px solid #E5DFD5;">
            <td style="padding: 10px 0; font-weight: 600; color: #8C8276; width: 140px; font-size: 13px;">Client Name</td>
            <td style="padding: 10px 0; font-size: 14px; color: #202124; font-weight: 600;">${sanitizeText(enquiry.name)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E5DFD5;">
            <td style="padding: 10px 0; font-weight: 600; color: #8C8276; font-size: 13px;">Email Address</td>
            <td style="padding: 10px 0; font-size: 14px; color: #202124;"><a href="mailto:${sanitizeText(enquiry.email)}" style="color: #B08D57; text-decoration: underline;">${sanitizeText(enquiry.email)}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #E5DFD5;">
            <td style="padding: 10px 0; font-weight: 600; color: #8C8276; font-size: 13px;">Phone / WhatsApp</td>
            <td style="padding: 10px 0; font-size: 14px; color: #202124;">${sanitizeText(enquiry.phone || 'Not provided')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E5DFD5;">
            <td style="padding: 10px 0; font-weight: 600; color: #8C8276; font-size: 13px;">Project Scope</td>
            <td style="padding: 10px 0; font-size: 14px; color: #202124;">${sanitizeText(enquiry.projectType || 'Turnkey Scope')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E5DFD5;">
            <td style="padding: 10px 0; font-weight: 600; color: #8C8276; font-size: 13px;">Location</td>
            <td style="padding: 10px 0; font-size: 14px; color: #202124;">${sanitizeText(enquiry.location || 'Not provided')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E5DFD5;">
            <td style="padding: 10px 0; font-weight: 600; color: #8C8276; font-size: 13px;">Budget Allocation</td>
            <td style="padding: 10px 0; font-size: 14px; color: #202124;">${sanitizeText(enquiry.budget || 'Not specified')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E5DFD5;">
            <td style="padding: 10px 0; font-weight: 600; color: #8C8276; font-size: 13px;">Preferred Contact</td>
            <td style="padding: 10px 0; font-size: 14px; color: #202124; text-transform: uppercase;">${sanitizeText(enquiry.preferredContact)}</td>
          </tr>
        </table>

        <div style="background-color: #F2EEE7; padding: 16px; border-left: 3px solid #B08D57; margin-bottom: 24px;">
          <p style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #8C8276; margin: 0 0 8px 0;">Inquiry Narrative</p>
          <p style="font-size: 14px; line-height: 1.6; margin: 0; color: #202124; white-space: pre-wrap;">${sanitizeText(enquiry.message)}</p>
        </div>

        <div style="font-size: 11px; color: #8C8276; border-top: 1px solid #E5DFD5; padding-top: 14px;">
          This notification was generated automatically by the Conclave Interiors enquiry system. All inquiries are securely stored in the studio database and accessible via the administration dashboard.
        </div>
      </div>
    `;
    return { subject, text, html };
  }

  // Redact error messages to prevent accidental logging of credentials, keys, or client tokens
  function sanitizeErrorForLog(err: any): string {
    if (!err) return 'Unknown error';
    let msg = typeof err === 'string' ? err : err.message || JSON.stringify(err);
    msg = msg.replace(/re_[a-zA-Z0-9_-]+/g, 're_***');
    msg = msg.replace(/Bearer\s+[a-zA-Z0-9_.-]+/gi, 'Bearer ***');
    msg = msg.replace(/pass(word)?[:=]\s*["']?[^"'&\s]+/gi, 'password=***');
    return msg;
  }

  // Dispatch email notification helper for commission enquiries
  // Supports HTTPS transactional email API (Resend via port 443 - works on Render Free)
  // as well as fallback to Nodemailer SMTP for local development.
  async function dispatchEnquiryEmail(enquiry: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    projectType?: string | null;
    location?: string | null;
    budget?: string | null;
    preferredContact: string;
    message: string;
  }): Promise<{ dispatched: boolean; recipient: string; transport: 'resend-https' | 'smtp' | 'none'; reason?: string }> {
    const recipient =
      process.env.ENQUIRY_NOTIFICATION_EMAIL ||
      process.env.ADMIN_EMAIL ||
      'conclaveinteriorexterior@gmail.com';

    const { subject, text, html } = buildEnquiryEmailContent(enquiry);

    // =========================================================================
    // 1. PRIORITY: HTTPS Transactional Email API (Resend via Port 443)
    // Render Free allows port 443, making this the standard production transport.
    // =========================================================================
    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const fromAddress =
          process.env.RESEND_FROM_EMAIL?.trim() ||
          'Conclave Interiors <onboarding@resend.dev>';

        const response = await resend.emails.send({
          from: fromAddress,
          to: recipient,
          replyTo: enquiry.email,
          subject,
          text,
          html,
        });

        if (response.error) {
          const redactedErr = sanitizeErrorForLog(response.error);
          console.error(`[EMAIL DISPATCH ERROR] Resend HTTPS API returned error:`, redactedErr);
          return {
            dispatched: false,
            recipient,
            transport: 'resend-https',
            reason: `Resend API error: ${redactedErr}`,
          };
        }

        console.log(`[EMAIL DISPATCH SUCCESS] Inquiry email sent via Resend HTTPS API to ${recipient}. EmailId: ${response.data?.id}`);
        return { dispatched: true, recipient, transport: 'resend-https' };
      } catch (err: any) {
        const redactedErr = sanitizeErrorForLog(err);
        console.error(`[EMAIL DISPATCH ERROR] Failed to send enquiry email via Resend HTTPS API:`, redactedErr);
        return {
          dispatched: false,
          recipient,
          transport: 'resend-https',
          reason: `Resend HTTPS transmission failed: ${redactedErr}`,
        };
      }
    }

    // =========================================================================
    // 2. FALLBACK: SMTP Transport (Nodemailer for local development)
    // Note: Render Free blocks ports 25, 465, and 587. For Render, configure RESEND_API_KEY.
    // =========================================================================
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

    if (smtpUser && smtpPass) {
      const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
      const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
      const smtpSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : smtpPort === 465;

      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const mailOptions = {
          from: `"${enquiry.name} via Conclave Interiors" <${smtpUser}>`,
          replyTo: enquiry.email,
          to: recipient,
          subject,
          text,
          html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL DISPATCH SUCCESS] Inquiry email sent via SMTP to ${recipient}. MessageId: ${info.messageId}`);
        return { dispatched: true, recipient, transport: 'smtp' };
      } catch (err: any) {
        const redactedErr = sanitizeErrorForLog(err);
        console.error(`[EMAIL DISPATCH ERROR] Failed to send enquiry email via SMTP:`, redactedErr);
        return {
          dispatched: false,
          recipient,
          transport: 'smtp',
          reason: `SMTP transmission failed: ${redactedErr}`,
        };
      }
    }

    // =========================================================================
    // 3. NEITHER CONFIGURED: Inform in logs that inquiry was stored in DB only
    // =========================================================================
    console.warn(
      `[EMAIL DISPATCH NOTICE] Inquiry ID "${enquiry.id}" was safely saved to the database. External email delivery is inactive because neither RESEND_API_KEY (for HTTPS email on Render) nor SMTP credentials (for local dev) are set in environment variables.`
    );
    return {
      dispatched: false,
      recipient,
      transport: 'none',
      reason: 'No email transport configured in environment variables (set RESEND_API_KEY for Render Free or SMTP_USER/SMTP_PASS for local dev).',
    };
  }

  // Public enquiry submission (rate-limited, sanitized, privacy-safe logging)
  app.post('/api/enquiries', publicFormLimiter, async (req, res) => {
    try {
      const { name, email, phone, projectType, location, budget, preferredContact, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
      }

      // 1. Store the enquiry in PostgreSQL / database first
      const created = await createEnquiry({
        name: sanitizeText(name),
        email: sanitizeText(email),
        phone: phone ? sanitizeText(phone) : '',
        projectType: projectType ? sanitizeText(projectType) : 'Residential Architecture',
        location: location ? sanitizeText(location) : '',
        budget: budget ? sanitizeText(budget) : '',
        preferredContact: preferredContact || 'email',
        message: sanitizeText(message),
      });

      // Operational audit log with client PII redacted
      const redactedEmail = email ? email.replace(/^(.{2})(.*)(@.*)$/, '$1***$3') : '[redacted]';
      const redactedPhone = phone ? phone.replace(/.(?=.{4})/g, '*') : '[none]';
      console.log(`[COMMISSION INQUIRY RECEIVED] ID: ${created.id}, Type: ${projectType || 'Standard'}, Contact: ${preferredContact}, From: ${redactedEmail}, Phone: ${redactedPhone}`);

      // 2. Attempt email delivery (failure never prevents or undoes the stored enquiry)
      let emailResult: {
        dispatched: boolean;
        recipient: string;
        transport: 'resend-https' | 'smtp' | 'none';
        reason?: string;
      } = {
        dispatched: false,
        recipient: process.env.ENQUIRY_NOTIFICATION_EMAIL || 'conclaveinteriorexterior@gmail.com',
        transport: 'none',
        reason: 'Email dispatch skipped',
      };

      try {
        emailResult = await dispatchEnquiryEmail({
          id: created.id,
          name: created.name,
          email: created.email,
          phone: created.phone,
          projectType: created.projectType,
          location: created.location,
          budget: created.budget,
          preferredContact: created.preferredContact,
          message: created.message,
        });
      } catch (dispatchErr: any) {
        const sanitizedErr = sanitizeErrorForLog(dispatchErr);
        console.error(`[EMAIL DISPATCH UNEXPECTED ERROR]`, sanitizedErr);
        emailResult.reason = `Unexpected error: ${sanitizedErr}`;
      }

      // 3. Return HTTP 201 with saved enquiry ID and generic visitor confirmation (no personal or internal fields)
      res.status(201).json({
        success: true,
        message: 'Thank you for your enquiry. Your commission brief has been received by our studio team.',
        id: created.id,
      });
    } catch (error: any) {
      console.error('Error submitting enquiry:', error);
      res.status(500).json({ error: 'Failed to submit enquiry. Please try again or contact the studio directly.' });
    }
  });

  // Admin status update (e.g. NEW -> READ -> CONTACTED -> CLOSED)
  app.put('/api/enquiries/:id/status', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const { status, internalNotes } = req.body;
      if (!['NEW', 'READ', 'CONTACTED', 'CLOSED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid inquiry status' });
      }
      const sanitizedNotes = internalNotes !== undefined ? sanitizeText(internalNotes) : undefined;
      const updated = await updateEnquiryStatus(req.params.id, status, sanitizedNotes);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update enquiry status' });
    }
  });

  app.delete('/api/enquiries/:id', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      await deleteEnquiry(req.params.id);
      res.json({ success: true, deletedId: req.params.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete enquiry' });
    }
  });

  // -------------------------------------------------------------
  // FAQS CMS
  // -------------------------------------------------------------
  app.get('/api/faqs', async (req, res) => {
    try {
      const wantsDrafts = req.query.drafts === 'true';
      const includeDrafts = wantsDrafts && (await isAuthenticatedAdmin(req));
      const data = await getAllFaqs(!includeDrafts);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch FAQs' });
    }
  });

  app.post('/api/faqs', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const payload = {
        ...req.body,
        question: sanitizeText(req.body.question),
        answer: sanitizeHtml(req.body.answer),
        category: sanitizeText(req.body.category),
      };
      const created = await createFaq(payload);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create FAQ' });
    }
  });

  app.put('/api/faqs/:id', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const payload = { ...req.body };
      if (payload.question) payload.question = sanitizeText(payload.question);
      if (payload.answer) payload.answer = sanitizeHtml(payload.answer);
      if (payload.category) payload.category = sanitizeText(payload.category);

      const updated = await updateFaq(req.params.id, payload);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update FAQ' });
    }
  });

  app.delete('/api/faqs/:id', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      await deleteFaq(req.params.id);
      res.json({ success: true, deletedId: req.params.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete FAQ' });
    }
  });

  app.put('/api/faqs/:id/publish', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const isPublished = req.body.isPublished !== false;
      const updated = await publishFaq(req.params.id, isPublished);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to publish FAQ' });
    }
  });

  // -------------------------------------------------------------
  // STUDIO SETTINGS & HOME PAGE CONFIG
  // -------------------------------------------------------------
  app.get('/api/settings', async (_req, res) => {
    try {
      const data = await getSiteSettings();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch settings' });
    }
  });

  app.put('/api/settings', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const payload = { ...req.body };
      if (payload.studioName) payload.studioName = sanitizeText(payload.studioName);
      if (payload.tagline) payload.tagline = sanitizeText(payload.tagline);
      if (payload.seoTitle) payload.seoTitle = sanitizeText(payload.seoTitle);
      if (payload.seoDescription) payload.seoDescription = sanitizeText(payload.seoDescription);

      const updated = await updateSiteSettings(payload);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update settings' });
    }
  });

  // -------------------------------------------------------------
  // ABOUT STUDIO & MANIFESTO
  // -------------------------------------------------------------
  app.get('/api/about', async (_req, res) => {
    try {
      const data = await getAboutStudio();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch about data' });
    }
  });

  app.put('/api/about', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const payload = { ...req.body };
      if (payload.studioIntro) payload.studioIntro = sanitizeHtml(payload.studioIntro);
      if (payload.designerBio) payload.designerBio = sanitizeHtml(payload.designerBio);
      if (payload.philosophyHeadline) payload.philosophyHeadline = sanitizeText(payload.philosophyHeadline);
      if (payload.philosophyBody) payload.philosophyBody = sanitizeHtml(payload.philosophyBody);

      const updated = await updateAboutStudio(payload);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update about data' });
    }
  });

  // -------------------------------------------------------------
  // VITE & STATIC SPA FALLBACK
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Robust dist path resolution supporting GoDaddy cPanel, subdirectories, and standard deployments
    const candidateDist = path.join(process.cwd(), 'dist');
    const distPath = fs.existsSync(path.join(candidateDist, 'index.html'))
      ? candidateDist
      : fs.existsSync(path.join(process.cwd(), 'index.html'))
      ? process.cwd()
      : fs.existsSync(path.join(__dirname, 'index.html'))
      ? __dirname
      : candidateDist;

    app.use(
      express.static(distPath, {
        maxAge: '1d',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          } else if (filePath.match(/\.(js|css|webp|png|jpg|jpeg|svg|woff2?|ttf)$/i)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );

    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Support numeric ports (e.g. 3000, Render, VPS) and Unix domain sockets (e.g. GoDaddy cPanel Phusion Passenger)
  const rawPort = process.env.PORT;
  const isNamedPipeOrSocket = rawPort && isNaN(Number(rawPort));

  let server: any;
  if (isNamedPipeOrSocket) {
    server = app.listen(rawPort, () => {
      console.log(`CONCLAVE INTERIORS Atelier Server running on socket ${rawPort}`);
    });
  } else {
    const portNumber = Number(rawPort) || 3000;
    server = app.listen(portNumber, '0.0.0.0', () => {
      console.log(`CONCLAVE INTERIORS Atelier Server running on http://0.0.0.0:${portNumber}`);
    });
  }

  // Graceful shutdown handling for container and process managers (GoDaddy cPanel, PM2, Docker, Cloud Run)
  const shutdown = (signal: string) => {
    console.log(`[SHUTDOWN] Received ${signal}. Closing HTTP listener gracefully...`);
    server.close(async () => {
      console.log('[SHUTDOWN] HTTP listener closed cleanly.');
      try {
        await closePool();
        console.log('[SHUTDOWN] PostgreSQL pool drained and closed.');
      } catch (err) {
        console.error('[SHUTDOWN] Error closing database pool:', err);
      }
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[SHUTDOWN] Force closing after 10s timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();
