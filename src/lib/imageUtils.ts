/**
 * Image optimization utility for Glamour's Touch.
 * Ensures direct high-res asset delivery from Supabase Storage and local assets
 * without 404 image load failures.
 */

export function optimizeImageUrl(url: string | null | undefined, _width = 400, quality = 80): string {
  if (!url) return '/logo.webp';

  // 1. Unsplash Image URLs - WebP transformation
  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?w=${_width}&q=${quality}&fm=webp&auto=format`;
  }

  // 2. Local PNG/JPG assets that have WebP equivalents
  if (url === '/logo.png' || url === 'https://glamourstouch.com/logo.png') {
    return '/logo.webp';
  }
  if (url === '/hero-banner.png') {
    return '/hero-banner.webp';
  }

  // 3. Direct valid URLs for Supabase Storage & local catalog images
  return url;
}
