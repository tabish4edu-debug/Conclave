import { Request, Response, NextFunction } from 'express';
import { verifySessionToken } from '../db/service.ts';

export interface AuthUser {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

/**
 * Extracts session token from HTTP-only cookie, Authorization header, or X-Session-Token header
 */
export function extractSessionToken(req: Request): string | null {
  // 1. Primary: HTTP-only secure cookie
  if ((req as any).cookies?.conclave_session) {
    return (req as any).cookies.conclave_session;
  }
  // Cookie fallback parsing from cookie header if cookie-parser middleware not mounted yet
  if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)conclave_session=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }

  // 2. Secondary fallback: Bearer token header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split('Bearer ')[1]?.trim() || null;
  }

  // 3. Tertiary fallback: X-Session-Token header
  const customHeader = req.headers['x-session-token'];
  if (typeof customHeader === 'string' && customHeader.trim()) {
    return customHeader.trim();
  }

  return null;
}

/**
 * Checks whether the request is originating from localhost
 */
export function isLocalhostRequest(req: Request): boolean {
  const host = req.headers.host || '';
  const hostname = req.hostname || '';
  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';

  const isLocalHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    host.startsWith('localhost:') ||
    host.startsWith('127.0.0.1:') ||
    origin.includes('localhost:') ||
    origin.includes('127.0.0.1:') ||
    referer.includes('localhost:') ||
    referer.includes('127.0.0.1:');

  return isLocalHost;
}

/**
 * Single Authorized Administrator Verification Middleware (PostgreSQL Session Auth)
 * 
 * Strict Server-Side Security:
 * - Verifies session token against PostgreSQL `sessions` table
 * - Validates against the single designated administrator email
 * - Enforces localhost origin requirement when STRICT_LOCAL_ADMIN is configured
 * - Eliminates hardcoded passwords, session tokens, or demo bypasses
 */
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Check localhost restriction if STRICT_LOCAL_ADMIN is enforced
  if (process.env.STRICT_LOCAL_ADMIN === 'true' && !isLocalhostRequest(req)) {
    return res.status(403).json({
      error: 'Forbidden: Admin CMS is configured for local administrative access only.',
    });
  }

  // CSRF validation for state-changing requests when authenticated via cookie
  const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
  if (isStateChanging) {
    const origin = req.headers.origin;
    const adminClientHeader = req.headers['x-admin-client'];
    const requestedWith = req.headers['x-requested-with'];
    const csrfTokenHeader = req.headers['x-csrf-token'];

    // Require either a verified custom client header or matching origin
    const hasCustomHeader = Boolean(adminClientHeader || requestedWith || csrfTokenHeader);
    const hasTrustedOrigin =
      !origin ||
      origin === process.env.APP_URL ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:');

    if (!hasCustomHeader && !hasTrustedOrigin) {
      return res.status(403).json({
        error: 'Forbidden: Cross-site request forgery check failed.',
      });
    }
  }

  const token = extractSessionToken(req);
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication session required. Please sign in.',
    });
  }

  try {
    const verified = await verifySessionToken(token);
    if (!verified || !verified.user) {
      return res.status(401).json({
        error: 'Unauthorized: Session is invalid or has expired. Please sign in again.',
      });
    }

    const { user } = verified;

    // Designated single administrator email check
    const authorizedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (!authorizedEmail) {
      console.error('Server configuration error: ADMIN_EMAIL environment variable is not configured.');
      return res.status(500).json({
        error: 'Authentication configuration error: Administrator email is not configured on the server.',
      });
    }

    const userEmail = (user.email || '').toLowerCase();

    if (userEmail !== authorizedEmail || user.role !== 'admin') {
      console.warn(`Unauthorized access attempt by non-admin: ${userEmail}`);
      return res.status(403).json({
        error: `Forbidden: Account ${userEmail} is not the authorized administrator for Conclave Interiors Atelier CMS.`,
      });
    }

    req.user = {
      id: user.id,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };

    next();
  } catch (error: any) {
    console.error('Error verifying session server-side:', error);
    return res.status(500).json({
      error: 'Authentication verification encountered a server error.',
    });
  }
};

/**
 * Safely verifies whether the incoming request is from an authenticated, authorized administrator.
 * Does not emit HTTP responses or throw errors. Returns true if valid admin, false otherwise.
 * Fails closed (returns false) if ADMIN_EMAIL is not configured.
 */
export async function isAuthenticatedAdmin(req: Request): Promise<boolean> {
  const authorizedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!authorizedEmail) {
    return false;
  }

  const token = extractSessionToken(req);
  if (!token) {
    return false;
  }

  try {
    const verified = await verifySessionToken(token);
    if (!verified || !verified.user) {
      return false;
    }
    const userEmail = (verified.user.email || '').toLowerCase();
    return Boolean(userEmail && userEmail === authorizedEmail && verified.user.role === 'admin');
  } catch {
    return false;
  }
}
