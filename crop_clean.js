const sharp = require('sharp');

async function run() {
  const inputPath = 'C:/Users/imdee/.gemini/antigravity-ide/brain/da923cdb-a9f3-4b2a-83c8-9e046623b962/.user_uploaded/media_1789973571153.png';
  const meta = await sharp(inputPath).metadata();
  console.log('Image meta:', meta.width, meta.height);

  // In media_1789973571153.png:
  // The avatar next to "Brownmonkeytv devloper" is around X: 328, Y: 399
  // Let's crop a 60x60 square around it
  const left = Math.round(meta.width * 0.320);
  const top = Math.round(meta.height * 0.380);
  const size = Math.round(meta.width * 0.035); // ~35px

  console.log('Cropping page avatar at:', left, top, size, size);

  const outputPath = 'C:/Users/imdee/.gemini/antigravity-ide/scratch/pulsesocial/public/images/clean_page_avatar.jpg';
  await sharp(inputPath)
    .extract({ left: 326, top: 395, width: 34, height: 34 })
    .resize(256, 256, { kernel: 'lanczos3' })
    .jpeg({ quality: 95 })
    .toFile(outputPath);

  console.log('Done');
}

run().catch(console.error);
