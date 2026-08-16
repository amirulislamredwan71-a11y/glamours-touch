import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertToTransparentPng() {
  const inputPath = path.join(__dirname, '../public/gt-watermark-logo-new.jpg');
  const outputPath = path.join(__dirname, '../public/gt-watermark-logo-transparent.png');

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixelCount = info.width * info.height;
  for (let i = 0; i < pixelCount; i++) {
    const offset = i * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];

    // Calculate brightness / luminance
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

    // Threshold for black background removal
    if (brightness < 45 && r < 50 && g < 50 && b < 50) {
      data[offset + 3] = 0; // 100% transparent alpha!
    } else {
      // Smooth feathering edge transition
      if (brightness < 80) {
        const factor = (brightness - 45) / 35;
        data[offset + 3] = Math.round(255 * factor);
      }
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toFile(outputPath);

  console.log(`✅ 100% Transparent PNG Created Successfully at: ${outputPath}`);
}

convertToTransparentPng().catch(console.error);
