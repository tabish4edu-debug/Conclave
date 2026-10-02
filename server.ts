import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import {
  requireAuth,
  AuthRequest,
  isLocalhostRequest,
  isAuthenticatedAdmin,
  extractSessionToken,
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
} from './src/db/service.ts';

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

  // Configure Memory Storage for persistent cloud database storage (Images & Videos)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for high-res images and videos
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image formats (JPEG, PNG, WebP, AVIF, SVG) and video formats (MP4, WebM, MOV, OGG) are permitted'));
      }
    },
  });

  app.use(cookieParser(process.env.SESSION_SECRET || 'conclave_atelier_session_secret'));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Strict CORS / Origin policy for admin endpoints
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      process.env.APP_URL,
    ].filter(Boolean) as string[];

    const isDevelopment = process.env.NODE_ENV !== 'production';

    const isAllowed =
      !origin ||
      allowedOrigins.includes(origin) ||
      (isDevelopment && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')));

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
      service: 'CONCLAVE INTERIORS Atelier CMS API',
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

  // -------------------------------------------------------------
  // PERSISTENT ONLINE MEDIA STREAMING & MANAGEMENT
  // -------------------------------------------------------------
  app.get('/api/media/:id', async (req, res) => {
    try {
      const media = await storageService.getMedia(req.params.id);
      if (!media) {
        return res.status(404).json({ error: 'Media not found' });
      }

      res.setHeader('Content-Type', media.mimeType);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      const isSvg = media.mimeType.toLowerCase().includes('svg');
      res.setHeader(
        'Content-Disposition',
        `${isSvg ? 'attachment' : 'inline'}; filename="${media.fileName}"`
      );
      res.setHeader('X-Content-Type-Options', 'nosniff');

      // Video range streaming support (seeking, scrub bar, chunk buffering)
      const range = req.headers.range;
      if (range && media.mimeType.startsWith('video/')) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : media.buffer.length - 1;
        const chunkSize = end - start + 1;
        const fileChunk = media.buffer.slice(start, end + 1);

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

  // Upload image or video to persistent online storage
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

      const altText = req.body.altText ? sanitizeText(req.body.altText) : undefined;

      const result = await storageService.upload({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        altText,
      });

      // Also mirror to local disk if running locally for instant preview compatibility
      try {
        const localPath = path.join(uploadsDir, result.fileName);
        fs.writeFileSync(localPath, file.buffer);
      } catch (err) {
        // Disk write failure on read-only environments is expected and benign
      }

      const isVideo = file.mimetype.startsWith('video/');

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

  // List all media files in the library
  app.get('/api/media', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const list = await storageService.listMedia();
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to list media' });
    }
  });

  // Delete media from library
  app.delete('/api/media/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const success = await storageService.deleteMedia(req.params.id);
      res.json({ success, deletedId: req.params.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete media' });
    }
  });

  // -------------------------------------------------------------
  // POSTGRESQL ADMIN SESSION AUTHENTICATION
  // -------------------------------------------------------------
  const isProduction = process.env.NODE_ENV === 'production';
  const sessionCookieOptions: express.CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
  const csrfCookieOptions: express.CookieOptions = {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };

  // Administrator Login Endpoint (Protected against brute-force)
  app.post('/api/auth/login', async (req, res) => {
    try {
      const forwarded = req.headers['x-forwarded-for'];
      const clientIp =
        (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : undefined) ||
        req.ip ||
        req.socket.remoteAddress ||
        'unknown-client';

      const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
      const password = typeof req.body.password === 'string' ? req.body.password : '';

      // Check brute-force limits
      const bruteCheck = checkLoginBruteForce(clientIp, email);
      if (bruteCheck.blocked) {
        res.setHeader('Retry-After', String(bruteCheck.retryAfterSeconds || 900));
        return res.status(429).json({
          error: 'Too many failed login attempts. Please wait 15 minutes before trying again.',
          retryAfterSeconds: bruteCheck.retryAfterSeconds,
        });
      }

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      // Check configured administrator email
      const authorizedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
      if (!authorizedEmail) {
        console.error('Server configuration error: ADMIN_EMAIL is not set in environment.');
        return res.status(500).json({ error: 'Server authentication configuration error.' });
      }

      // Constant-time-like generic failure if email does not match admin email
      if (email !== authorizedEmail) {
        recordFailedLogin(clientIp, email);
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Locate administrator in PostgreSQL
      const user = await findUserByEmail(email);
      if (!user || user.role !== 'admin' || !user.passwordHash) {
        recordFailedLogin(clientIp, email);
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Verify bcrypt password hash
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        recordFailedLogin(clientIp, email);
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Successful authentication — reset rate-limit tracking
      resetFailedLogin(clientIp, email);

      // Create cryptographically secure session
      const { rawToken } = await createSession(user.id, 7);
      const csrfToken = crypto.randomBytes(16).toString('hex');

      // Set HTTP-only session cookie and CSRF token cookie
      res.cookie('conclave_session', rawToken, sessionCookieOptions);
      res.cookie('conclave_csrf', csrfToken, csrfCookieOptions);

      // Return safe user information only (never password_hash or session secrets)
      return res.json({
        authenticated: true,
        user: {
          id: user.id,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
        csrfToken,
      });
    } catch (error: any) {
      console.error('Login processing error:', error);
      return res.status(500).json({ error: 'An error occurred during authentication.' });
    }
  });

  // Administrator Logout Endpoint
  app.post('/api/auth/logout', async (req, res) => {
    try {
      const token = extractSessionToken(req);
      if (token) {
        await deleteSession(token);
      }
      res.clearCookie('conclave_session', { path: '/' });
      res.clearCookie('conclave_csrf', { path: '/' });
      return res.json({ success: true, message: 'Logged out successfully.' });
    } catch (error: any) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Failed to complete logout.' });
    }
  });

  // Current Session Endpoint (Safe metadata only)
  app.get('/api/auth/session', async (req, res) => {
    try {
      const token = extractSessionToken(req);
      if (!token) {
        return res.json({ authenticated: false, user: null });
      }

      const verified = await verifySessionToken(token);
      if (!verified || !verified.user) {
        res.clearCookie('conclave_session', { path: '/' });
        return res.json({ authenticated: false, user: null });
      }

      const authorizedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
      if (!authorizedEmail || verified.user.email.toLowerCase() !== authorizedEmail || verified.user.role !== 'admin') {
        res.clearCookie('conclave_session', { path: '/' });
        return res.json({ authenticated: false, user: null });
      }

      const csrfToken = req.cookies?.conclave_csrf || crypto.randomBytes(16).toString('hex');
      res.cookie('conclave_csrf', csrfToken, csrfCookieOptions);

      return res.json({
        authenticated: true,
        user: {
          id: verified.user.id,
          uid: verified.user.uid,
          email: verified.user.email,
          displayName: verified.user.displayName,
          role: verified.user.role,
        },
        csrfToken,
      });
    } catch (error: any) {
      console.error('Session retrieval error:', error);
      return res.json({ authenticated: false, user: null });
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
      if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
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
      const csrfToken = crypto.randomBytes(16).toString('hex');

      res.cookie('conclave_session', rawToken, sessionCookieOptions);
      res.cookie('conclave_csrf', csrfToken, csrfCookieOptions);

      return res.json({ success: true, message: 'Administrator password changed successfully.' });
    } catch (error: any) {
      console.error('Password change error:', error);
      return res.status(500).json({ error: 'Failed to change administrator password.' });
    }
  });

  // -------------------------------------------------------------
  // PUBLICATION WORKFLOW & AUDIT HISTORY
  // -------------------------------------------------------------
  app.get('/api/admin/publication-status', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const status = await getUnpublishedChangesSummary();
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch publication status' });
    }
  });

  app.post('/api/admin/publish-batch', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const note = req.body.notes ? sanitizeText(req.body.notes) : undefined;
      const result = await publishBatch(
        user.displayName || 'Studio Administrator',
        user.email || process.env.ADMIN_EMAIL || 'admin@conclaveinteriors.com',
        note
      );
      res.json(result);
    } catch (error: any) {
      console.error('Batch publish error:', error);
      res.status(500).json({ error: error.message || 'Failed to publish changes live' });
    }
  });

  app.get('/api/admin/publication-history', requireAuth, async (_req: AuthRequest, res) => {
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
      res.status(500).json({ error: error.message || 'Failed to fetch projects' });
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
      res.status(500).json({ error: error.message || 'Failed to fetch project' });
    }
  });

  app.post('/api/projects', requireAuth, async (req: AuthRequest, res) => {
    try {
      const payload = {
        ...req.body,
        description: sanitizeHtml(req.body.description),
        architecturalBrief: sanitizeHtml(req.body.architecturalBrief),
        title: sanitizeText(req.body.title),
        location: sanitizeText(req.body.location),
        seoTitle: sanitizeText(req.body.seoTitle),
        seoDescription: sanitizeText(req.body.seoDescription),
      };
      const newProj = await createProject(payload);
      res.status(201).json(newProj);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create project' });
    }
  });

  app.post('/api/projects/:id/duplicate', requireAuth, async (req: AuthRequest, res) => {
    try {
      const duplicated = await duplicateProject(req.params.id);
      res.status(201).json(duplicated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to duplicate project' });
    }
  });

  app.put('/api/projects/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const payload = { ...req.body };
      if (payload.description) payload.description = sanitizeHtml(payload.description);
      if (payload.architecturalBrief) payload.architecturalBrief = sanitizeHtml(payload.architecturalBrief);
      if (payload.title) payload.title = sanitizeText(payload.title);
      if (payload.location) payload.location = sanitizeText(payload.location);
      if (payload.seoTitle) payload.seoTitle = sanitizeText(payload.seoTitle);
      if (payload.seoDescription) payload.seoDescription = sanitizeText(payload.seoDescription);

      const updated = await updateProject(req.params.id, payload);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update project' });
    }
  });

  app.delete('/api/projects/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      await deleteProject(req.params.id);
      res.json({ success: true, deletedId: req.params.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete project' });
    }
  });

  app.put('/api/projects/:id/publish', requireAuth, async (req: AuthRequest, res) => {
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

  app.post('/api/hero-slides', requireAuth, async (req: AuthRequest, res) => {
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

  app.put('/api/hero-slides/:id', requireAuth, async (req: AuthRequest, res) => {
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

  app.delete('/api/hero-slides/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      await deleteHeroSlide(req.params.id);
      res.json({ success: true, deletedId: req.params.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete hero slide' });
    }
  });

  app.put('/api/hero-slides/:id/publish', requireAuth, async (req: AuthRequest, res) => {
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

  app.post('/api/strip-items', requireAuth, async (req: AuthRequest, res) => {
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

  app.put('/api/strip-items/:id', requireAuth, async (req: AuthRequest, res) => {
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

  app.delete('/api/strip-items/:id', requireAuth, async (req: AuthRequest, res) => {
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

  app.post('/api/services', requireAuth, async (req: AuthRequest, res) => {
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

  app.put('/api/services/:id', requireAuth, async (req: AuthRequest, res) => {
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

  app.delete('/api/services/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      await deleteService(req.params.id);
      res.json({ success: true, deletedId: req.params.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete service' });
    }
  });

  app.put('/api/services/:id/publish', requireAuth, async (req: AuthRequest, res) => {
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
      const created = await submitTestimonial({
        clientName: sanitizeText(clientName),
        clientRole: clientRole ? sanitizeText(clientRole) : undefined,
        projectReference: projectReference ? sanitizeText(projectReference) : undefined,
        rating: Number(rating) || 5,
        feedbackMessage: sanitizeText(feedbackMessage),
      });
      res.status(201).json({
        success: true,
        message: 'Feedback submitted for review and will appear once approved by the studio.',
        item: created,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to submit feedback' });
    }
  });

  // Admin moderation action: APPROVE or REJECT
  app.put('/api/testimonials/:id/moderate', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { status, isFeatured } = req.body;
      if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
        return res.status(400).json({ error: 'Invalid moderation status' });
      }
      const updated = await moderateTestimonial(req.params.id, status, isFeatured);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to moderate testimonial' });
    }
  });

  app.delete('/api/testimonials/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      await deleteTestimonial(req.params.id);
      res.json({ success: true, deletedId: req.params.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete testimonial' });
    }
  });

  // -------------------------------------------------------------
  // CLIENT INQUIRIES & COMMISSIONS (STRICTLY PRIVATE)
  // -------------------------------------------------------------
  app.get('/api/enquiries', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const data = await getAllEnquiries();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch enquiries' });
    }
  });

  // Public enquiry submission (rate-limited, sanitized, privacy-safe logging)
  app.post('/api/enquiries', publicFormLimiter, async (req, res) => {
    try {
      const { name, email, phone, projectType, location, budget, preferredContact, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
      }
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

      res.status(201).json({
        success: true,
        message: 'Commission inquiry received and credentials emailed to conclaveinteriorexterior@gmail.com.',
        item: created,
        emailDispatchedTo: 'conclaveinteriorexterior@gmail.com',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to submit enquiry' });
    }
  });

  // Admin status update (e.g. NEW -> READ -> CONTACTED -> CLOSED)
  app.put('/api/enquiries/:id/status', requireAuth, async (req: AuthRequest, res) => {
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

  app.delete('/api/enquiries/:id', requireAuth, async (req: AuthRequest, res) => {
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

  app.post('/api/faqs', requireAuth, async (req: AuthRequest, res) => {
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

  app.put('/api/faqs/:id', requireAuth, async (req: AuthRequest, res) => {
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

  app.delete('/api/faqs/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      await deleteFaq(req.params.id);
      res.json({ success: true, deletedId: req.params.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete FAQ' });
    }
  });

  app.put('/api/faqs/:id/publish', requireAuth, async (req: AuthRequest, res) => {
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

  app.put('/api/settings', requireAuth, async (req: AuthRequest, res) => {
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

  app.put('/api/about', requireAuth, async (req: AuthRequest, res) => {
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CONCLAVE INTERIORS Atelier Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
