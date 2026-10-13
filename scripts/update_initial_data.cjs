const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'initialData.ts');
let content = fs.readFileSync(filePath, 'utf8');

const URL_MAP = {
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

let replacedCount = 0;
content = content.replace(/https:\/\/images\.unsplash\.com\/photo-[^'"\s\\]+/g, (matched) => {
  for (const [photoId, localPath] of Object.entries(URL_MAP)) {
    if (matched.includes(photoId)) {
      replacedCount++;
      return localPath;
    }
  }
  return matched;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Replaced ${replacedCount} external URLs in initialData.ts with local assets.`);
