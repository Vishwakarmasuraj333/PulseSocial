const sharp = require('sharp');

async function run() {
  const inputPath = 'C:/Users/imdee/.gemini/antigravity-ide/brain/da923cdb-a9f3-4b2a-83c8-9e046623b962/.user_uploaded/media_1789973619244.png';

  // Exact center of the round avatar:
  // In 1024x576:
  // Center X = 506
  // Center Y = 304
  // Size = 64x64
  const left = 506 - 32; // 474
  const top = 304 - 32;  // 272
  const size = 64;

  const outputPath = 'C:/Users/imdee/.gemini/antigravity-ide/scratch/pulsesocial/public/images/brown_monkey_avatar.jpg';

  await sharp(inputPath)
    .extract({ left, top, width: size, height: size })
    .resize(300, 300, { kernel: 'lanczos3' })
    .jpeg({ quality: 98 })
    .toFile(outputPath);

  console.log('Fine-tuned crop saved to:', outputPath);
}

run().catch(console.error);
