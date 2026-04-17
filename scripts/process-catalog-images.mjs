import sharp from 'sharp';
import { copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const SRC = "D:/glamour's touch product image & price list";
const DEST = 'D:/glamours touch/public/catalog-images';

await mkdir(DEST, { recursive: true });

// Image map: output filename → { file, crop? }
// crop: { top, left, width, height } as fractions (0-1) of original size
const images = [
  // GT-001: Dove Soap — clean
  { out: 'GT-001.jpg', file: "Glamour's Touch 001.jpeg" },
  // GT-002: Fiama Gel Bar — small but clean
  { out: 'GT-002.jpg', file: 'photo_6269357010742611573_019.jpg' },
  // GT-003: Fiama Shower Gel — clean
  { out: 'GT-003.jpg', file: 'photo_6269357010742611577_x013.jpg' },
  // GT-004: Dove Shampoo 1L — clean
  { out: 'GT-004.jpg', file: 'photo_6269357010742611580_x014.jpg' },
  // GT-006: Sunsilk Shampoo 1L — clean
  { out: 'GT-006.jpg', file: 'photo_6269357010742611578_x016.jpg' },
  // GT-007: TRESemmé Shampoo 1L — clean
  { out: 'GT-007.jpg', file: 'photo_6269357010742611579_x017.jpg' },
  // GT-009: Colgate Toothpaste — clean
  { out: 'GT-009.jpg', file: 'photo_6269357010742611572_x020.jpg' },
  // GT-010: Sesa Hair Oil 200ml — clean
  { out: 'GT-010.jpg', file: 'photo_6269357010742611571_x012.jpg' },
  // GT-011: Sesa Hair Oil 100ml — same image as 200ml
  { out: 'GT-011.jpg', file: 'photo_6269357010742611571_x012.jpg' },
  // GT-012: Fogg Body Spray — brand image (clean)
  { out: 'GT-012.jpg', file: 'photo_6269357010742611569_x011.jpg' },
  // GT-013: Fogg Master — same image
  { out: 'GT-013.jpg', file: 'photo_6269357010742611569_x011.jpg' },
  // GT-014: Code 360 Body Spray — clean
  { out: 'GT-014.jpg', file: 'WhatsApp Image 2026-04-03 .jpeg' },
  // GT-015: Envy Body Spray — clean
  { out: 'GT-015.jpg', file: 'photo_6269357010742611567_x010.jpg' },
  // GT-016: Clean & Clear 245g — clean product shot
  { out: 'GT-016.jpg', file: 'photo_6269357010742611566_x009.jpg' },
  // GT-017: Clean & Clear 100g — same
  { out: 'GT-017.jpg', file: 'photo_6269357010742611566_x009.jpg' },
  // GT-018: Clean & Clear 50g — same
  { out: 'GT-018.jpg', file: 'photo_6269357010742611566_x009.jpg' },
  // GT-019: Pond's Face Wash 100g — clean
  { out: 'GT-019.jpg', file: 'photo_6269357010742611581_x015.jpg' },
  // GT-020: Pond's Face Wash 50g — same
  { out: 'GT-020.jpg', file: 'photo_6269357010742611581_x015.jpg' },
  // GT-021: Muuchstac Face Wash — crop top-left (Beauty Orchestra) + bottom bar
  { out: 'GT-021.jpg', file: 'photo_6269357010742611562_x005.jpg', cropFrac: { top: 0.14, bottom: 0.18, left: 0, right: 0 } },
  // GT-022: Jovees Face Wash — clean
  { out: 'GT-022.jpg', file: 'photo_6269357010742611563_x006.jpg' },
  // GT-023: Garnier Men AcnoFight — crop bottom bar (Wellbeing)
  { out: 'GT-023.jpg', file: 'photo_6269357010742611564_x007.jpg', cropFrac: { top: 0, bottom: 0.24, left: 0, right: 0 } },
  // GT-024: Garnier Face Wash 50g — crop top-right watermark (water lotus)
  { out: 'GT-024.jpg', file: 'photo_6269357010742611558_x002.jpg', cropFrac: { top: 0, bottom: 0, left: 0, right: 0.30 } },
  // GT-025: Garnier Face Wash 100g — clean Vitamin C version
  { out: 'GT-025.jpg', file: 'photo_6269357010742611560_x003.jpg' },
  // GT-027: Nivea Men Dark Spot Face Wash — clean
  { out: 'GT-027.jpg', file: 'photo_6269357010742611559_001.jpg' },
];

async function processImage(entry) {
  const srcPath = path.join(SRC, entry.file);
  const destPath = path.join(DEST, entry.out);

  if (!existsSync(srcPath)) {
    console.warn(`  MISSING: ${entry.file}`);
    return null;
  }

  try {
    const img = sharp(srcPath);
    const meta = await img.metadata();
    const { width, height } = meta;

    if (entry.cropFrac) {
      const { top = 0, bottom = 0, left = 0, right = 0 } = entry.cropFrac;
      const cropLeft = Math.round(width * left);
      const cropTop = Math.round(height * top);
      const cropWidth = Math.round(width * (1 - left - right));
      const cropHeight = Math.round(height * (1 - top - bottom));

      await img
        .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
        .resize(800, 800, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
        .jpeg({ quality: 90 })
        .toFile(destPath);
    } else {
      await img
        .resize(800, 800, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
        .jpeg({ quality: 90 })
        .toFile(destPath);
    }

    console.log(`  ✓ ${entry.out}`);
    return `https://glamourstouch.com/catalog-images/${entry.out}`;
  } catch (err) {
    console.error(`  ✗ ${entry.out}: ${err.message}`);
    return null;
  }
}

console.log('Processing images...');
for (const entry of images) {
  await processImage(entry);
}

// Unsplash placeholders for missing products
const placeholders = {
  'GT-005.jpg': 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=800',
  'GT-008.jpg': 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=800',
  'GT-026.jpg': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
  'GT-028.jpg': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800',
  'GT-029.jpg': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800',
  'GT-030.jpg': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800',
};

// Generate CSV
const BASE_URL = 'https://glamourstouch.com/catalog-images';
const SHOP_URL = 'https://glamourstouch.com/shop';

function img(id) {
  const key = `${id}.jpg`;
  if (placeholders[key]) return placeholders[key];
  return `${BASE_URL}/${key}`;
}

const rows = [
  ['id','title','description','availability','condition','price','link','image_link','brand','category'],
  ['GT-001','Dove Beauty Bar Soap (125g)','Gentle moisturising beauty bar with 1/4 moisturising cream for softer and smoother skin.','in stock','new','160 BDT',SHOP_URL,img('GT-001'),'Dove','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
  ['GT-002','Fiama Gel Bar Soap (125g)','Premium moisturizing gel bar soap with skin conditioners for soft and glowing skin.','in stock','new','140 BDT',SHOP_URL,img('GT-002'),'Fiama','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
  ['GT-003','Fiama Body Shower Gel','Luxurious body shower gel with moisturising ingredients for soft and fresh skin.','in stock','new','310 BDT',SHOP_URL,img('GT-003'),'Fiama','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
  ['GT-004','Dove Hair Fall Rescue Shampoo (1 Liter)','Bio-Protein Care formula with amino protein to reduce hair fall and strengthen hair.','in stock','new','1520 BDT',SHOP_URL,img('GT-004'),'Dove','Health & Beauty > Personal Care > Hair Care'],
  ['GT-005','Head & Shoulders Anti-Dandruff Shampoo (1 Liter)','2-in-1 anti-dandruff shampoo for clean flake-free scalp and healthy hair.','in stock','new','1560 BDT',SHOP_URL,img('GT-005'),'Head & Shoulders','Health & Beauty > Personal Care > Hair Care'],
  ['GT-006','Sunsilk Black Shine Shampoo (1 Liter)','With Henna Oil Pearl and Vitamin E for shiny dark black hair.','in stock','new','1490 BDT',SHOP_URL,img('GT-006'),'Sunsilk','Health & Beauty > Personal Care > Hair Care'],
  ['GT-007','TRESemmé Keratin Smooth Shampoo (1 Liter)','Keratin + Argan Oil formula for up to 72H frizz control and salon-quality smoothness.','in stock','new','1510 BDT',SHOP_URL,img('GT-007'),'TRESemmé','Health & Beauty > Personal Care > Hair Care'],
  ['GT-008','L\'Oréal Shampoo (1 Liter)','Advanced hair care shampoo for strong healthy and shiny hair with daily use.','in stock','new','1290 BDT',SHOP_URL,img('GT-008'),'L\'Oréal','Health & Beauty > Personal Care > Hair Care'],
  ['GT-009','Colgate Strong Teeth Toothpaste (175g)','Strengthens teeth with calcium boost formula for complete cavity protection.','in stock','new','170 BDT',SHOP_URL,img('GT-009'),'Colgate','Health & Beauty > Personal Care > Oral Care'],
  ['GT-010','Sesa Ayurvedic Hair Oil (200ml)','Reduces hair fall and supports hair growth with pure natural ayurvedic formula.','in stock','new','520 BDT',SHOP_URL,img('GT-010'),'Sesa','Health & Beauty > Personal Care > Hair Care'],
  ['GT-011','Sesa Ayurvedic Hair Oil (100ml)','Reduces hair fall and supports hair growth with pure natural ayurvedic formula.','in stock','new','260 BDT',SHOP_URL,img('GT-011'),'Sesa','Health & Beauty > Personal Care > Hair Care'],
  ['GT-012','Fogg Scent Body Spray','Long-lasting fragrance body spray. No gas — more perfume for all-day freshness.','in stock','new','350 BDT',SHOP_URL,img('GT-012'),'Fogg','Health & Beauty > Personal Care > Fragrance'],
  ['GT-013','Fogg Master Body Spray','Premium long-lasting bold fragrance body spray for confident freshness.','in stock','new','350 BDT',SHOP_URL,img('GT-013'),'Fogg','Health & Beauty > Personal Care > Fragrance'],
  ['GT-014','Wild Stone Code 360 Body Spray (120ml)','Premium masculine body perfume with rich fragrance for powerful all-day freshness.','in stock','new','390 BDT',SHOP_URL,img('GT-014'),'Wild Stone','Health & Beauty > Personal Care > Fragrance'],
  ['GT-015','Envy Natural Spray Body Perfume (60ml)','Natural spray eau de parfum for women with elegant long-lasting fragrance.','in stock','new','380 BDT',SHOP_URL,img('GT-015'),'Envy','Health & Beauty > Personal Care > Fragrance'],
  ['GT-016','Clean & Clear Foaming Face Wash (245g)','Oil-free foaming face wash that removes excess oil and unclogs pores for fresh clear skin.','in stock','new','530 BDT',SHOP_URL,img('GT-016'),'Clean & Clear','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
  ['GT-017','Clean & Clear Foaming Face Wash (100g)','Oil-free foaming face wash that removes excess oil and unclogs pores for fresh clear skin.','in stock','new','340 BDT',SHOP_URL,img('GT-017'),'Clean & Clear','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
  ['GT-018','Clean & Clear Foaming Face Wash (50g)','Oil-free foaming face wash that removes excess oil and unclogs pores for fresh clear skin.','in stock','new','190 BDT',SHOP_URL,img('GT-018'),'Clean & Clear','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
  ['GT-019','Pond\'s Bright Beauty Face Wash (100g)','With Niacinamide (Vitamin B3) for anti-dullness and clinically proven brightness.','in stock','new','320 BDT',SHOP_URL,img('GT-019'),'Pond\'s','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
  ['GT-020','Pond\'s Bright Beauty Face Wash (50g)','With Niacinamide (Vitamin B3) for anti-dullness and clinically proven brightness.','in stock','new','170 BDT',SHOP_URL,img('GT-020'),'Pond\'s','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
  ['GT-021','Muuchstac Ocean Face Wash (100ml)','SLS and paraben free face wash with essence of ocean for clean fresh skin.','in stock','new','220 BDT',SHOP_URL,img('GT-021'),'Muuchstac','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
  ['GT-022','Jovees Strawberry Face Wash (120ml)','Herbal face wash with strawberry for sheer moisture and glowing skin. Paraben free.','in stock','new','320 BDT',SHOP_URL,img('GT-022'),'Jovees','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
  ['GT-023','Garnier Men AcnoFight Face Wash (50g)','Anti-pimple face wash that fights 99.9% pimple causing germs with salicylic active.','in stock','new','220 BDT',SHOP_URL,img('GT-023'),'Garnier','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
  ['GT-024','Garnier Bright Complete Face Wash (50g)','Vitamin C face wash with lemon essence to reduce dullness and brighten skin.','in stock','new','170 BDT',SHOP_URL,img('GT-024'),'Garnier','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
  ['GT-025','Garnier Bright Complete Vitamin C Face Wash (100g)','Advanced Vitamin C + Lemon face wash for deep cleansing and visible brightness.','in stock','new','330 BDT',SHOP_URL,img('GT-025'),'Garnier','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
  ['GT-026','Mamaearth Face Wash','Natural plant-based face wash for clean bright and healthy skin.','in stock','new','320 BDT',SHOP_URL,img('GT-026'),'Mamaearth','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
  ['GT-027','Nivea Men Dark Spot Reduction Face Wash (100g)','10x Vitamin C Effect for clean clear skin and dark spot reduction.','in stock','new','320 BDT',SHOP_URL,img('GT-027'),'Nivea','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
  ['GT-028','Nivea Soft Moisturising Cream (25g)','Refreshing moisturising cream with Jojoba Oil and Vitamin E for face hands and body.','in stock','new','120 BDT',SHOP_URL,img('GT-028'),'Nivea','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
  ['GT-029','Nivea Soft Moisturising Cream (50g)','Refreshing moisturising cream with Jojoba Oil and Vitamin E for face hands and body.','in stock','new','210 BDT',SHOP_URL,img('GT-029'),'Nivea','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
  ['GT-030','Nivea Soft Moisturising Cream (100g)','Refreshing moisturising cream with Jojoba Oil and Vitamin E for face hands and body.','in stock','new','400 BDT',SHOP_URL,img('GT-030'),'Nivea','Health & Beauty > Personal Care > Cosmetics > Skin Care'],
];

const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');

import { writeFile } from 'fs/promises';
await writeFile('D:/glamours touch/facebook-catalog.csv', csv, 'utf8');
console.log('\n✓ facebook-catalog.csv updated with real image URLs');
console.log(`✓ ${images.length} images processed → public/catalog-images/`);
