import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fmcltrjnuvuooarkvufn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY2x0cmpudXZ1b29hcmt2dWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzY3MDQsImV4cCI6MjA5MDcxMjcwNH0.PkSgBAZx41X4sZurfyOdxCVa01hkKTkyBhVkGzx_4y4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log('--- Step 1: Authenticating Admin ---');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'glamourstouch26@gmail.com',
    password: 'Harbor-Tiger-63$'
  });

  if (authError) {
    console.error('Authentication error:', authError);
    process.exit(1);
  }
  console.log('✅ Logged in as:', authData.user.email);

  console.log('--- Step 2: Fetching All Products ---');
  const { data: products, error: fetchError } = await supabase.from('products').select('*');
  if (fetchError || !products) {
    console.error('Fetch error:', fetchError);
    process.exit(1);
  }
  console.log(`Total products in catalog: ${products.length}`);

  const usedIds = new Set();
  const top100 = [];

  function findOne(brandPattern, namePattern, minPrice = 0) {
    const cands = products.filter(p => {
      if (usedIds.has(p.id)) return false;
      if ((p.price || 0) < minPrice) return false;
      const b = (p.brand || '').toLowerCase();
      const n = (p.name || '').toLowerCase().replace(/[\u2018\u2019]/g, "'");
      const matchB = !brandPattern || b.includes(brandPattern.toLowerCase());
      const matchN = typeof namePattern === 'string' ? n.includes(namePattern.toLowerCase()) : namePattern.test(n);
      return matchB && matchN;
    });
    if (cands.length === 0) return null;
    cands.sort((a, b) => (b.price || 0) - (a.price || 0));
    const chosen = cands[0];
    usedIds.add(chosen.id);
    return chosen;
  }

  function add(item, customPrice = null, customMarketPrice = null) {
    if (!item) {
      console.error('ERROR: Null item passed to add!');
      return;
    }
    const rank = top100.length + 1;
    const newPrice = customPrice !== null ? customPrice : item.price;
    const newMarketPrice = customMarketPrice !== null ? customMarketPrice : (item.market_price || Math.round(newPrice * 1.35));
    top100.push({
      rank,
      id: item.id,
      brand: item.brand,
      name: item.name,
      category: item.category,
      oldPrice: item.price,
      price: newPrice,
      oldMarketPrice: item.market_price,
      market_price: newMarketPrice
    });
  }

  // --- TOP 100 CURATION (BD K-BEAUTY DEMAND & PRESTIGE) ---
  // Ranks 1-10: Ultimate Mega-Bestsellers
  add(findOne('AXIS-Y', '50ml'), 1380, 1750); // 1. AXIS-Y Dark Spot Correcting Glow Serum 50ml
  add(findOne('Beauty of Joseon', 'relief sun: rice + probiotics', 1200), 1600, 2250); // 2. BOJ Relief Sun 50ml
  add(findOne('Cosrx', 'snail 96 mucin power essence 100'), 1650, 2250); // 3. COSRX Snail 96 Mucin 100ml
  add(findOne('Anua', 'heartleaf 77'), 780, 1150); // 4. Anua Heartleaf 77% Toner
  add(findOne('SKIN1004', 'madagascar centella ampoule 30 ml'), 890, 1300); // 5. SKIN1004 Centella Ampoule 30ml
  add(findOne('Cosrx', 'good morning gel cleanser 150'), 1050, 1600); // 6. COSRX Low pH Good Morning Cleanser 150ml
  add(findOne('Medicube', 'collagen jelly cream'), 2650, 3600); // 7. Medicube Collagen Jelly Cream 110ml
  add(findOne('Beauty of Joseon', 'glow serum propolis'), 1550, 2150); // 8. BOJ Glow Serum Propolis + Niacinamide 30ml
  add(findOne('Dr.Althea', '345 relief cream 50'), 2050, 2750); // 9. Dr.Althea 345 Relief Cream 50ml
  add(findOne('Illiyoon', 'ceramide ato concentrate cream 500'), 3600, 5800); // 10. Illiyoon Ceramide Cream 500ml

  // Ranks 11-20: Viral Core Favorites
  add(findOne('Anua', 'pore control cleansing oil 200'), 2200, 3200); // 11. Anua Pore Control Cleansing Oil 200ml
  add(findOne('Beauty of Joseon', 'ginseng + retinal revive eye serum'), 1600, 2200); // 12. BOJ Revive Eye Serum 30ml
  add(findOne('Cosrx', 'snail 92 all in one cream', 1200), 1650, 2400); // 13. COSRX Snail 92 Cream 100g
  add(findOne('SKIN1004', 'water-fit sun serum', 1000), 1550, 2250); // 14. SKIN1004 Hyalu-Cica Sun Serum 50ml
  add(findOne('Medicube', 'glutathione glow capsule cream'), 2450, 3250); // 15. Medicube Glutathione Glow Cream 50ml
  add(findOne('Isntree', 'watery sun gel'), 1500, 2150); // 16. Isntree Hyaluronic Acid Watery Sun Gel 50ml
  add(findOne('Some By Mi', '30 days miracle toner'), 2050, 2600); // 17. Some By Mi Miracle Toner 150ml
  add(findOne('Banila', 'clean it zero'), 1850, 2800); // 18. Banila Co Clean It Zero Original 100ml
  add(findOne('Laneige', 'water sleeping mask ex  70'), 1950, 2650); // 19. Laneige Water Sleeping Mask 70ml
  add(findOne('Cosrx', 'salicylic acid daily gentle cleanser 150'), 1000, 1500); // 20. COSRX Salicylic Acid Cleanser 150ml

  // Ranks 21-30: High-Performance Actives & Glowing Skin
  add(findOne('Cosrx', 'the niacinamide 15'), 2250, 2950); // 21. COSRX Niacinamide 15 Serum 20ml
  add(findOne('Cosrx', 'the vitamin c 23'), 1900, 2550); // 22. COSRX Vitamin C 23 Serum 20g
  add(findOne('Medicube', 'kojic acid turmeric vita capsule cream'), 2700, 3550); // 23. Medicube Kojic Acid Turmeric Cream 53g
  add(findOne('Medicube', 'txa niacinamide 15 serum'), 2050, 2550); // 24. Medicube TXA Niacinamide 15 Serum 30ml
  add(findOne('Medicube', 'pdrn pink peptide serum'), 2000, 2500); // 25. Medicube PDRN Pink Peptide Serum 30ml
  add(findOne('Beauty of Joseon', 'dynasty cream'), 2150, 3100); // 26. BOJ Dynasty Cream 50ml
  add(findOne('Beauty of Joseon', 'relief sun aqua-fresh'), 1650, 2300); // 27. BOJ Relief Sun Aqua-Fresh 50ml
  add(findOne('SKIN1004', 'tone brightening capsule ampoule', 1500), 2100, 2800); // 28. SKIN1004 Tone Brightening Ampoule 100ml
  add(findOne('SKIN1004', 'ampoule foam'), 1500, 2100); // 29. SKIN1004 Centella Ampoule Foam 125ml
  add(findOne('From', 'black rice toner 150', 1000), 2150, 3200); // 30. I'm From Black Rice Toner 150ml
  add(findOne('From', 'rice toner 150', 1000), 1950, 2750); // 31. I'm From Rice Toner 150ml
  add(findOne('From', 'mugwort essence'), 950, 1350); // 32. I'm From Mugwort Essence 30ml
  add(findOne('Beauty of Joseon', 'ginseng essence water', 1000), 1750, 2900); // 33. BOJ Ginseng Essence Water 150ml
  add(findOne('Beauty of Joseon', 'glow deep serum rice'), 1600, 2250); // 34. BOJ Glow Deep Serum Rice + Arbutin 30ml
  add(findOne('Cosrx', 'aha/bha clarifying treatment toner'), 650, 950); // 35. COSRX AHA/BHA Clarifying Toner
  add(findOne('Cosrx', 'bha blackhead power liquid', 1000), 1650, 2450); // 36. COSRX BHA Blackhead Power Liquid 100ml
  add(findOne('Innisfree', 'super volcanic pore clay mask'), 1800, 2550); // 37. Innisfree Super Volcanic Pore Clay Mask 100ml
  add(findOne('Banila', 'pore clarifying cleansing balm'), 1850, 2850); // 38. Banila Co Pore Clarifying Balm 100ml
  add(findOne('Missha', 'cotton sun block'), 880, 1150); // 39. Missha Cotton Sun Block SPF50+ 50ml
  add(findOne('Missha', 'soft finish sun milk'), 1250, 1850); // 40. Missha Soft Finish Sun Milk 70ml

  // Ranks 41-50: Soothing, Anti-Acne & Moisture Leaders
  add(findOne('The Face Shop', 'rice water bright cleansing cream'), 1900, 2850); // 41. TFS Rice Water Bright Cleansing Cream 400ml
  add(findOne('SKIN1004', 'tea-trica relief ampoule', 1500), 2350, 2900); // 42. SKIN1004 Tea-Trica Relief Ampoule 100ml
  add(findOne('SKIN1004', 'hyalu-cica blue serum'), 1180, 1650); // 43. SKIN1004 Hyalu-Cica Blue Serum 30ml
  add(findOne('Cosrx', 'oil-free ultra-moisturizing lotion'), 1500, 2600); // 44. COSRX Oil-Free Lotion 100ml
  add(findOne('Cosrx', 'ultimate nourishing rice overnight spa mask'), 1250, 2200); // 45. COSRX Rice Overnight Mask 60ml
  add(findOne('Kerasys', 'black bean oil shampoo'), 3100, 4500); // 46. Kerasys Black Bean Oil Shampoo 1L
  add(findOne('Dabo', 'baby powder perfume shampoo'), 1650, 2500); // 47. Dabo Baby Powder Perfume Shampoo 500ml
  add(findOne('Dabo', 'dear josephine floral perfume shampoo'), 1650, 2550); // 48. Dabo Floral Perfume Shampoo 500ml
  add(findOne('Ryo', 'hair loss expert care shampoo oily'), 2050, 3200); // 49. Ryo Hair Loss Shampoo Oily Scalp 400ml
  add(findOne('Ryo', 'damage care & nourishing shampoo'), 2000, 3250); // 50. Ryo Damage Care Shampoo 480ml

  // Ranks 51-60: Luxury Hair Care, Ceramide & Special Care Sets
  add(findOne('Holika Holika', 'damage care treatment'), 1450, 1950); // 51. Holika Holika Damage Care Treatment 200ml
  add(findOne('Raip', 'r3 argan hair oil'), 920, 1300); // 52. Raip R3 Argan Hair Oil 100ml
  add(findOne('Raip', 'moisture repair body lotion'), 1650, 2550); // 53. Raip Moisture Repair Body Lotion 500ml
  add(findOne('Illiyoon', 'ceramide ato concentrate cream 200'), 2150, 2900); // 54. Illiyoon Ceramide Cream 200ml
  add(findOne('Illiyoon', 'ceramide ato soothing gel'), 680, 1000); // 55. Illiyoon Ceramide Soothing Gel 30ml
  add(findOne('Dabo', 'collagen lifting skin care set'), 3600, 5200); // 56. Dabo Collagen Lifting Skin Care Set
  add(findOne('Anjo', '24k gold skin care 6 set'), 9200, 14500); // 57. Anjo 24K Gold Skin Care 6 Set
  add(findOne('Beaute', 'glutathione brightening tone up cream', 600), 820, 1100); // 58. Beaute Glutathione Tone Up Cream 45ml
  add(findOne('Beaute', 'underarm whitening cure cream'), 980, 1250); // 59. Beaute 3D Underarm Whitening Cure Cream 100ml
  add(findOne('Cloud 9', 'blanc de whitening cream'), 1500, 2200); // 60. Cloud 9 Blanc De Whitening Cream 50ml

  // Ranks 61-70: Whitening, Sun Protection & Masks
  add(findOne('FARMSTAY', 'collagen & hyaluronic acid all in one ampoule'), 1500, 2250); // 61. FARMSTAY Collagen Ampoule 250ml
  add(findOne('Lebelage', 'collagen no sebum foundation'), 1120, 1600); // 62. Lebelage Collagen Foundation SPF50+ 100ml
  add(findOne('Foodaholic', 'multi sun cream spf50+pa+++ 250'), 1700, 2200); // 63. Foodaholic Multi Sun Cream 250ml
  add(findOne('Missha', 'perfect cover bb cream'), 1380, 1750); // 64. Missha Perfect Cover BB Cream 50ml
  add(findOne('Some By Mi', 'snail truecica miracle repair'), 1550, 2150); // 65. Some By Mi Snail Truecica Repair Kit
  add(findOne('Beauty of Joseon', 'ground rice and honey glow mask'), 2350, 2850); // 66. BOJ Rice & Honey Glow Mask 150ml
  add(findOne('Beauty of Joseon', 'red bean refreshing pore mask'), 2100, 2850); // 67. BOJ Red Bean Pore Mask 140ml
  add(findOne('Beauty of Joseon', 'red bean water gel'), 1600, 2350); // 68. BOJ Red Bean Water Gel 100ml
  add(findOne('Beauty of Joseon', 'matte sun stick mugwort'), 1600, 2300); // 69. BOJ Matte Sun Stick Mugwort 18g
  add(findOne('Cosrx', 'alpha-arbutin 2 discoloration care serum'), 2450, 3450); // 70. COSRX Alpha-Arbutin 2 Serum 50ml

  // Ranks 71-80: Advanced Treatments & Premium Hair Care
  add(findOne('Cosrx', 'advanced snail radiance dual essence'), 1800, 3500); // 71. COSRX Snail Radiance Dual Essence 80ml
  add(findOne('Cosrx', 'advanced snail peptide eye cream'), 1800, 2900); // 72. COSRX Snail Peptide Eye Cream 25ml
  add(findOne('Cosrx', 'the vitamin c 13 serum'), 1700, 2300); // 73. COSRX Vitamin C 13 Serum 20ml
  add(findOne('Cosrx', 'centella water alcohol-free toner'), 1400, 2000); // 74. COSRX Centella Water Toner 150ml
  add(findOne('Cosrx', 'aloe soothing sun cream'), 1200, 1550); // 75. COSRX Aloe Soothing Sun Cream 50ml
  add(findOne('Mise En Scene', 'perfect serum original shampoo'), 2550, 3800); // 76. Mise En Scene Perfect Serum Shampoo 680ml
  add(findOne('Kerasys', 'devil\'s edition'), 2000, 2900); // 77. Kerasys Devil's Edition Mystic Blossom Shampoo 600ml
  add(findOne('K-Secret', 'seoul 1988 cleansing oil'), 1950, 2800); // 78. K-Secret Seoul 1988 Cleansing Oil 200ml
  add(findOne('GUERISSON', '9 complex cream'), 1700, 2400); // 79. GUERISSON 9 Complex Cream 70g
  add(findOne('Green', 'strong baby moisturizing intensive cream'), 2150, 2900); // 80. Green Finger Strong Baby Cream 300g

  // Ranks 81-90: Cult Korean Essentials & Toners
  add(findOne('Dabo', 'urea 10 silk foot therapy cream'), 680, 1000); // 81. Dabo Urea 10 Foot Therapy Cream 100ml
  add(findOne('AXIS-Y', 'dark spot correcting glow toner'), 1800, 2500); // 82. AXIS-Y Dark Spot Toner 125ml
  add(findOne('AXIS-Y', 'dark spot correcting glow cream'), 1650, 2200); // 83. AXIS-Y Dark Spot Cream 50ml
  add(findOne('AXIS-Y', 'vegan collagen eye serum'), 1580, 2250); // 84. AXIS-Y Vegan Collagen Eye Serum 10ml
  add(findOne('AXIS-Y', 'mini glow trio set'), 1120, 1600); // 85. AXIS-Y Mini Glow Trio Set
  add(findOne('Cosrx', 'all about snail kit'), 2150, 3350); // 86. COSRX All About Snail Kit
  add(findOne('Laneige', 'lip sleeping mask ex', 800), 1350, 1750); // 87. Laneige Lip Sleeping Mask EX 20g
  add(findOne('Mamonde', 'rose water toner  150'), 1200, 1850); // 88. Mamonde Rose Water Toner 150ml
  add(findOne('Innisfree', 'tone up no sebum sunscreen'), 1700, 2350); // 89. Innisfree Tone Up No Sebum Sunscreen 60ml
  add(findOne('Innisfree', 'cherry blossom glow jelly cream'), 1700, 2350); // 90. Innisfree Cherry Blossom Jelly Cream 50ml

  // Ranks 91-100: Daily Essentials, Cleansers, Masks & Barrier Care
  add(findOne('Innisfree', 'no-sebum mineral powder'), 980, 1350); // 91. Innisfree No-Sebum Mineral Powder 5g
  add(findOne('Innisfree', 'green tea amino hydrating cleansing foam 150'), 1200, 1650); // 92. Innisfree Green Tea Cleansing Foam 150g
  add(findOne('From', 'rice serum'), 1980, 2650); // 93. I'm From Rice Serum 30ml
  add(findOne('From', 'rice sunscreen'), 1620, 2250); // 94. I'm From Rice Sunscreen 50ml
  add(findOne('From', 'rice whip facial cleanser'), 1580, 2150); // 95. I'm From Rice Facial Cleanser 150ml
  add(findOne('Medicube', 'zero pore blackhead mud mask'), 2150, 2850); // 96. Medicube Zero Pore Mud Mask 100g
  add(findOne('Dr.Althea', '147 barrier cream'), 1950, 2600); // 97. Dr.Althea 147 Barrier Cream 50ml
  add(findOne('Kerasys', 'coconut oil shampoo'), 3100, 4500); // 98. Kerasys Coconut Oil Shampoo 1L
  add(findOne('Raip', 'r2 no wash keratin treatment'), 1380, 1850); // 99. Raip R2 Keratin Treatment 250ml
  add(findOne('Dabo', 'black snail retinal a+ solution ampoule'), 1180, 1650); // 100. Dabo Black Snail Retinal Ampoule 80ml

  console.log(`\nCurated exact Top 100 items count: ${top100.length}`);
  if (top100.length !== 100) {
    console.error('CRITICAL: Curated items count is not 100! Found:', top100.length);
    process.exit(1);
  }

  // Verify unique ranks
  const ranksSet = new Set(top100.map(t => t.rank));
  console.log(`Unique ranks count (should be 100): ${ranksSet.size}`);
  const idSet = new Set(top100.map(t => t.id));
  console.log(`Unique IDs count (should be 100): ${idSet.size}`);

  console.log('--- Step 3: Resetting All Products isFeatured & featured_rank ---');
  for (let i = 0; i < products.length; i += 50) {
    const chunk = products.slice(i, i + 50);
    const updatePromises = chunk.map(p => 
      supabase.from('products').update({ isFeatured: false, featured_rank: null }).eq('id', p.id)
    );
    await Promise.all(updatePromises);
  }
  console.log('✅ All existing product ranks reset.');

  console.log('--- Step 4: Applying Top 100 Ranks & Market Prices ---');
  for (const item of top100) {
    const { error: updateError } = await supabase
      .from('products')
      .update({
        isFeatured: true,
        featured_rank: item.rank,
        price: item.price,
        market_price: item.market_price
      })
      .eq('id', item.id);

    if (updateError) {
      console.error(`Error updating rank #${item.rank} (${item.name}):`, updateError);
    } else {
      console.log(`✅ Rank #${item.rank.toString().padStart(3, ' ')}: [${item.brand}] ${item.name} | ৳${item.price} (MRP ৳${item.market_price})`);
    }
  }

  console.log('\n--- Step 5: Verification of Updated Top 100 in Supabase ---');
  const { data: verifiedFeatured, error: verifyError } = await supabase
    .from('products')
    .select('id, name, brand, price, market_price, isFeatured, featured_rank')
    .eq('isFeatured', true)
    .order('featured_rank', { ascending: true });

  if (verifyError || !verifiedFeatured) {
    console.error('Verification failed:', verifyError);
  } else {
    console.log(`✅ Verified Featured Products Count in DB: ${verifiedFeatured.length}`);
    console.log('First 5 products in DB:');
    verifiedFeatured.slice(0, 5).forEach(p => console.log(`  #${p.featured_rank}: [${p.brand}] ${p.name} - ৳${p.price} (MRP ৳${p.market_price})`));
    console.log('Last 5 products in DB:');
    verifiedFeatured.slice(-5).forEach(p => console.log(`  #${p.featured_rank}: [${p.brand}] ${p.name} - ৳${p.price} (MRP ৳${p.market_price})`));
  }

  console.log('\n🎉 ALL 100 TOP PRODUCTS SERIALIZED AND PRICED SUCCESSFULLY!');
}

run().catch(console.error);
