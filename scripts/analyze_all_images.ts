import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { db } from '../src/db/index.ts';
import { sql } from 'drizzle-orm';

function walk(dir: string, files: string[] = []): string[] {
  if (!fs.existsSync(dir)) return files;
  for (const f of fs.readdirSync(dir)) {
    if (['node_modules', 'dist', '.git', 'bun.lock', '.vite'].includes(f)) continue;
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

async function run() {
  const allFiles = [...walk('src'), 'server.ts', 'index.html'];
  const urlRegex = /https?:\/\/[^\s"'`\\><)]+/g;
  const urlMap = new Map<string, Set<string>>();

  for (const f of allFiles) {
    const content = fs.readFileSync(f, 'utf8');
    let match;
    while ((match = urlRegex.exec(content)) !== null) {
      let url = match[0].replace(/[,;)]+$/, '');
      if (url.includes('images.unsplash.com') || url.match(/\.(jpg|jpeg|png|webp|gif|avif|svg)(\?|$)/i)) {
        if (!urlMap.has(url)) urlMap.set(url, new Set());
        urlMap.get(url)!.add(f);
      }
    }
  }

  // Also check DB
  const tables = ['projects', 'hero_slides', 'strip_items', 'services', 'testimonials', 'site_settings', 'about_studio', 'media_uploads', 'media_blobs'];
  for (const table of tables) {
    try {
      const res: any = await db.execute(sql.raw(`SELECT * FROM ${table}`));
      for (const row of res.rows) {
        const jsonStr = JSON.stringify(row);
        let match;
        while ((match = urlRegex.exec(jsonStr)) !== null) {
          let url = match[0].replace(/[,;)"\\]+$/, '');
          if (url.includes('images.unsplash.com') || url.match(/\.(jpg|jpeg|png|webp|gif|avif|svg)(\?|$)/i)) {
            if (!urlMap.has(url)) urlMap.set(url, new Set());
            urlMap.get(url)!.add(`db:${table}:${row.id}`);
          }
        }
      }
    } catch (e: any) {
      // ignore
    }
  }

  console.log(`Total exact URLs found: ${urlMap.size}`);

  // Group by base image identifier (e.g. Unsplash photo ID)
  interface PhotoInfo {
    photoId: string;
    bestQualityUrl: string;
    allUrls: string[];
    locations: string[];
    suggestedCategory: string;
    suggestedFilename: string;
  }

  const baseMap = new Map<string, PhotoInfo>();

  for (const [url, locations] of urlMap.entries()) {
    if (url === 'https://images.unsplash.com/...') continue; // literal placeholder in text

    let baseId = url;
    let unsplashMatch = url.match(/photo-([0-9a-fA-F-]+)/);
    if (unsplashMatch) {
      baseId = unsplashMatch[1];
    }

    if (!baseMap.has(baseId)) {
      baseMap.set(baseId, {
        photoId: baseId,
        bestQualityUrl: url,
        allUrls: [],
        locations: [],
        suggestedCategory: 'general',
        suggestedFilename: '',
      });
    }

    const info = baseMap.get(baseId)!;
    info.allUrls.push(url);
    for (const loc of locations) {
      if (!info.locations.includes(loc)) info.locations.push(loc);
    }

    // Determine highest quality URL for downloading (highest w= parameter)
    const currentW = getWidthParam(info.bestQualityUrl);
    const newW = getWidthParam(url);
    if (newW > currentW) {
      info.bestQualityUrl = url;
    }
  }

  function getWidthParam(u: string): number {
    const m = u.match(/[?&]w=(\d+)/);
    return m ? parseInt(m[1], 10) : 1000;
  }

  console.log(`\nUnique Base Image Assets to Download: ${baseMap.size}\n`);

  for (const [id, info] of baseMap.entries()) {
    console.log(`Asset ${id}:`);
    console.log(`  Best URL: ${info.bestQualityUrl}`);
    console.log(`  Variants count: ${info.allUrls.length}`);
    console.log(`  Locations: ${info.locations.slice(0, 5).join(', ')}${info.locations.length > 5 ? ' ...' : ''}`);
  }

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
