import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gsmhub.com';
const SITE_NAME = 'GSMHub';

interface SeoProps {
  title: string;
  description: string;
  path: string;
  imageUrl?: string;
  type?: 'website' | 'article';
}

/**
 * Generates standard Next.js Metadata object including OpenGraph and Twitter tags
 */
export function generateMetadata({
  title,
  description,
  path,
  imageUrl,
  type = 'website',
}: SeoProps): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} | ${SITE_NAME}`;
  const defaultImage = `${SITE_URL}/images/og-default.jpg`;
  const finalImage = imageUrl || defaultImage;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: finalImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [finalImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Generates JSON-LD for Product schema (for Google Rich Results)
 */
export function generateProductJsonLd(device: any) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: device.name,
    image: device.imageUrl,
    description: device.description || `${device.name} full specifications, features, and price comparison.`,
    brand: {
      '@type': 'Brand',
      name: device.brand,
    },
    sku: device.slug,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/devices/${device.slug}`,
      priceCurrency: 'USD',
      price: device.latestPrice || '0.00',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
    },
    additionalProperty: device.specs?.slice(0, 10).map((spec: any) => ({
      '@type': 'PropertyValue',
      name: spec.key,
      value: spec.value,
    })) || [],
  };
}