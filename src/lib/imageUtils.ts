/**
 * Image optimization utility for Glamour's Touch.
 * Transforms Supabase Storage and external image assets to optimized,
 * bandwidth-efficient formats (WebP/AVIF) on the edge CDN.
 */

export function optimizeImageUrl(url: string | null | undefined, width = 380, quality = 75): string {
  if (!url) return '/logo.webp';

  // 1. Supabase Storage Image Transformation (Edge Render WebP/JPEG)
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    const transformed = url.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    );
    const separator = transformed.includes('?') ? '&' : '?';
    return `${transformed}${separator}width=${width}&quality=${quality}&resize=contain`;
  }

  // 2. Unsplash Image URLs - WebP transformation
  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?w=${width}&q=${quality}&fm=webp&auto=format`;
  }

  // 3. Local PNG/JPG assets that have WebP equivalents
  if (url === '/logo.png' || url === 'https://glamourstouch.com/logo.png' || url === 'https://www.glamourstouch.com/logo.png') {
    return '/logo.webp';
  }
  if (url === '/hero-banner.png' || url === 'https://glamourstouch.com/hero-banner.png' || url === 'https://www.glamourstouch.com/hero-banner.png') {
    return '/hero-banner.webp';
  }
  if (url === '/gt-watermark-logo-transparent.png') {
    return '/gt-watermark-logo-transparent.webp';
  }

  return url;
}

