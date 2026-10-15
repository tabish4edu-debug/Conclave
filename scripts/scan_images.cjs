const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const f of fs.readdirSync(dir)) {
    if (f === 'node_modules' || f === 'dist' || f === '.git' || f === 'bun.lock' || f === '.vite') continue;
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const allFiles = [...walk('src'), 'server.ts', 'index.html'];
const urlRegex = /https?:\/\/[^\s"'`\\><)]+/g;
const imageUrls = new Map();

for (const f of allFiles) {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    let url = match[0];
    url = url.replace(/[,;)]+$/, '');
    if (url.includes('images.unsplash.com') || url.match(/\.(jpg|jpeg|png|webp|gif|avif|svg)(\?|$)/i)) {
      if (!imageUrls.has(url)) imageUrls.set(url, []);
      imageUrls.get(url).push(f);
    }
  }
}

console.log('Found ' + imageUrls.size + ' unique external image URLs:');
const list = [];
for (const [url, occurrences] of imageUrls.entries()) {
  list.push({ url, files: occurrences });
  console.log(`URL: ${url}`);
  console.log(`  Files: ${occurrences.join(', ')}`);
}
fs.writeFileSync('scripts/detected_images.json', JSON.stringify(list, null, 2));
