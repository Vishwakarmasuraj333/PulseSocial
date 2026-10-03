const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const baseImagePath = 'C:/Users/imdee/.gemini/antigravity-ide/brain/2de2abc8-ce51-4ad1-9029-7829e6973d49/.user_uploaded/media_1791022694425.png';
  
  // The 6th icon (Blogger) in media_1791022694425.png:
  // absLeft: 855, absTop: 716, width: 64, height: 64.
  // With glow halo, the icon bounding box is 86x86 centered around (855 + 32 = 887, 716 + 32 = 748).
  // So a 96x96 canvas offset by (887 - 48 = 839, 748 - 48 = 700).

  const snapchatSvg = `
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Soft Outer Halo matching Pinterest / Instagram / LinkedIn -->
    <filter id="halo" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Glowing outer aura -->
  <rect x="16" y="16" width="64" height="64" rx="14" fill="#FFFFFF" opacity="0.65" filter="url(#halo)" />

  <!-- Snapchat Official Vibrant Yellow Rounded Card -->
  <rect x="16" y="16" width="64" height="64" rx="14" fill="#FFFC00" stroke="#FFFFFF" stroke-width="1.8" />

  <!-- Official Snapchat Ghost Glyph in Center -->
  <g transform="translate(26, 24) scale(1.85)">
    <path
      d="M12 4c-3.1 0-5 2.3-5 5 0 .9.2 1.9.6 2.6-.4.2-1 .4-1.3.8-.3.3-.2.7 0 .8.6.3 1.5.1 2.2.9.5.5.3 1.4.1 2-.4 1-1.6 1.3-2.2 1.5-.3.1-.4.4-.2.6.4.3 1.6.4 2.6.3.4 0 1 .2 1.4.6.9.9 1.5.2 2.7.2 1.2 0 1.8.7 2.7-.2.4-.4 1-.6 1.4-.6 1 .1 2.2 0 2.6-.3.2-.2.1-.5-.2-.6-.6-.2-1.8-.5-2.2-1.5-.2-.6-.4-1.5.1-2 .7-.8 1.6-.6 2.2-.9.2-.1.3-.5 0-.8-.3-.4-.9-.6-1.3-.8.4-.7.6-1.7.6-2.6 0-2.7-1.9-5-5-5z"
      fill="#FFFFFF"
      stroke="#18181B"
      stroke-width="1.1"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  </g>
</svg>
`;

  const snapchatBuffer = await sharp(Buffer.from(snapchatSvg))
    .png()
    .toBuffer();

  // First, we can patch the region under Blogger icon with the clean purple background #9371D0
  // to ensure no residual orange pixels bleed out:
  const patchWidth = 96;
  const patchHeight = 96;
  const patchX = 839;
  const patchY = 700;

  const purplePatch = await sharp({
    create: {
      width: patchWidth,
      height: patchHeight,
      channels: 4,
      background: { r: 147, g: 113, b: 208, alpha: 1.0 }
    }
  }).png().toBuffer();

  const finalImage = await sharp(baseImagePath)
    .composite([
      {
        input: purplePatch,
        left: patchX,
        top: patchY
      },
      {
        input: snapchatBuffer,
        left: patchX,
        top: patchY
      }
    ])
    .png({ quality: 100, compressionLevel: 6 })
    .toBuffer();

  // Save to target paths
  const publicHeroPath = path.resolve('public/images/auth_specialist_hero.png');
  const artifactPreviewPath = 'C:/Users/imdee/.gemini/antigravity-ide/brain/2de2abc8-ce51-4ad1-9029-7829e6973d49/auth_specialist_preview.png';

  fs.writeFileSync(publicHeroPath, finalImage);
  fs.writeFileSync(artifactPreviewPath, finalImage);

  console.log('Successfully composited Snapchat icon into auth_specialist_hero.png & preview!');
}

main().catch(console.error);
