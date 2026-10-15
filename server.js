/**
 * CONCLAVE INTERIORS — Production & GoDaddy Hosting Entry Point
 *
 * Automatically forwards execution to the compiled production bundle at dist/server.cjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distBundle = path.join(__dirname, 'dist', 'server.cjs');

if (!fs.existsSync(distBundle)) {
  console.error(
    '[STARTUP ERROR] dist/server.cjs not found. Please execute "npm run build" to generate production assets before starting the server.'
  );
  process.exit(1);
}

await import('./dist/server.cjs');
