require('dotenv/config');
const { db } = require('./src/db/index.ts');
const { sql } = require('drizzle-orm');

async function main() {
  const tables = ['projects', 'hero_slides', 'strip_items', 'services', 'testimonials', 'site_settings', 'about_studio', 'media_library', 'media_blobs'];
  
  for (const table of tables) {
    try {
      const res = await db.execute(sql.raw(`SELECT * FROM ${table}`));
      console.log(`\n=== Table: ${table} (${res.rows.length} rows) ===`);
      for (const row of res.rows) {
        const jsonStr = JSON.stringify(row);
        const matches = jsonStr.match(/https?:\/\/[^"'\s\\]+/g) || [];
        const imageMatches = matches.filter(m => m.includes('unsplash.com') || m.match(/\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/i));
        if (imageMatches.length > 0) {
          console.log(`Row id: ${row.id}:`, imageMatches);
        }
      }
    } catch (e) {
      console.log(`Table ${table} error or not found:`, e.message);
    }
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
