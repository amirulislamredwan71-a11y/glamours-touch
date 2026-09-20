import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  robots?: string;
  breadcrumbs?: BreadcrumbItem[];
  schema?: Record<string, any> | Record<string, any>[];
}

const SITE_NAME = "Glamour's Touch";
const BASE_URL  = 'https://glamourstouch.com';
const DEFAULT_IMG = `${BASE_URL}/logo.png`;
const DEFAULT_DESC = "Shop 100% authentic Korean skincare, K-Beauty serums, sunscreens, cleansers & creams in Bangladesh. Fast delivery in Dhaka & across BD with cash on delivery.";
const DEFAULT_KEYWORDS = "Korean skincare Bangladesh, K-Beauty Dhaka, authentic Korean cosmetics, AXIS-Y dark spot serum price in BD, Beauty of Joseon sunscreen BD, COSRX snail mucin Bangladesh, DABO snail cream, Korean glass skin routine";

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords,
  author = "Glamour's Touch",
  publishedTime,
  modifiedTime,
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  breadcrumbs,
  schema
}) => {
  const fullTitle = title 
    ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`) 
    : `${SITE_NAME} | 100% Authentic Korean Skincare & Beauty Bangladesh`;
  
  const desc = description || DEFAULT_DESC;
  const img = image 
    ? (image.startsWith('http') ? image : `${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`) 
    : DEFAULT_IMG;
  const canonical = url 
    ? (url.startsWith('http') ? url : `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`) 
    : BASE_URL;
  const currentKeywords = keywords || DEFAULT_KEYWORDS;

  // Build breadcrumbs JSON-LD if provided
  const breadcrumbsSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((b, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": b.name,
      "item": b.item.startsWith('http') ? b.item : `${BASE_URL}${b.item.startsWith('/') ? '' : '/'}${b.item}`
    }))
  } : null;

  // Combine schemas
  const allSchemas: Record<string, any>[] = [];
  if (breadcrumbsSchema) allSchemas.push(breadcrumbsSchema);
  if (schema) {
    if (Array.isArray(schema)) {
      allSchemas.push(...schema);
    } else {
      allSchemas.push(schema);
    }
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={desc} />
      <meta name="keywords" content={currentKeywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <link rel="canonical" href={canonical} />

      {/* Multilingual & Regional Alternate Links */}
      <link rel="alternate" hrefLang="bn" href={canonical} />
      <link rel="alternate" hrefLang="en-BD" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:image:secure_url" content={img} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="bn_BD" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Open Graph Article Specifics */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@glamourstouch" />
      <meta name="twitter:creator" content="@glamourstouch" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* Structured Data (JSON-LD) */}
      {allSchemas.map((s, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
