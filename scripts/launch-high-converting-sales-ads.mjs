import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.META_SYSTEM_USER_TOKEN;
const AD_ACCOUNT_ID = 'act_958340800500122';
const PAGE_ID = '1002146686323797';
const GRAPH_BASE = 'https://graph.facebook.com/v19.0';

async function launchBestSellerSalesCampaign() {
  console.log('👑 [CEO AI Agent] Launching High-Converting Sales Campaign for Glamour\'s Touch...\n');

  if (!TOKEN) {
    console.error('❌ Missing META_SYSTEM_USER_TOKEN');
    return;
  }

  // 1. Unpause / Activate GT Designer Carousel Ad Campaign if exists
  console.log('1. Checking Campaign Statuses...');
  const campaignRes = await fetch(`${GRAPH_BASE}/${AD_ACCOUNT_ID}/campaigns?fields=id,name,status,objective&access_token=${TOKEN}`);
  const campaignData = await campaignRes.json();
  
  console.log('📦 Ad Account Campaigns:', JSON.stringify(campaignData, null, 2));

  // Find "GT — Trending Heroes Carousel [CTM]" or "GT — Try Glow FREE (Traffic) [Aura]"
  let targetCampaign = campaignData.data?.find(c => c.name.includes('Trending Heroes') || c.name.includes('GT —'));

  if (targetCampaign) {
    console.log(`\n🚀 Activating Target Sales Campaign ID: ${targetCampaign.id} (${targetCampaign.name})...`);
    const updateRes = await fetch(`${GRAPH_BASE}/${targetCampaign.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: TOKEN,
        status: 'ACTIVE'
      })
    });

    const updateData = await updateRes.json();
    console.log('📦 Campaign Update Result:', updateData);
    if (updateData.success) {
      console.log('✅ Campaign activated successfully!');
    }
  }

  // 2. Activate Adsets and Ads under the account
  console.log('\n2. Activating High-Converting Ad Sets...');
  const adsetRes = await fetch(`${GRAPH_BASE}/${AD_ACCOUNT_ID}/adsets?fields=id,name,status&access_token=${TOKEN}`);
  const adsetData = await adsetRes.json();

  if (adsetData.data) {
    for (const adset of adsetData.data) {
      if (adset.status !== 'ACTIVE') {
        console.log(` Activating Adset: ${adset.name} (ID: ${adset.id})...`);
        await fetch(`${GRAPH_BASE}/${adset.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: TOKEN, status: 'ACTIVE' })
        });
      }
    }
  }

  // 3. Activate Ads
  console.log('\n3. Activating Product Ad Creatives...');
  const adRes = await fetch(`${GRAPH_BASE}/${AD_ACCOUNT_ID}/ads?fields=id,name,status,campaign{name}&access_token=${TOKEN}`);
  const adData = await adRes.json();

  if (adData.data) {
    for (const ad of adData.data) {
      if (ad.name.includes('GT Designer Carousel') || ad.name.includes('Try Glow')) {
        console.log(` Activating Ad: ${ad.name} (ID: ${ad.id})...`);
        const res = await fetch(`${GRAPH_BASE}/${ad.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: TOKEN, status: 'ACTIVE' })
        });
        const d = await res.json();
        console.log(`   Result:`, d);
      }
    }
  }

  console.log('\n🎉 CEO Sales Campaign Optimization Complete!');
}

launchBestSellerSalesCampaign().catch(err => console.error('Error:', err));
