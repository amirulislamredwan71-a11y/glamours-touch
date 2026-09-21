import fs from 'fs';
import sharp from 'sharp';

async function generateFavicons() {
  const logoBuf = await sharp('public/logo.png').resize(64, 64).png().toBuffer();
  const b64 = logoBuf.toString('base64');

  // 1. Updated favicon.svg with authentic GT circular gold logo
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <image href="data:image/png;base64,${b64}" x="0" y="0" width="64" height="64" />
</svg>`;
  fs.writeFileSync('public/favicon.svg', svg, 'utf8');
  console.log('✅ Generated public/favicon.svg with authentic GT logo');

  // 2. Ensure favicon-32x32.png, favicon-16x16.png, favicon.png, apple-touch-icon.png
  await sharp('public/logo.png').resize(32, 32).png().toFile('public/favicon-32x32.png');
  await sharp('public/logo.png').resize(16, 16).png().toFile('public/favicon-16x16.png');
  await sharp('public/logo.png').resize(48, 48).png().toFile('public/favicon.png');
  await sharp('public/logo.png').resize(180, 180).png().toFile('public/apple-touch-icon.png');
  
  // Also create a copy as favicon.ico
  fs.copyFileSync('public/favicon-32x32.png', 'public/favicon.ico');
  console.log('✅ Generated all crisp authentic GT favicon assets');
}

generateFavicons();
