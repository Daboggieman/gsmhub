// Affiliate link generation helpers.
//
// Only well-documented tracking parameters are appended (e.g. Amazon's
// `tag=`); for other retailers the generator builds a product search URL
// so the admin can paste their program's tracked deep link if they have
// one. Nothing here invents tracking schemes.

export interface AffiliatePlatform {
  id: string;
  label: string;
  /** Host the generated link points at. */
  host: string;
  idPlaceholder: string;
  buildUrl: (query: string, affiliateId: string) => string;
}

export const AFFILIATE_PLATFORMS: AffiliatePlatform[] = [
  {
    id: 'amazon',
    label: 'Amazon',
    host: 'amazon.com',
    idPlaceholder: 'Associates tag (e.g. gsmhub-20)',
    buildUrl: (query, tag) =>
      `https://www.amazon.com/s?k=${encodeURIComponent(query)}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`,
  },
  {
    id: 'jumia',
    label: 'Jumia',
    host: 'jumia.com.ng',
    idPlaceholder: 'Affiliate ID (optional)',
    buildUrl: (query) =>
      `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(query)}`,
  },
  {
    id: 'flipkart',
    label: 'Flipkart',
    host: 'flipkart.com',
    idPlaceholder: 'Affiliate ID (optional)',
    buildUrl: (query) =>
      `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: 'google-shopping',
    label: 'Google Shopping',
    host: 'google.com',
    idPlaceholder: 'No affiliate ID needed',
    buildUrl: (query) =>
      `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`,
  },
];

export function getAffiliatePlatform(id: string): AffiliatePlatform | undefined {
  return AFFILIATE_PLATFORMS.find((p) => p.id === id);
}
