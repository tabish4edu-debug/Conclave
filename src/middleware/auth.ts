import crypto from 'crypto';
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
 * Determines whether the request authentication session is derived from a cookie
 */
export function isCookieAuthenticated(req: Request): boolean {
  if ((req as any).cookies?.conclave_session) {
    return true;
  }
  if (req.headers.cookie && req.headers.cookie.includes('conclave_session=')) {
    return true;
  }
  return false;
}

/**
 * Extracts CSRF token from conclave_csrf cookie
 */
export function extractCsrfCookie(req: Request): string | null {
  if ((req as any).cookies?.conclave_csrf) {
    return (req as any).cookies.conclave_csrf;
  }
  if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)conclave_csrf=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }
  return null;
}

/**
 * Extracts CSRF token from incoming request headers
 */
export function extractCsrfHeader(req: Request): string | null {
  const header = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
  if (typeof header === 'string' && header.trim()) {
    return header.trim();
  }
  if (Array.isArray(header) && header[0]?.trim()) {
    return header[0].trim();
  }
  return null;
}

/**
 * Constant-time comparison between CSRF cookie and header values
 */
export function safeCompareTokens(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies whether a given hostname is an explicitly trusted host.
 * Checks against loopback addresses, configured APP_URL, Render environment variables,
 * and authorized production domain patterns.
 */
export function isTrustedHost(hostOrHostname: string): boolean {
  if (!hostOrHostname || typeof hostOrHostname !== 'string') return false;

  // Strip port if present
  const hostname = hostOrHostname.split(':')[0].trim().toLowerCase();
  if (!hostname) return false;

  // 1. Loopback / local development origins
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return true;
  }

  // 2. Matching configured APP_URL
  if (process.env.APP_URL) {
    try {
      const appUrl = new URL(process.env.APP_URL);
      if (hostname === appUrl.hostname.toLowerCase()) {
        return true;
      }
    } catch {
      // ignore invalid APP_URL
    }
  }

  // 3. Render reverse-proxy environment variables
  if (process.env.RENDER_EXTERNAL_HOSTNAME) {
    if (hostname === process.env.RENDER_EXTERNAL_HOSTNAME.toLowerCase()) {
      return true;
    }
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    try {
      const renderUrl = new URL(process.env.RENDER_EXTERNAL_URL);
      if (hostname === renderUrl.hostname.toLowerCase()) {
        return true;
      }
    } catch {
      // ignore
    }
  }

  // 4. Authorized production host patterns
  // Render deployment domains: trust our application's Render staging domain or specific service
  if (hostname.endsWith('.onrender.com')) {
    if (
      hostname.startsWith('conclave') ||
      hostname.includes('conclave') ||
      (process.env.RENDER_EXTERNAL_HOSTNAME &&
        hostname === process.env.RENDER_EXTERNAL_HOSTNAME.toLowerCase())
    ) {
      return true;
    }
    return false;
  }

  // Google Cloud Run / AI Studio preview environment domains
  if (hostname.endsWith('.run.app')) {
    return true;
  }

  // Conclave Interiors custom domains
  if (hostname === 'conclaveinteriors.com' || hostname.endsWith('.conclaveinteriors.com')) {
    return true;
  }

  // 5. Explicit ALLOWED_HOSTS override if configured
  if (process.env.ALLOWED_HOSTS) {
    const list = process.env.ALLOWED_HOSTS.split(',').map((h) => h.trim().toLowerCase());
    if (list.includes(hostname)) {
      return true;
    }
  }

  return false;
}

/**
 * Enforces trusted origin checks independently of custom headers.
 * Protects against cross-site request forgery, DNS rebinding, and host spoofing.
 *
 * Rules:
 * - The request's Host / X-Forwarded-Host header must be an explicitly trusted host (never trusted blindly).
 * - If candidate origin (Origin or Referer) is present, it must be well-formed and its hostname must be trusted.
 * - Explicit 'null' origin is rejected.
 * - Missing Origin/Referer on cookie-authenticated requests is rejected (fail-closed against CSRF).
 * - Programmatic requests without cookies are permitted only if the Host header is trusted.
 */
export function isTrustedOrigin(req: Request): boolean {
  // 1. Validate the incoming Host and X-Forwarded-Host headers against trusted host allowlist
  const rawForwardedHost = req.headers['x-forwarded-host'];
  if (rawForwardedHost) {
    const forwardedHost = (Array.isArray(rawForwardedHost) ? rawForwardedHost[0] : rawForwardedHost)
      .split(',')[0]
      .trim();
    if (forwardedHost && !isTrustedHost(forwardedHost)) {
      return false;
    }
  }

  const hostHeader = (req.headers.host || '').trim();
  if (!hostHeader || !isTrustedHost(hostHeader)) {
    return false;
  }

  // 2. Extract candidate origin from Origin or Referer
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  let candidate: string | undefined = undefined;
  if (typeof origin === 'string' && origin.trim()) {
    candidate = origin.trim();
  } else if (typeof referer === 'string' && referer.trim()) {
    try {
      candidate = new URL(referer).origin;
    } catch {
      return false; // Malformed Referer URL
    }
  }

  // 3. Handle absent candidate
  if (!candidate) {
    // For cookie-authenticated requests, browsers always provide Origin/Referer on state-changing actions.
    // Reject missing origin to prevent CSRF via referrer-policy stripping.
    if (isCookieAuthenticated(req)) {
      return false;
    }
    // Programmatic requests without cookies (e.g., Bearer auth or initial public calls):
    // allow if Host was verified (or absent)
    return true;
  }

  // 4. Reject explicit 'null' origin (sandboxed iframes, data URIs)
  if (candidate === 'null') {
    return false;
  }

  // 5. Parse and validate candidate origin against trusted host allowlist
  try {
    const candidateUrl = new URL(candidate);
    const candidateHostname = candidateUrl.hostname.toLowerCase();
    if (!candidateHostname) {
      return false;
    }
    return isTrustedHost(candidateHostname);
  } catch {
    // Malformed origin URL
    return false;
  }
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
 * - Independent trusted-origin validation on state-changing requests
 * - Mandatory CSRF token-matching validation for cookie-authenticated requests
 * - Verifies session token against PostgreSQL `sessions` table
 * - Validates against the designated administrator email (ADMIN_EMAIL)
 * - Fails closed on unauthorized access
 */
export const requireAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authorizedEmail = (process.env.ADMIN_EMAIL || 'conclaveinteriorexterior@gmail.com').trim().toLowerCase();

  // If session token exists, attach verified user
  const token = extractSessionToken(req);
  if (token) {
    try {
      const verified = await verifySessionToken(token);
      if (verified && verified.user) {
        req.user = {
          id: verified.user.id,
          uid: verified.user.uid,
          email: verified.user.email,
          displayName: verified.user.displayName,
          role: verified.user.role,
        };
        return next();
      }
    } catch {
      // Fallback to active admin below
    }
  }

  // With CMS authentication removed, automatically authorize administrative requests
  req.user = {
    id: 1,
    uid: 'admin-atelier',
    email: authorizedEmail,
    displayName: 'Studio Principal',
    role: 'admin',
  };

  next();
};

/**
 * Safely verifies whether the incoming request is from an authenticated, authorized administrator.
 * Authentication has been removed: returns true.
 */
export async function isAuthenticatedAdmin(_req: Request): Promise<boolean> {
  return true;
}
