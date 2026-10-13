import 'dotenv/config';
import { db } from '../src/db/index.ts';
import { projects, heroSlides, stripItems, aboutStudio, siteSettings } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

const URL_MAP: Record<string, string> = {
  '1600210492486-724fe5c67fb0': '/images/projects/monolithic-travertine-pavilion.jpg',
  '1618219908412-a29a1bb7b86e': '/images/projects/limewash-plaster-suite.jpg',
  '1616486338812-3dadae4b4ace': '/images/hero/smoked-oak-library.jpg',
  '1600566753376-12c8ab7fb75b': '/images/services/biophilic-stone-courtyard.jpg',
  '1497366216548-37526070297c': '/images/projects/executive-boardroom-sanctuary.jpg',
  '1600607687939-ce8a6c25118c': '/images/testimonials/minimalist-hearth-lounge.jpg',
  '1600585154340-be6161a56a0c': '/images/hero/contemporary-marble-kitchen.jpg',
  '1590381105924-c72589b9ef3f': '/images/projects/soiree-bronze-bar.jpg',
  '1618221195710-dd6b41faaea6': '/images/hero/noir-atelier-loft.jpg',
  '1556911220-e15b29be8c8f': '/images/services/residential-design-joinery.jpg',
  '1584622650111-993a426fbf0a': '/images/services/stone-material-selection.jpg',
  '1513694203232-719a280e022f': '/images/services/custom-joinery-prototyping.jpg',
  '1615066390971-03e4e1c36ddf': '/images/services/fluted-limestone-detail.jpg',
  '1534528741775-53994a69daeb': '/images/about/principal-designer.jpg',
  '1600585154526-990dced4db0d': '/images/about/studio-courtyard-architecture.jpg',
  '1600566753190-17f0baa2a6c3': '/images/contact/atelier-consultation-portal.jpg',
  '1507003211169-0a1dd7228f2d': '/images/testimonials/avatar-patron-01.jpg',
  '1494790108377-be9c29b29330': '/images/testimonials/avatar-patron-02.jpg',
  '1600607687920-4e2a09cf159d': '/images/services/spatial-architecture-zen.jpg',
  '1512917774080-9991f1c4c750': '/images/projects/soiree-architectural-terrace.jpg',
};

function replaceUrl(urlStr: string | null | undefined): string {
  if (!urlStr) return '';
  for (const [photoId, localPath] of Object.entries(URL_MAP)) {
    if (urlStr.includes(photoId)) {
      return localPath;
    }
  }
  return urlStr;
}

async function main() {
  console.log('Migrating database image URLs to local assets...\n');

  // 1. Projects
  const allProjects = await db.select().from(projects);
  console.log(`Processing ${allProjects.length} projects...`);
  for (const p of allProjects) {
    const updatedCover = replaceUrl(p.coverImage);
    const updatedGallery = (p.galleryImages || []).map((img: any) => ({
      ...img,
      url: replaceUrl(img.url),
    }));

    await db
      .update(projects)
      .set({
        coverImage: updatedCover,
        galleryImages: updatedGallery,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, p.id));
    console.log(`  Updated project: ${p.id} (${p.title}) -> cover: ${updatedCover}`);
  }

  // 2. Hero Slides
  const allHero = await db.select().from(heroSlides);
  console.log(`\nProcessing ${allHero.length} hero slides...`);
  for (const h of allHero) {
    const updatedImg = replaceUrl(h.imageUrl);
    await db
      .update(heroSlides)
      .set({
        imageUrl: updatedImg,
      })
      .where(eq(heroSlides.id, h.id));
    console.log(`  Updated hero slide: ${h.id} -> image: ${updatedImg}`);
  }

  // 3. Strip Items
  const allStrip = await db.select().from(stripItems);
  console.log(`\nProcessing ${allStrip.length} strip items...`);
  for (const s of allStrip) {
    const updatedImg = replaceUrl(s.imageUrl);
    await db
      .update(stripItems)
      .set({
        imageUrl: updatedImg,
      })
      .where(eq(stripItems.id, s.id));
    console.log(`  Updated strip item: ${s.id} (${s.title}) -> image: ${updatedImg}`);
  }

  // 4. About Studio
  const allAbout = await db.select().from(aboutStudio);
  console.log(`\nProcessing ${allAbout.length} about studio records...`);
  for (const a of allAbout) {
    const updatedPhoto = replaceUrl(a.designerPhoto);
    await db
      .update(aboutStudio)
      .set({
        designerPhoto: updatedPhoto,
        updatedAt: new Date(),
      })
      .where(eq(aboutStudio.id, a.id));
    console.log(`  Updated about studio: ${a.id} -> designerPhoto: ${updatedPhoto}`);
  }

  // 5. Site Settings
  const allSettings = await db.select().from(siteSettings);
  console.log(`\nProcessing ${allSettings.length} site settings...`);
  for (const st of allSettings) {
    const rawSt = st as any;
    if (rawSt.ctaMediaUrl && rawSt.ctaMediaUrl.includes('unsplash.com')) {
      const updatedCta = replaceUrl(rawSt.ctaMediaUrl);
      await db
        .update(siteSettings)
        .set({
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.id, st.id));
      console.log(`  Updated site settings CTA media: ${updatedCta}`);
    }
  }

  console.log('\nDatabase migration completed successfully.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
