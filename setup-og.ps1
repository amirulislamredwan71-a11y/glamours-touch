# Run this from: D:\glamours touch\
# Command: powershell -ExecutionPolicy Bypass -File setup-og.ps1

Write-Host "Setting up OG tags..." -ForegroundColor Cyan

# Step 1: Create api folder
New-Item -ItemType Directory -Force -Path "api" | Out-Null
Write-Host "✓ api/ folder created" -ForegroundColor Green

# Step 2: Write vercel.json
@'
{
  "rewrites": [
    {
      "source": "/product/:id",
      "has": [
        {
          "type": "header",
          "key": "user-agent",
          "value": ".*(facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|TelegramBot|bot|crawler|spider).*"
        }
      ],
      "destination": "/api/og?id=:id"
    },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
'@ | Set-Content -Path "vercel.json" -Encoding UTF8
Write-Host "✓ vercel.json updated" -ForegroundColor Green

# Step 3: Write api/og.ts
@'
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (!id || typeof id !== "string") return res.status(400).send("Missing id");

  const { data: p } = await supabase
    .from("products")
    .select("id, name, brand, price, image, description")
    .eq("id", id)
    .single();

  if (!p) return res.status(404).send("Not found");

  const plainDesc = p.description?.replace(/<[^>]*>/g, "").slice(0, 120) ?? "";
  const pageUrl   = `https://glamourstouch.com/product/${p.id}`;
  const imageUrl  = `https://res.cloudinary.com/dgidarjkt/image/fetch/q_auto,f_auto/${encodeURIComponent(p.image)}`;
  const title     = `${p.name} - Glamour's Touch`;
  const desc      = `${p.brand} - ${p.price.toLocaleString()} BDT. ${plainDesc}`;

  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <meta property="og:title"       content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(desc)}" />
  <meta property="og:image"       content="${imageUrl}" />
  <meta property="og:url"         content="${pageUrl}" />
  <meta property="og:type"        content="product" />
  <meta property="og:site_name"   content="Glamour's Touch" />
  <meta property="product:price:amount"   content="${p.price}" />
  <meta property="product:price:currency" content="BDT" />
  <meta name="twitter:card"  content="summary_large_image" />
  <meta name="twitter:image" content="${imageUrl}" />
  <script>window.location.href="/product/${p.id}";</script>
</head>
<body>
  <a href="/product/${p.id}">${escapeHtml(p.name)}</a>
</body>
</html>`);
}
'@ | Set-Content -Path "api/og.ts" -Encoding UTF8
Write-Host "✓ api/og.ts created" -ForegroundColor Green

# Step 4: Deploy
Write-Host ""
Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
vercel --prod

Write-Host ""
Write-Host "ALL DONE! Test here:" -ForegroundColor Green
Write-Host "https://developers.facebook.com/tools/debug/" -ForegroundColor Yellow
