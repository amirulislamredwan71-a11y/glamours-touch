import fs from 'fs';
import sharp from 'sharp';

async function generateFavicons() {
  console.log('Generating crisp circular gold GT favicons...');
  
  // Use gt-watermark-logo-transparent.png (transparent background)
  const src = fs.existsSync('public/gt-watermark-logo-transparent.png') 
    ? 'public/gt-watermark-logo-transparent.png' 
    : 'public/logo.png';

  const baseBuf = await sharp(src).resize(512, 512).png().toBuffer();

  await sharp(baseBuf).resize(16, 16).png().toFile('public/favicon-16x16.png');
  await sharp(baseBuf).resize(32, 32).png().toFile('public/favicon-32x32.png');
  await sharp(baseBuf).resize(48, 48).png().toFile('public/favicon.png');
  await sharp(baseBuf).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  await sharp(baseBuf).resize(192, 192).png().toFile('public/logo-192.png');
  await sharp(baseBuf).resize(512, 512).png().toFile('public/logo-512.png');
  
  // Favicon.ico
  const icoBuf = await sharp(baseBuf).resize(32, 32).png().toBuffer();
  fs.writeFileSync('public/favicon.ico', icoBuf);

  // SVG version
  const b64 = (await sharp(baseBuf).resize(128, 128).png().toBuffer()).toString('base64');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <image href="data:image/png;base64,${b64}" x="0" y="0" width="128" height="128" />
</svg>`;
  fs.writeFileSync('public/favicon.svg', svg, 'utf8');

  console.log('✅ Generated all favicons successfully!');
}

generateFavicons();
