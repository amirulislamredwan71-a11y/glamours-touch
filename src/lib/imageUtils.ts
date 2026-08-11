/**
 * Image optimization utility for Glamour's Touch.
 * Ensures WebP format for Unsplash & local assets, and preserves direct working URLs
 * for Supabase Storage objects to prevent 404 image load failures.
 */

export function optimizeImageUrl(url: string | null | undefined, width = 400, quality = 80): string {
  if (!url) return '/logo.webp';

  // 1. Unsplash Image URLs - WebP transformation
  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?w=${width}&q=${quality}&fm=webp&auto=format`;
  }

  // 2. Local PNG/JPG assets that have WebP equivalents
  if (url === '/logo.png' || url === 'https://glamourstouch.com/logo.png') {
    return '/logo.webp';
  }
  if (url === '/hero-banner.png') {
    return '/hero-banner.webp';
  }

  // 3. Supabase Storage & external URLs — return direct valid URL
  return url;
}
