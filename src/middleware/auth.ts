import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken & { role?: string };
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
 * Single Authorized Administrator Verification Middleware
 * 
 * Strict Server-Side Security:
 * - Verifies Google Firebase ID token cryptographically
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

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication token is required.',
    });
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication token is empty.',
    });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Designated single administrator email check
    const authorizedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (!authorizedEmail) {
      console.error('Server configuration error: ADMIN_EMAIL environment variable is not configured.');
      return res.status(500).json({
        error: 'Authentication configuration error: Administrator email is not configured on the server.',
      });
    }

    const userEmail = (decodedToken.email || '').toLowerCase();

    if (userEmail !== authorizedEmail) {
      console.warn(`Unauthorized login attempt by non-admin email: ${userEmail}`);
      return res.status(403).json({
        error: `Forbidden: Account ${userEmail} is not the authorized administrator for Conclave Interiors Atelier CMS.`,
      });
    }

    req.user = {
      ...decodedToken,
      role: 'admin',
    };

    next();
  } catch (error: any) {
    console.error('Error verifying Firebase ID token server-side:', error);
    return res.status(401).json({
      error: 'Unauthorized: Authentication token is invalid or expired. Please sign in again.',
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

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return false;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userEmail = (decodedToken.email || '').toLowerCase();
    return Boolean(userEmail && userEmail === authorizedEmail);
  } catch {
    return false;
  }
}
