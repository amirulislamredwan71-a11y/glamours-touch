import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SITE_NAME = "Glamour's Touch";
const BASE_URL  = 'https://glamourstouch.com';
const DEFAULT_IMG = `${BASE_URL}/catalog-images/carousel-2.png`;
const DEFAULT_DESC = "Glamour's Touch — Bangladesh এর সেরা Korean skincare shop। 100% authentic Korean beauty products। Order: 01712-426871 | WhatsApp: +880 1712-426871";

export const SEO = ({ title, description, image, url, type = 'website' }: SEOProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Korean Skincare Bangladesh`;
  const desc  = description || DEFAULT_DESC;
  const img   = image || DEFAULT_IMG;
  const canonical = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type"        content={type} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image"       content={img} />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="bn_BD" />

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image"       content={img} />
    </Helmet>
  );
};

export default SEO;
