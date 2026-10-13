import fs from 'fs';
import path from 'path';
import https from 'https';

export interface ImageDownloadTarget {
  id: string;
  category: 'projects' | 'hero' | 'about' | 'services' | 'testimonials' | 'contact' | 'strip';
  filename: string;
  sourceUrl: string;
  photoId: string;
}

export const TARGET_IMAGES: ImageDownloadTarget[] = [
  {
    id: 'travertine-monolith',
    category: 'projects',
    filename: 'monolithic-travertine-pavilion.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85',
    photoId: '1600210492486-724fe5c67fb0',
  },
  {
    id: 'limewash-suite',
    category: 'projects',
    filename: 'limewash-plaster-suite.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=2000&q=85',
    photoId: '1618219908412-a29a1bb7b86e',
  },
  {
    id: 'smoked-oak-library',
    category: 'hero',
    filename: 'smoked-oak-library.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=85',
    photoId: '1616486338812-3dadae4b4ace',
  },
  {
    id: 'biophilic-courtyard',
    category: 'services',
    filename: 'biophilic-stone-courtyard.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=2000&q=85',
    photoId: '1600566753376-12c8ab7fb75b',
  },
  {
    id: 'boardroom-sanctuary',
    category: 'projects',
    filename: 'executive-boardroom-sanctuary.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85',
    photoId: '1497366216548-37526070297c',
  },
  {
    id: 'hearth-lounge',
    category: 'testimonials',
    filename: 'minimalist-hearth-lounge.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85',
    photoId: '1600607687939-ce8a6c25118c',
  },
  {
    id: 'marble-kitchen',
    category: 'hero',
    filename: 'contemporary-marble-kitchen.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
    photoId: '1600585154340-be6161a56a0c',
  },
  {
    id: 'bronze-bar',
    category: 'projects',
    filename: 'soiree-bronze-bar.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=2000&q=85',
    photoId: '1590381105924-c72589b9ef3f',
  },
  {
    id: 'noir-atelier-loft',
    category: 'hero',
    filename: 'noir-atelier-loft.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2200&q=85',
    photoId: '1618221195710-dd6b41faaea6',
  },
  {
    id: 'residential-joinery',
    category: 'services',
    filename: 'residential-design-joinery.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=85',
    photoId: '1556911220-e15b29be8c8f',
  },
  {
    id: 'stone-selection',
    category: 'services',
    filename: 'stone-material-selection.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=85',
    photoId: '1584622650111-993a426fbf0a',
  },
  {
    id: 'joinery-prototype',
    category: 'services',
    filename: 'custom-joinery-prototyping.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85',
    photoId: '1513694203232-719a280e022f',
  },
  {
    id: 'limestone-detail',
    category: 'services',
    filename: 'fluted-limestone-detail.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=85',
    photoId: '1615066390971-03e4e1c36ddf',
  },
  {
    id: 'principal-designer',
    category: 'about',
    filename: 'principal-designer.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
    photoId: '1534528741775-53994a69daeb',
  },
  {
    id: 'studio-courtyard',
    category: 'about',
    filename: 'studio-courtyard-architecture.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2400&q=85',
    photoId: '1600585154526-990dced4db0d',
  },
  {
    id: 'consultation-portal',
    category: 'contact',
    filename: 'atelier-consultation-portal.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1800&q=85',
    photoId: '1600566753190-17f0baa2a6c3',
  },
  {
    id: 'avatar-patron-01',
    category: 'testimonials',
    filename: 'avatar-patron-01.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=85',
    photoId: '1507003211169-0a1dd7228f2d',
  },
  {
    id: 'avatar-patron-02',
    category: 'testimonials',
    filename: 'avatar-patron-02.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=85',
    photoId: '1494790108377-be9c29b29330',
  },
  {
    id: 'spatial-zen',
    category: 'services',
    filename: 'spatial-architecture-zen.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2400&q=85',
    photoId: '1600607687920-4e2a09cf159d',
  },
  {
    id: 'architectural-terrace',
    category: 'projects',
    filename: 'soiree-architectural-terrace.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
    photoId: '1512917774080-9991f1c4c750',
  },
];

function downloadUrl(url: string, destPath: string): Promise<{ size: number }> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const request = (targetUrl: string) => {
      https.get(targetUrl, (response) => {
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return request(response.headers.location);
        }
        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(destPath);
          return reject(new Error(`Failed to download ${targetUrl}, status code: ${response.statusCode}`));
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            const stats = fs.statSync(destPath);
            resolve({ size: stats.size });
          });
        });
      }).on('error', (err) => {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        reject(err);
      });
    };
    request(url);
  });
}

async function main() {
  console.log(`Starting download of ${TARGET_IMAGES.length} distinct website images...\n`);
  const results = [];

  for (const item of TARGET_IMAGES) {
    const dir = path.join(process.cwd(), 'public', 'images', item.category);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const destPath = path.join(dir, item.filename);
    const relativeWebPath = `/images/${item.category}/${item.filename}`;

    process.stdout.write(`Downloading [${item.category}] ${item.filename}... `);
    try {
      const { size } = await downloadUrl(item.sourceUrl, destPath);
      const kb = Math.round(size / 1024);
      console.log(`OK (${kb} KB) -> ${relativeWebPath}`);
      results.push({
        ...item,
        relativeWebPath,
        sizeBytes: size,
        status: 'SUCCESS',
      });
    } catch (err: any) {
      console.log(`FAILED: ${err.message}`);
      results.push({
        ...item,
        relativeWebPath,
        status: 'FAILED',
        error: err.message,
      });
    }
  }

  fs.writeFileSync('scripts/download_report.json', JSON.stringify(results, null, 2));
  console.log(`\nCompleted download. Report written to scripts/download_report.json`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
