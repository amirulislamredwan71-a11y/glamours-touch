/**
 * Image optimization utility for Glamour's Touch.
 * Formats image URLs to WebP format, applies Supabase Storage transformation parameters,
 * and sets responsive sizes to eliminate CLS and boost PageSpeed performance.
 */

export function optimizeImageUrl(url: string | null | undefined, width = 400, quality = 80): string {
  if (!url) return '/logo.webp';

  // 1. Supabase Storage URLs
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    const transformed = url.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    );
    const joiner = transformed.includes('?') ? '&' : '?';
    return `${transformed}${joiner}width=${width}&quality=${quality}&format=webp`;
  }

  // If already rendered via Supabase render API
  if (url.includes('supabase.co/storage/v1/render/image/public/')) {
    const joiner = url.includes('?') ? '&' : '?';
    return `${url}${joiner}width=${width}&quality=${quality}&format=webp`;
  }

  // 2. Unsplash Image URLs
  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?w=${width}&q=${quality}&fm=webp&auto=format`;
  }

  // 3. Local PNG/JPG assets that have WebP equivalents
  if (url === '/logo.png' || url === 'https://glamourstouch.com/logo.png') {
    return '/logo.webp';
  }
  if (url === '/hero-banner.png') {
    return '/hero-banner.webp';
  }

  return url;
}
