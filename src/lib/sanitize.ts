/**
 * Server-side HTML & text sanitization utility
 * Ensures no arbitrary executable scripts, event handlers, or pseudo-protocols
 * are accepted from CMS input, while preserving clean editorial typography
 * (headings, paragraphs, bold, italic, lists, blockquotes, links).
 */

export function sanitizeHtml(input: string | undefined | null): string {
  if (!input) return '';
  
  let clean = input;

  // Strip script tags and content
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Strip iframe, object, embed, form tags
  clean = clean.replace(/<\/?(iframe|object|embed|form|input|button|style)[^>]*>/gi, '');

  // Strip all event handlers (e.g. onclick, onload, onerror)
  clean = clean.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // Strip javascript: pseudo protocols
  clean = clean.replace(/javascript:[^"'\s)]*/gi, '#');

  // Strip data: URIs that are not image data
  clean = clean.replace(/data:(?!image\/)[^"'\s)]*/gi, '#');

  return clean.trim();
}

export function sanitizeText(input: string | undefined | null): string {
  if (!input) return '';
  return input.replace(/[<>]/g, '').trim();
}
